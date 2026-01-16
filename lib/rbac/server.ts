import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Role, UserWithRole, AuditLogPage, AuditLogEntry, UserRole } from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Extract user role from JWT claims in user.app_metadata
 */
export function getUserRoleFromJWT(user: User | null): UserRole | null {
  if (!user?.app_metadata?.role || !user?.app_metadata?.role_level) {
    return null;
  }

  return {
    name: user.app_metadata.role as string,
    level: user.app_metadata.role_level as number,
  };
}

/**
 * Check if admin can manage target user based on role hierarchy
 * Admin can only manage users with lower role level
 */
export function canManageUser(adminLevel: number, targetLevel: number): boolean {
  return adminLevel > targetLevel;
}

/**
 * Assign role to a user (updates user_roles table, triggers auto-sync to JWT)
 */
export async function assignRole(
  userId: string,
  roleId: string,
  assignedBy: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from("user_roles")
        .update({
          role_id: roleId,
          updated_at: new Date().toISOString(),
          updated_by: assignedBy,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: error.message };
      }
    } else {
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role_id: roleId,
        created_by: assignedBy,
        updated_by: assignedBy,
      });

      if (error) {
        console.error("Error inserting user role:", error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in assignRole:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all users with their roles, filtered by current user's role level
 * Admins cannot see SuperAdmins, etc.
 * @param currentUserLevel - The current user's role level
 * @param supabase - Regular Supabase client for database queries
 * @param adminClient - Admin Supabase client with service role for auth.admin operations
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 */
export async function getUsersWithRoles(
  currentUserLevel: number,
  supabase: SupabaseClient,
  adminClient?: SupabaseClient,
  page: number = 1,
  pageSize: number = 10
): Promise<{ users: UserWithRole[]; totalCount: number; totalPages: number }> {
  try {
    // Use admin client if provided, otherwise create one
    const authClient = adminClient || createAdminClient();

    // Query user_roles with role information, filtered by level
    const { data: userRoles, error: userRolesError } = await supabase
      .from("user_roles")
      .select(
        `
        user_id,
        role:roles (
          id,
          name,
          description,
          level,
          created_at
        )
      `
      )
      .lte("roles.level", currentUserLevel);

    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError);
      return { users: [], totalCount: 0, totalPages: 0 };
    }

    if (!userRoles || userRoles.length === 0) {
      return { users: [], totalCount: 0, totalPages: 0 };
    }

    // Filter by level in memory (since we can't always filter on joined table)
    const filteredUserRoles = userRoles.filter((userRole) => {
      const role = userRole.role as Role | any;
      return role && role.level <= currentUserLevel;
    });

    const totalCount = filteredUserRoles.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const paginatedUserRoles = filteredUserRoles.slice(offset, offset + pageSize);

    // Fetch user details from auth.users via admin API
    const users: UserWithRole[] = [];

    for (const userRole of paginatedUserRoles) {
      const role = userRole.role as Role | any;

      // Fetch individual user data using admin client
      const { data: userData, error: userError } = await authClient.auth.admin.getUserById(
        userRole.user_id
      );

      if (userError || !userData.user) {
        console.error(`Error fetching user ${userRole.user_id}:`, userError);
        continue;
      }

      const user = userData.user;

      users.push({
        id: user.id,
        email: user.email || "",
        user_metadata: {
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          display_name: user.user_metadata?.display_name,
        },
        role: role,
      });
    }

    return { users, totalCount, totalPages };
  } catch (err) {
    console.error("Unexpected error in getUsersWithRoles:", err);
    return { users: [], totalCount: 0, totalPages: 0 };
  }
}

/**
 * Get all available roles
 */
export async function getAllRoles(supabase: SupabaseClient): Promise<Role[]> {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("level", { ascending: true });

    if (error) {
      console.error("Error fetching roles:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error in getAllRoles:", err);
    return [];
  }
}

/**
 * Get paginated audit log with user and role information
 */
export async function getAuditLog(
  page: number = 1,
  pageSize: number = 50,
  supabase: SupabaseClient
): Promise<AuditLogPage> {
  try {
    const offset = (page - 1) * pageSize;

    // Get total count
    const { count } = await supabase
      .from("user_roles_audit")
      .select("*", { count: "exact", head: true });

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch audit entries with JOINs
    const { data: auditData, error } = await supabase
      .from("user_roles_audit")
      .select(
        `
        id,
        action,
        changed_at,
        user_role_id,
        role_id_old,
        role_id_new,
        changed_by,
        user_roles!user_roles_audit_user_role_id_fkey (
          user_id
        ),
        old_role:roles!user_roles_audit_role_id_old_fkey (
          name,
          level
        ),
        new_role:roles!user_roles_audit_role_id_new_fkey (
          name,
          level
        )
      `
      )
      .order("changed_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching audit log:", error);
      return {
        entries: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
      };
    }

    // Now fetch user emails via admin client (since auth.users is not accessible via regular client)
    const adminClient = createAdminClient();
    const entries: AuditLogEntry[] = [];

    for (const entry of auditData || []) {
      const userId = (entry.user_roles as any)?.user_id;
      const changedById = entry.changed_by;

      // Fetch user data
      let userEmail: string | null = null;
      let userDisplayName: string | null = null;

      if (userId) {
        const { data: userData } = await adminClient.auth.admin.getUserById(userId);
        if (userData?.user) {
          userEmail = userData.user.email || null;
          userDisplayName =
            userData.user.user_metadata?.display_name ||
            `${userData.user.user_metadata?.first_name || ""} ${userData.user.user_metadata?.last_name || ""}`.trim() ||
            null;
        }
      }

      // Fetch changed_by user data
      let changedByEmail: string | null = null;
      let changedByDisplayName: string | null = null;

      if (changedById) {
        const { data: changedByData } = await adminClient.auth.admin.getUserById(changedById);
        if (changedByData?.user) {
          changedByEmail = changedByData.user.email || null;
          changedByDisplayName =
            changedByData.user.user_metadata?.display_name ||
            `${changedByData.user.user_metadata?.first_name || ""} ${changedByData.user.user_metadata?.last_name || ""}`.trim() ||
            null;
        }
      }

      entries.push({
        id: entry.id,
        user_id: userId || "",
        user_email: userEmail,
        user_display_name: userDisplayName,
        action: entry.action as "INSERT" | "UPDATE",
        old_role_name: (entry.old_role as any)?.name || null,
        new_role_name: (entry.new_role as any)?.name || null,
        old_role_level: (entry.old_role as any)?.level || null,
        new_role_level: (entry.new_role as any)?.level || null,
        changed_by_id: changedById,
        changed_by_email: changedByEmail,
        changed_by_display_name: changedByDisplayName,
        changed_at: entry.changed_at,
      });
    }

    return {
      entries,
      totalCount,
      currentPage: page,
      totalPages,
    };
  } catch (err) {
    console.error("Unexpected error in getAuditLog:", err);
    return {
      entries: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
}

