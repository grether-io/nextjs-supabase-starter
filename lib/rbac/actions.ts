"use server";

import { createSafeActionClient } from "next-safe-action";
import { createClient } from "@/lib/supabase/server";
import { assignRoleSchema } from "./schemas";
import { assignRole, canManageUser, getUserRoleFromJWT } from "./server";
import { revalidatePath } from "next/cache";

// Initialize the safe action client
const action = createSafeActionClient();

/**
 * Assign a role to a user
 * Validates permissions and hierarchy
 */
export const assignRoleAction = action
  .schema(assignRoleSchema)
  .action(async ({ parsedInput: { userId, roleId } }) => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const currentUser = data?.claims;

    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const userRole = getUserRoleFromJWT(currentUser as any);

    if (!userRole) {
      throw new Error("No role assigned");
    }

    // Get target user's current role level
    const { data: targetUserRole } = await supabase
      .from("user_roles")
      .select("role:roles(level)")
      .eq("user_id", userId)
      .single();

    const targetLevel = (targetUserRole?.role as any)?.level ?? 0;

    // Get new role level
    const { data: newRole } = await supabase
      .from("roles")
      .select("level")
      .eq("id", roleId)
      .single();

    const newLevel = newRole?.level ?? 0;

    // Check if admin can manage this user
    if (!canManageUser(userRole.level, targetLevel)) {
      throw new Error("You cannot manage users with equal or higher role levels");
    }

    // Check if admin can assign this role
    if (!canManageUser(userRole.level, newLevel)) {
      throw new Error("You cannot assign roles equal to or higher than your own");
    }

    // Assign the role
    const result = await assignRole(userId, roleId, currentUser.sub, supabase);

    if (!result.success) {
      throw new Error(result.error || "Failed to assign role");
    }

    // Revalidate the admin pages
    revalidatePath("/admin/users");
    revalidatePath("/admin/audit");

    return { success: true, message: "Role assigned successfully" };
  });


