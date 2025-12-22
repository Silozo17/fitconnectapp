import { useState } from "react";
import { User, Briefcase, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DualAccountStepProps {
  coachId: string;
  onComplete: (createClientAccount: boolean) => void;
  onBack?: () => void;
}

const DualAccountStep = ({ coachId, onComplete, onBack }: DualAccountStepProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"coach_only" | "both" | null>(null);

  const handleCreateDualAccount = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      // Check if client profile already exists FIRST
      const { data: existingProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Already has client profile - just update coach and continue
        await supabase
          .from("coach_profiles")
          .update({ also_client: true })
          .eq("id", coachId);
        
        toast.success(t('onboarding.clientAccountSetup'));
        onComplete(true);
        return;
      }

      // Generate unique username with timestamp to avoid conflicts
      const uniqueUsername = `client_${user.id.slice(0, 8)}_${Date.now().toString(36)}`;

      // Create client profile
      const { error: profileError } = await supabase
        .from("client_profiles")
        .insert({
          user_id: user.id,
          username: uniqueUsername,
          onboarding_completed: false,
        });

      if (profileError) {
        // If duplicate key error, profile might already exist - check again
        if (profileError.message.includes("duplicate") || profileError.code === "23505") {
          const { data: checkAgain } = await supabase
            .from("client_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (checkAgain) {
            // Profile exists, just proceed
            await supabase
              .from("coach_profiles")
              .update({ also_client: true })
              .eq("id", coachId);
            toast.success(t('onboarding.clientAccountSetup'));
            onComplete(true);
            return;
          }
        }
        throw profileError;
      }

      // Add client role using upsert to handle duplicates
      await supabase
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: "client" as const },
          { onConflict: 'user_id,role', ignoreDuplicates: true }
        );

      // Update coach profile
      await supabase
        .from("coach_profiles")
        .update({ also_client: true })
        .eq("id", coachId);

      toast.success(t('onboarding.clientAccountCreated'));
      onComplete(true);
    } catch (error) {
      console.error("Error creating client account:", error);
      toast.error(t('onboarding.failedCreateClient'));
    } finally {
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
          {t('onboarding.oneMoreThing')}
        </h2>
        <p className="text-muted-foreground">
          {t('onboarding.alsoFindCoaches')}
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
                <h3 className="font-display text-lg font-bold text-foreground">{t('onboarding.yesBothAccounts')}</h3>
                {selectedOption === "both" && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {t('onboarding.coachAndFindCoaches')}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {t('onboarding.browseBookCoaches')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {t('onboarding.trackOwnProgress')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {t('onboarding.participateChallenges')}
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
                <h3 className="font-display text-lg font-bold text-foreground">{t('onboarding.noCoachOnly')}</h3>
                {selectedOption === "coach_only" && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {t('onboarding.focusOnBusiness')}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        )}
        <Button
          onClick={selectedOption === "both" ? handleCreateDualAccount : handleCoachOnly}
          disabled={!selectedOption || isCreating}
          className="flex-1 bg-primary text-primary-foreground"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('onboarding.creatingAccount')}
            </>
          ) : (
            t('actions.continue')
          )}
        </Button>
      </div>
    </div>
  );
};

export default DualAccountStep;
