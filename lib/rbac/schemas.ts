import { z } from "zod";

/**
 * Schema for assigning a role to a user
 */
export const assignRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  roleId: z.string().uuid("Invalid role ID"),
});
