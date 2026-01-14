import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGymOnboarding } from '@/hooks/gym/useGymOnboarding';
import {
  Step1AccountCreation,
  Step2GymBasics,
  Step3Locations,
  Step4Services,
  Step5Team,
  Step6Memberships,
  Step7Payments,
  Step8Branding,
  Step9Review,
} from '@/components/gym/onboarding/steps';

export default function GymOnboarding() {
  const [searchParams] = useSearchParams();
  const {
    currentStep,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    isLoading,
    gymId,
    userId,
    createAccount,
    saveGymBasics,
    saveLocations,
    saveServices,
    saveStaffInvites,
    saveMembershipTypes,
    savePaymentSettings,
    saveBranding,
    completeOnboarding,
  } = useGymOnboarding();

  // Handle Stripe return
  useEffect(() => {
    const stripeReturn = searchParams.get('stripe_return');
    const stepParam = searchParams.get('step');
    
    if (stripeReturn === 'true' && stepParam === '7') {
      // User returned from Stripe, update the connected status
      updateData({ stripeConnected: true });
    }
  }, [searchParams, updateData]);

  // Render step based on current step
  const renderStep = () => {
    const commonProps = {
      data,
      updateData,
      isLoading,
      currentStep,
      totalSteps,
    };

    switch (currentStep) {
      case 0:
        return (
          <Step1AccountCreation
            {...commonProps}
            onNext={createAccount}
          />
        );
      case 1:
        return (
          <Step2GymBasics
            {...commonProps}
            onNext={saveGymBasics}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <Step3Locations
            {...commonProps}
            onNext={saveLocations}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step4Services
            {...commonProps}
            onNext={saveServices}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step5Team
            {...commonProps}
            onNext={saveStaffInvites}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step6Memberships
            {...commonProps}
            onNext={saveMembershipTypes}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <Step7Payments
            {...commonProps}
            onNext={savePaymentSettings}
            onBack={prevStep}
            gymId={gymId}
          />
        );
      case 7:
        return (
          <Step8Branding
            {...commonProps}
            onNext={saveBranding}
            onBack={prevStep}
            gymId={gymId}
          />
        );
      case 8:
        return (
          <Step9Review
            {...commonProps}
            onComplete={completeOnboarding}
            onBack={prevStep}
            goToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return renderStep();
}
