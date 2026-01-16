import { createClient } from "@/lib/supabase/server";
import { getAuditLog } from "@/lib/rbac/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const supabase = await createClient();

  // Fetch audit log
  const auditLog = await getAuditLog(page, 50, supabase);

  return (
    <div className="space-y-6 pl-12 pr-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all role changes and administrative actions
          </p>
        </div>
      </div>

      {auditLog.entries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No audit entries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Role Change</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.entries.map((entry) => {
                  const timeAgo = formatDistanceToNow(new Date(entry.changed_at), {
                    addSuffix: true,
                  });

                  const userDisplay =
                    entry.user_display_name || entry.user_email || "Unknown user";

                  const changedByDisplay =
                    entry.changed_by_display_name ||
                    entry.changed_by_email ||
                    "System";

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {timeAgo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {userDisplay}
                        {entry.user_email && (
                          <div className="text-xs text-muted-foreground">
                            {entry.user_email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {entry.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.old_role_name && (
                            <span className="text-sm">{entry.old_role_name}</span>
                          )}
                          {entry.old_role_name && entry.new_role_name && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {entry.new_role_name && (
                            <span className="text-sm font-medium">
                              {entry.new_role_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {changedByDisplay}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={auditLog.currentPage}
            totalPages={auditLog.totalPages}
            totalCount={auditLog.totalCount}
            itemsPerPage={50}
            baseUrl="/admin/audit"
          />
        </div>
      )}
    </div>
  );
}

