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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Briefcase, Loader2 } from "lucide-react";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface BecomeCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeCoachModal = ({ open, onOpenChange }: BecomeCoachModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

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

      const finalDisplayName = displayName.trim() || 
        `${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`.trim() ||
        username;

      // Create coach profile with onboarding_completed: false to go through onboarding
      const { error } = await supabase.from("coach_profiles").insert({
        user_id: user.id,
        username,
        user_profile_id: existingUserProfile?.id || null,
        display_name: finalDisplayName,
        subscription_tier: "free",
        onboarding_completed: false, // Will go through coach onboarding
      });

      if (error) throw error;

      // Explicitly add coach role
      await supabase
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: "coach" as const },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      toast.success("Coach profile created! Let's set up your profile.");
      onOpenChange(false);
      setDisplayName("");
      
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
                Start offering your fitness services and training clients on the platform.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="coachDisplayName">Display Name</Label>
            <Input
              id="coachDisplayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How clients will see your name"
            />
            <p className="text-xs text-muted-foreground">
              This will be shown on your coach profile. You can change it later.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
            <p className="font-medium">What happens next?</p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Set up your coach profile</li>
              <li>Add your services and pricing</li>
              <li>Configure availability</li>
              <li>Start accepting bookings</li>
            </ul>
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
            Start as Coach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeCoachModal;
