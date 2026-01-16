import { createClient } from "@/lib/supabase/server";
import { getUsersWithRoles, getAllRoles, getUserRoleFromJWT } from "@/lib/rbac/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { RoleBadge } from "@/components/rbac/role-badge";
import { AssignRoleForm } from "@/components/rbac/assign-role-form";

const ITEMS_PER_PAGE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get current user and role
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const userRole = getUserRoleFromJWT(user as unknown as User);

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No role assigned</p>
      </div>
    );
  }

  // Fetch users and roles
  const { users, totalCount, totalPages } = await getUsersWithRoles(
    userRole.level,
    supabase,
    adminClient,
    currentPage,
    ITEMS_PER_PAGE
  );
  const allRoles = await getAllRoles(supabase);

  // Filter roles that are below current user's level
  const availableRoles = allRoles.filter((role) => role.level <= userRole.level);

  return (
    <div className="space-y-6 pl-12 pr-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const displayName =
                    user.user_metadata.display_name ||
                    `${user.user_metadata.first_name || ""} ${user.user_metadata.last_name || ""}`.trim() ||
                    "-";

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{displayName}</TableCell>
                      <TableCell>
                        <RoleBadge level={user.role.level} name={user.role.name} />
                      </TableCell>
                      <TableCell>
                        <AssignRoleForm
                          userId={user.id}
                          currentRoleId={user.role.id}
                          availableRoles={availableRoles}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            baseUrl="/admin/users"
          />
        </div>
      )}
    </div>
  );
}

