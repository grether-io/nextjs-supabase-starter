/**
 * RBAC Type Definitions
 */

/**
 * Role type definition
 */
export type Role = {
  id: string;
  name: string;
  description: string;
  level: number;
  created_at: string;
};

/**
 * User role from JWT claims
 */
export type UserRole = {
  name: string;
  level: number;
};

/**
 * User with role information (for admin user management)
 */
export type UserWithRole = {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
  role: Role;
};

/**
 * Audit log entry with populated user and role information for display
 */
export type AuditLogEntry = {
  id: string;
  user_id: string;
  user_email: string | null;
  user_display_name: string | null;
  action: "INSERT" | "UPDATE";
  old_role_name: string | null;
  new_role_name: string | null;
  old_role_level: number | null;
  new_role_level: number | null;
  changed_by_id: string | null;
  changed_by_email: string | null;
  changed_by_display_name: string | null;
  changed_at: string;
};

/**
 * Paginated audit log result
 */
export type AuditLogPage = {
  entries: AuditLogEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
};

