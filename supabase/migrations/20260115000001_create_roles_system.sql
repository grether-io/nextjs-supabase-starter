-- Migration: Create Role-Based Access Control (RBAC) System
-- Description: Creates roles, user_roles, and user_roles_audit tables with JWT claim sync
-- Date: 2026-01-15

-- ============================================================================
-- 1. Create Tables
-- ============================================================================

-- Roles table: Defines available roles with hierarchy levels
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    level INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table: Assigns roles to users (one role per user)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES auth.users(id)
);

-- Audit trail table: Tracks all role changes
CREATE TABLE IF NOT EXISTS public.user_roles_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role_id UUID REFERENCES public.user_roles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    role_id_old UUID REFERENCES public.roles(id),
    role_id_new UUID REFERENCES public.roles(id),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_user_role_id ON public.user_roles_audit(user_role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_changed_at ON public.user_roles_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_composite ON public.user_roles_audit(user_role_id, changed_at DESC);

-- ============================================================================
-- 3. Create Helper Functions
-- ============================================================================

-- Function to get current user's role level from JWT claims
CREATE OR REPLACE FUNCTION public.get_my_role_level()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role_level')::INTEGER,
        0
    );
$$;

-- Function to sync user role to JWT claims in auth.users.raw_app_metadata
CREATE OR REPLACE FUNCTION public.sync_user_role_to_jwt(
    p_user_id UUID,
    p_role_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_name TEXT;
    v_role_level INTEGER;
BEGIN
    -- Get role information
    SELECT name, level
    INTO v_role_name, v_role_level
    FROM public.roles
    WHERE id = p_role_id;

    -- Update user's app_metadata with role claims
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object(
            'role', v_role_name,
            'role_level', v_role_level
        )
    WHERE id = p_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_my_role_level() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_role_to_jwt(UUID, UUID) TO authenticated;

-- ============================================================================
-- 4. Create Triggers
-- ============================================================================

-- Trigger function: Auto-assign guest role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_guest_role_id UUID;
BEGIN
    -- Get guest role ID (level 10)
    SELECT id INTO v_guest_role_id
    FROM public.roles
    WHERE level = 10
    LIMIT 1;

    -- Insert user_role record
    IF v_guest_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id, created_by)
        VALUES (NEW.id, v_guest_role_id, NEW.id);

        -- Sync role to JWT claims
        PERFORM public.sync_user_role_to_jwt(NEW.id, v_guest_role_id);
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger function: Sync role changes to JWT and create audit trail
CREATE OR REPLACE FUNCTION public.handle_user_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_action TEXT;
    v_role_id_old UUID;
    v_role_id_new UUID;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_role_id_old := NULL;
        v_role_id_new := NEW.role_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_role_id_old := OLD.role_id;
        v_role_id_new := NEW.role_id;
    END IF;

    -- Sync role to JWT claims
    PERFORM public.sync_user_role_to_jwt(NEW.user_id, NEW.role_id);

    -- Insert audit trail record
    INSERT INTO public.user_roles_audit (
        user_role_id,
        action,
        role_id_old,
        role_id_new,
        changed_by
    ) VALUES (
        NEW.id,
        v_action,
        v_role_id_old,
        v_role_id_new,
        NEW.updated_by
    );

    RETURN NEW;
END;
$$;

-- Create trigger on user_roles
DROP TRIGGER IF EXISTS on_user_role_changed ON public.user_roles;
CREATE TRIGGER on_user_role_changed
    AFTER INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_role_change();

-- ============================================================================
-- 5. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_audit ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. Create RLS Policies
-- ============================================================================

-- Roles table policies
CREATE POLICY "Allow authenticated users to read roles"
    ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

-- User roles table policies
CREATE POLICY "Users can view their own role"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all lower-level user roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        public.get_my_role_level() >= 90
    );

CREATE POLICY "Admins can assign roles to lower-level users"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role_level() >= 90
    );

CREATE POLICY "Admins can update roles for lower-level users"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (
        public.get_my_role_level() >= 90
    )
    WITH CHECK (
        public.get_my_role_level() >= 90
    );

-- Audit trail policies
CREATE POLICY "Admins can view audit trail"
    ON public.user_roles_audit
    FOR SELECT
    TO authenticated
    USING (
        public.get_my_role_level() >= 90
    );

-- ============================================================================
-- 7. Comments
-- ============================================================================

COMMENT ON TABLE public.roles IS 'Available user roles with hierarchy levels';
COMMENT ON TABLE public.user_roles IS 'User role assignments (one role per user)';
COMMENT ON TABLE public.user_roles_audit IS 'Audit trail for all role changes';
COMMENT ON FUNCTION public.get_my_role_level() IS 'Extracts current user role level from JWT claims';
COMMENT ON FUNCTION public.sync_user_role_to_jwt(UUID, UUID) IS 'Syncs role to auth.users.raw_app_metadata for JWT claims';

