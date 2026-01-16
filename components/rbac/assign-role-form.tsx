"use client";

import { useState } from "react";
import { assignRoleAction } from "@/lib/rbac/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/rbac/types";
import { Loader2 } from "lucide-react";

interface AssignRoleFormProps {
  userId: string;
  currentRoleId: string;
  availableRoles: Role[];
}

export function AssignRoleForm({
  userId,
  currentRoleId,
  availableRoles,
}: AssignRoleFormProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRoleId === currentRoleId) {
      toast.info("No change in role");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignRoleAction({
        userId,
        roleId: selectedRoleId,
      });

      if (result?.data?.success) {
        toast.success(result.data.message || "Role assigned successfully");
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else if (result?.validationErrors) {
        toast.error("Validation error. Please check your input.");
      }
    } catch (error) {
      toast.error("Failed to assign role");
      console.error("Error assigning role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedRoleId === currentRoleId}
        size="sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Update"
        )}
      </Button>
    </div>
  );
}

