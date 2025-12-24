import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { User, Loader2, CheckCircle2 } from "lucide-react";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface BecomeClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeClientModal = ({ open, onOpenChange }: BecomeClientModalProps) => {
  const { user, refreshRole } = useAuth();
  const { refreshProfiles } = useAdminView();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleBecomeClient = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Check if client profile already exists
      const { data: existingClientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingClientProfile) {
        toast.info("You already have a client profile");
        onOpenChange(false);
        navigate("/dashboard/client");
        return;
      }

      // Fetch existing user_profile to link and reuse username
      const { data: existingUserProfile } = await supabase
        .from("user_profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch coach profile for first/last name fallback
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("display_name, username")
        .eq("user_id", user.id)
        .maybeSingle();

      const username = existingUserProfile?.username || 
        coachProfile?.username ||
        `client${Math.floor(Math.random() * 99999)}`;

      // Create client profile with onboarding_completed: false to go through onboarding
      const { error } = await supabase.from("client_profiles").insert({
        user_id: user.id,
        username,
        user_profile_id: existingUserProfile?.id || null,
        onboarding_completed: false,
      });

      if (error) throw error;

      // Explicitly add client role
      await supabase
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: "client" as const },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      // Refresh role in AuthContext so ProtectedRoute sees the new role
      await refreshRole();
      
      // Refresh profiles in AdminContext so ViewSwitcher updates immediately
      await refreshProfiles();

      toast.success("Let's set up your client profile!");
      onOpenChange(false);
      
      // Navigate to client onboarding
      navigate("/onboarding/client");
    } catch (error: unknown) {
      logError("BecomeClientModal", error);
      toast.error(getErrorMessage(error, "Failed to create client profile"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Become a Client</DialogTitle>
              <DialogDescription>
                Start your fitness journey with expert coaching.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-3">
            <p className="font-medium">You'll be able to:</p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Track your fitness journey</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Access personalized workout and nutrition plans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Connect with expert coaches</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Sync health data from wearables</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
            <p className="text-amber-600 dark:text-amber-400">
              <strong>Note:</strong> Once you start the client setup, you'll need to complete it before accessing your client dashboard.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBecomeClient} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <User className="w-4 h-4 mr-2" />
            )}
            Yes, Let's Go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeClientModal;
