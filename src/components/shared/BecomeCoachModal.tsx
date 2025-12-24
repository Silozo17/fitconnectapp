import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface BecomeCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeCoachModal = ({ open, onOpenChange }: BecomeCoachModalProps) => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleBecomeCoach = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Check if coach profile already exists
      const { data: existingCoachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingCoachProfile) {
        toast.info("You already have a coach profile");
        onOpenChange(false);
        navigate("/dashboard/coach");
        return;
      }

      // Fetch existing user_profile to link and reuse username
      const { data: existingUserProfile } = await supabase
        .from("user_profiles")
        .select("id, username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch client profile for first/last name fallback
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("first_name, last_name, username")
        .eq("user_id", user.id)
        .maybeSingle();

      const username = existingUserProfile?.username || 
        clientProfile?.username ||
        `coach${Math.floor(Math.random() * 99999)}`;

      const displayName = 
        `${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`.trim() ||
        username;

      // Create coach profile with onboarding_completed: false to go through onboarding
      const { error } = await supabase.from("coach_profiles").insert({
        user_id: user.id,
        username,
        user_profile_id: existingUserProfile?.id || null,
        display_name: displayName,
        subscription_tier: "free",
        onboarding_completed: false,
      });

      if (error) throw error;

      // Explicitly add coach role
      await supabase
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: "coach" as const },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      // Refresh role in AuthContext so ProtectedRoute sees the new role
      await refreshRole();

      toast.success("Let's set up your coach profile!");
      onOpenChange(false);
      
      // Navigate to coach onboarding
      navigate("/onboarding/coach");
    } catch (error: unknown) {
      logError("BecomeCoachModal", error);
      toast.error(getErrorMessage(error, "Failed to create coach profile"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Become a Coach</DialogTitle>
              <DialogDescription>
                Start offering your fitness services on the platform.
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
                <span>Create your coaching profile</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Set up services and pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Configure your availability</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>Start accepting bookings from clients</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
            <p className="text-amber-600 dark:text-amber-400">
              <strong>Note:</strong> Once you start the coach setup, you'll need to complete it before accessing your coach dashboard.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBecomeCoach} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Briefcase className="w-4 h-4 mr-2" />
            )}
            Yes, Let's Go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeCoachModal;
