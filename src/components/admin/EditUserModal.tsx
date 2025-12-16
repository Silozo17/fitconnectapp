import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { StatusBadge } from "./StatusBadge";

interface ClientUser {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  onboarding_completed: boolean;
  created_at: string;
  status?: string | null;
}

interface EditUserModalProps {
  user: ClientUser;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditUserModal = ({ user, open, onClose, onSaved }: EditUserModalProps) => {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [age, setAge] = useState(user.age?.toString() || "");
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  
  const { getUserEmail, updateEmail } = useAdminUserManagement("client");

  useEffect(() => {
    const fetchEmail = async () => {
      setLoadingEmail(true);
      const userEmail = await getUserEmail(user.user_id);
      if (userEmail) {
        setEmail(userEmail);
        setOriginalEmail(userEmail);
      }
      setLoadingEmail(false);
    };
    
    if (open && user.user_id) {
      fetchEmail();
    }
  }, [open, user.user_id]);

  const handleEmailUpdate = async () => {
    if (!email || email === originalEmail) return;
    
    setUpdatingEmail(true);
    const success = await updateEmail(user.user_id, user.id, email);
    if (success) {
      setOriginalEmail(email);
    }
    setUpdatingEmail(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("client_profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        age: age ? parseInt(age) : null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update user");
      console.error(error);
    } else {
      toast.success("User updated successfully");
      onSaved();
      onClose();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Section */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              {loadingEmail ? (
                <div className="flex-1 flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleEmailUpdate}
                    disabled={!email || email === originalEmail || updatingEmail}
                  >
                    {updatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status Display */}
          <div className="space-y-2">
            <Label>Account Status</Label>
            <div className="flex items-center gap-2">
              <StatusBadge status={user.status || "active"} />
              <span className="text-xs text-muted-foreground">
                (Change status via dropdown menu)
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
