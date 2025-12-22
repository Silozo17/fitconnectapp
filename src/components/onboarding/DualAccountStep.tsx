import { useState, useEffect, useRef } from "react";
import { User, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DualAccountStepProps {
  coachId: string;
  /** Called to indicate state changes - parent controls footer */
  onStateChange?: (state: { selectedOption: 'both' | 'coach_only' | null; isCreating: boolean }) => void;
  /** Exposed function for parent to trigger account creation */
  onActionRef?: React.MutableRefObject<(() => Promise<boolean>) | null>;
}

export function useDualAccountState() {
  const [selectedOption, setSelectedOption] = useState<'both' | 'coach_only' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  return { selectedOption, setSelectedOption, isCreating, setIsCreating };
}

const DualAccountStep = ({ coachId, onStateChange, onActionRef }: DualAccountStepProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'both' | 'coach_only' | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Track previous state to avoid unnecessary calls
  const prevStateRef = useRef<{ selectedOption: typeof selectedOption; isCreating: boolean }>({ selectedOption: null, isCreating: false });

  // Notify parent of state changes - MUST be in useEffect to avoid render-loop freezes
  useEffect(() => {
    if (prevStateRef.current.selectedOption !== selectedOption || prevStateRef.current.isCreating !== isCreating) {
      prevStateRef.current = { selectedOption, isCreating };
      onStateChange?.({ selectedOption, isCreating });
    }
  }, [selectedOption, isCreating, onStateChange]);

  const handleCreateDualAccount = async (): Promise<boolean> => {
    if (!user) return false;
    
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
        return true;
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
            return true;
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
      return true;
    } catch (error) {
      console.error("Error creating client account:", error);
      toast.error(t('onboarding.failedCreateClient'));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Expose action function to parent
  if (onActionRef) {
    onActionRef.current = async () => {
      if (selectedOption === 'both') {
        return await handleCreateDualAccount();
      }
      return true; // coach_only doesn't need creation
    };
  }

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {t('onboarding.oneMoreThing')}
        </h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          {t('onboarding.alsoFindCoaches')}
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setSelectedOption("both")}
          className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
            selectedOption === "both"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground"
          }`}
          disabled={isCreating}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              selectedOption === "both" ? "bg-primary" : "bg-secondary"
            }`}>
              <div className="relative">
                <Briefcase className={`w-5 h-5 ${selectedOption === "both" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <User className={`w-3 h-3 absolute -bottom-1 -right-1 ${selectedOption === "both" ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">{t('onboarding.yesBothAccounts')}</h3>
                {selectedOption === "both" && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                {t('onboarding.coachAndFindCoaches')}
              </p>
              <ul className="mt-3 space-y-1 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {t('onboarding.browseBookCoaches')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {t('onboarding.trackOwnProgress')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {t('onboarding.participateChallenges')}
                </li>
              </ul>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedOption("coach_only")}
          className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
            selectedOption === "coach_only"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground"
          }`}
          disabled={isCreating}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              selectedOption === "coach_only" ? "bg-primary" : "bg-secondary"
            }`}>
              <Briefcase className={`w-6 h-6 ${selectedOption === "coach_only" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">{t('onboarding.noCoachOnly')}</h3>
                {selectedOption === "coach_only" && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                {t('onboarding.focusOnBusiness')}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center">
        {t('onboarding.canChangeThisLater')}
      </p>
    </div>
  );
};

export default DualAccountStep;
