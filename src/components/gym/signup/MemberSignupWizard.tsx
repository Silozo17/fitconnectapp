import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignupWizardProvider, useSignupWizard } from "./SignupWizardContext";
import { SignupProgress } from "./SignupProgress";
import { LocationStep } from "./steps/LocationStep";
import { PlanStep } from "./steps/PlanStep";
import { DetailsStep } from "./steps/DetailsStep";
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
      const { data, error } = await supabase
        .from("gym_locations")
        .select("id, name, address, city, postcode")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data;
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
    enabled: !!gymId && currentStep >= 5,
  });

  const selectedPlan = plans.find((p) => p.id === formData.planId);
  const selectedLocation = locations.find((l) => l.id === formData.locationId);

  const goNext = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 1));

  return (
    <div className="space-y-8">
      <SignupProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <LocationStep
            locations={locations}
            isLoading={locationsLoading}
            onNext={goNext}
          />
        )}
        {currentStep === 2 && (
          <PlanStep
            plans={plans}
            isLoading={plansLoading}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <DetailsStep onNext={goNext} onBack={goBack} />
        )}
        {currentStep === 4 && (
          <MarketingStep onNext={goNext} onBack={goBack} />
        )}
        {currentStep === 5 && (
          <ContractsStep
            contracts={contracts}
            isLoading={contractsLoading}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 6 && (
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
