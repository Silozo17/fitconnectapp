import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Shield, Users, UserCog } from "lucide-react";
import { getErrorMessage } from "@/lib/error-utils";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  role: string;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

const roleDescriptions = {
  admin: "Full access to all features and settings",
  manager: "Can manage users, coaches, and view analytics",
  staff: "Limited access for support tasks",
};

const ChangeRoleModal = ({
  isOpen,
  onClose,
  onSuccess,
  member,
}: ChangeRoleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(member?.role || "staff");

  useEffect(() => {
    if (member && isOpen) {
      setSelectedRole(member.role || "staff");
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (selectedRole === member.role) {
      toast.info("Role is already set to " + selectedRole);
      onClose();
      return;
    }

    setLoading(true);
    try {
      // Update the role in user_roles table
      const { error } = await supabase
        .from("user_roles")
        .update({ role: selectedRole as "admin" | "manager" | "staff" })
        .eq("user_id", member.user_id);

      if (error) throw error;

      toast.success(`Role updated to ${selectedRole}`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error("Failed to update role: " + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <UserCog className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const memberName =
    member?.display_name ||
    `${member?.first_name || ""} ${member?.last_name || ""}`.trim() ||
    "Team Member";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for {memberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-primary" />
                    <span>Manager</span>
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Staff</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {getRoleIcon(selectedRole)}
              <span className="font-medium capitalize">{selectedRole}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {roleDescriptions[selectedRole as keyof typeof roleDescriptions]}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;
