import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTeamMemberModal = ({ isOpen, onClose, onSuccess }: AddTeamMemberModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "staff" as "admin" | "manager" | "staff",
    first_name: "",
    last_name: "",
    department: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use secure edge function for admin user creation
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          first_name: formData.first_name,
          last_name: formData.last_name,
          department: formData.department,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Team member added successfully");
      onSuccess();
      onClose();
      setFormData({
        email: "",
        password: "",
        role: "staff",
        first_name: "",
        last_name: "",
        department: "",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to add team member: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Add a new admin, manager, or staff member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="team@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "manager" | "staff") => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="manager">Manager (User Management)</SelectItem>
                <SelectItem value="staff">Staff (Limited Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Team Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberModal;
