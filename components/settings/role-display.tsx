"use client";

import { RoleBadge } from "@/components/rbac/role-badge";
import { ROLE_DESCRIPTIONS } from "@/lib/rbac/constants";

interface RoleDisplayProps {
  role: {
    name: string;
    level: number;
  } | null;
}

export function RoleDisplay({ role }: RoleDisplayProps) {
  if (!role) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Role</h3>
          <p className="text-sm text-muted-foreground">View your current role and permissions</p>
        </div>
        <p className="text-muted-foreground">No role assigned</p>
      </div>
    );
  }

  const description = ROLE_DESCRIPTIONS[role.level] || "No description available";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Your Role</h3>
        <p className="text-sm text-muted-foreground">View your current role and permissions</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Current Role:</span>
          <RoleBadge level={role.level} name={role.name} />
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <h4 className="font-medium mb-2">Permissions</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Contact an administrator to request a role change.
        </p>
      </div>
    </div>
  );
}

