import { useState } from "react";
import { User, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DualAccountStepProps {
  coachId: string;
  onComplete: (createClientAccount: boolean) => void;
}

const DualAccountStep = ({ coachId, onComplete }: DualAccountStepProps) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"coach_only" | "both" | null>(null);

  const handleCreateDualAccount = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      // Check if client profile already exists
      const { data: existingProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Already has client profile
        await supabase
          .from("coach_profiles")
          .update({ also_client: true })
          .eq("id", coachId);
        
        toast.success("Your client account is already set up!");
        onComplete(true);
        return;
      }

      // Create client profile
      const { error: profileError } = await supabase
        .from("client_profiles")
        .insert({
          user_id: user.id,
          username: `client_${user.id.slice(0, 8)}`,
          onboarding_completed: false,
        });

      if (profileError) throw profileError;

      // Add client role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "client",
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      // Update coach profile
      await supabase
        .from("coach_profiles")
        .update({ also_client: true })
        .eq("id", coachId);

      toast.success("Client account created! You can complete your client profile later.");
      onComplete(true);
    } catch (error) {
      console.error("Error creating client account:", error);
      toast.error("Failed to create client account");
      setIsCreating(false);
    }
  };

  const handleCoachOnly = () => {
    onComplete(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          One more thing...
        </h2>
        <p className="text-muted-foreground">
          Would you also like to find coaches for your own fitness journey?
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setSelectedOption("both")}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            selectedOption === "both"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedOption === "both" ? "bg-primary" : "bg-secondary"
            }`}>
              <div className="relative">
                <Briefcase className={`w-5 h-5 ${selectedOption === "both" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <User className={`w-3 h-3 absolute -bottom-1 -right-1 ${selectedOption === "both" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">Yes, create both accounts</h3>
                {selectedOption === "both" && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Coach clients AND find coaches for yourself. Switch between roles anytime.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Browse and book coaches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Track your own fitness progress
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Participate in challenges & leaderboards
                </li>
              </ul>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedOption("coach_only")}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            selectedOption === "coach_only"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedOption === "coach_only" ? "bg-primary" : "bg-secondary"
            }`}>
              <Briefcase className={`w-6 h-6 ${selectedOption === "coach_only" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">No, coach only</h3>
                {selectedOption === "coach_only" && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Focus on building your coaching business. You can add a client account later.
              </p>
            </div>
          </div>
        </button>
      </div>

      <Button
        onClick={selectedOption === "both" ? handleCreateDualAccount : handleCoachOnly}
        disabled={!selectedOption || isCreating}
        className="w-full bg-primary text-primary-foreground"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
};

export default DualAccountStep;
