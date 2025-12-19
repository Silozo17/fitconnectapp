import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Briefcase } from "lucide-react";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface CreateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileType: "client" | "coach";
  onSuccess: () => void;
}

const CreateProfileModal = ({
  open,
  onOpenChange,
  profileType,
  onSuccess,
}: CreateProfileModalProps) => {
  const { user } = useAuth();
  const { refreshProfiles } = useAdminView();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleCreate = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Fetch existing user_profile to link and reuse username
      const { data: existingUserProfile } = await supabase
        .from("user_profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Use existing username or generate a new one
      let username: string;
      let userProfileId: string | null = null;

      if (existingUserProfile) {
        username = existingUserProfile.username;
        userProfileId = existingUserProfile.id;
      } else {
        // Generate a unique username if no user_profile exists (shouldn't happen normally)
        const baseUsername = (firstName || displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomSuffix = Math.floor(Math.random() * 9999);
        username = `${baseUsername}${randomSuffix}`;
      }

      if (profileType === "client") {
        const { error } = await supabase.from("client_profiles").insert({
          user_id: user.id,
          username,
          user_profile_id: userProfileId,
          first_name: firstName || null,
          last_name: lastName || null,
          onboarding_completed: true,
        });

        if (error) throw error;

        toast.success("Client profile created successfully");
      } else {
        const { error } = await supabase.from("coach_profiles").insert({
          user_id: user.id,
          username,
          user_profile_id: userProfileId,
          display_name: displayName || `${firstName} ${lastName}`.trim() || null,
          subscription_tier: "free",
          onboarding_completed: true,
        });

        if (error) throw error;

        toast.success("Coach profile created successfully");
      }

      await refreshProfiles();
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFirstName("");
      setLastName("");
      setDisplayName("");
    } catch (error: unknown) {
      logError("CreateProfileModal", error);
      toast.error(getErrorMessage(error, "Failed to create profile"));
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = profileType === "client" ? User : Briefcase;
  const iconColor = profileType === "client" ? "text-blue-500" : "text-orange-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                Create {profileType === "client" ? "Client" : "Coach"} Profile
              </DialogTitle>
              <DialogDescription>
                Create a {profileType} profile to access {profileType} features.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {profileType === "client" ? (
            <>
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
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
              <p className="text-xs text-muted-foreground">
                This is how clients will see you on the platform.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProfileModal;
