import { Badge } from "@/components/ui/badge";
import { getRoleBadgeVariant } from "@/lib/rbac/constants";

interface RoleBadgeProps {
  level: number;
  name: string;
}

export function RoleBadge({ level, name }: RoleBadgeProps) {
  const variant = getRoleBadgeVariant(level);

  return <Badge variant={variant}>{name}</Badge>;
}

