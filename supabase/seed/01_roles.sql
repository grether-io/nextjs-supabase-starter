-- Seed File: 01_roles.sql
-- Description: Seeds role definitions with hierarchy levels
-- Auto-runs on `supabase db reset` when db.seed.enabled = true in config.toml

-- ============================================================================
-- 1. Clear existing data (for idempotent seeding)
-- ============================================================================

TRUNCATE public.user_roles_audit CASCADE;
TRUNCATE public.user_roles CASCADE;
TRUNCATE public.roles CASCADE;

-- ============================================================================
-- 2. Insert Role Definitions
-- ============================================================================

INSERT INTO public.roles (name, description, level) VALUES
    ('Guest', 'Read-only access to backend', 10),
    ('Contributor', 'Submit content for review', 30),
    ('Author', 'Create and publish own content', 50),
    ('Editor', 'Manage all content and media', 70),
    ('Admin', 'User management and settings', 90),
    ('SuperAdmin', 'Full system access', 100);

DO $$
BEGIN
    RAISE NOTICE '✓ Roles seeded successfully';
END $$;

