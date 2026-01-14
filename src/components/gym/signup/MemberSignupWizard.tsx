import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignupWizardProvider, useSignupWizard } from "./SignupWizardContext";
import { SignupProgress } from "./SignupProgress";
import { LocationStep } from "./steps/LocationStep";
import { PlanStep } from "./steps/PlanStep";
import { DetailsStep } from "./steps/DetailsStep";
import { EmailVerificationStep } from "./steps/EmailVerificationStep";
import { MarketingStep } from "./steps/MarketingStep";
import { ContractsStep } from "./steps/ContractsStep";
import { PaymentStep } from "./steps/PaymentStep";

interface MemberSignupWizardProps {
  gymId: string;
  gymSlug: string;
}

function WizardContent({ gymId, gymSlug }: MemberSignupWizardProps) {
  const { currentStep, setCurrentStep, formData, totalSteps } = useSignupWizard();

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["gym-locations-public", gymId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("gym_locations")
        .select("id, name, address_line_1, city, postal_code")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return (data || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        address: l.address_line_1 || "",
        city: l.city || "",
        postcode: l.postal_code || "",
      }));
    },
    enabled: !!gymId,
  });

  // Fetch plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["gym-plans-public", gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!gymId,
  });

  // Fetch contracts (filtered by location if selected)
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["gym-contracts-public", gymId, formData.locationId],
    queryFn: async () => {
      let query = supabase
        .from("gym_contract_templates")
        .select("id, name, type, content, is_required")
        .eq("gym_id", gymId)
        .eq("is_active", true);

      // Filter by location if set
      if (formData.locationId) {
        query = query.or(`location_id.is.null,location_id.eq.${formData.locationId}`);
      }

      const { data, error } = await query.order("is_required", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!gymId && currentStep >= 6,
  });

  const selectedPlan = plans.find((p) => p.id === formData.planId);
  const selectedLocation = locations.find((l) => l.id === formData.locationId);

  const goNext = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 1));

  return (
    <div className="space-y-8">
      <SignupProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="min-h-[400px]">
        {/* Step 1: Location */}
        {currentStep === 1 && (
          <LocationStep
            locations={locations}
            isLoading={locationsLoading}
            onNext={goNext}
          />
        )}
        {/* Step 2: Plan */}
        {currentStep === 2 && (
          <PlanStep
            plans={plans}
            isLoading={plansLoading}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {/* Step 3: Personal Details */}
        {currentStep === 3 && (
          <DetailsStep onNext={goNext} onBack={goBack} />
        )}
        {/* Step 4: Email Verification */}
        {currentStep === 4 && (
          <EmailVerificationStep onNext={goNext} onBack={goBack} />
        )}
        {/* Step 5: Marketing */}
        {currentStep === 5 && (
          <MarketingStep onNext={goNext} onBack={goBack} />
        )}
        {/* Step 6: Contracts */}
        {currentStep === 6 && (
          <ContractsStep
            contracts={contracts}
            isLoading={contractsLoading}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {/* Step 7: Payment */}
        {currentStep === 7 && (
          <PaymentStep
            plan={selectedPlan}
            location={selectedLocation}
            gymId={gymId}
            gymSlug={gymSlug}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}

export function MemberSignupWizard(props: MemberSignupWizardProps) {
  return (
    <SignupWizardProvider>
      <WizardContent {...props} />
    </SignupWizardProvider>
  );
}
