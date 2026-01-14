import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { 
  CalendarDays, 
  Ticket, 
  CreditCard, 
  Gift 
} from 'lucide-react';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step6Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const MEMBERSHIP_TYPES = [
  { 
    id: 'monthly', 
    label: 'Monthly memberships', 
    icon: CalendarDays, 
    description: 'Recurring monthly subscriptions' 
  },
  { 
    id: 'class_packs', 
    label: 'Class packs / Credits', 
    icon: Ticket, 
    description: 'Buy a bundle of classes upfront' 
  },
  { 
    id: 'payg', 
    label: 'Pay-as-you-go', 
    icon: CreditCard, 
    description: 'Pay per visit or session' 
  },
  { 
    id: 'free_trials', 
    label: 'Free trials', 
    icon: Gift, 
    description: 'Offer trial periods to new members' 
  },
];

export function Step6Memberships({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
}: Step6Props) {
  const toggleMembershipType = (typeId: string) => {
    const current = data.membershipTypes || [];
    const updated = current.includes(typeId)
      ? current.filter(t => t !== typeId)
      : [...current, typeId];
    updateData({ membershipTypes: updated });
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Memberships & pricing"
      subtitle="How do members pay for your services?"
      showBackButton
      onBack={onBack}
      onSkip={() => onNext()}
      skipLabel="Skip for now"
      footerActions={{
        primary: {
          label: 'Continue',
          onClick: onNext,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>What do you sell? (select all that apply)</Label>
          <div className="space-y-3">
            {MEMBERSHIP_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = data.membershipTypes.includes(type.id);
              
              return (
                <label
                  key={type.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMembershipType(type.id)}
                    className="mt-0.5"
                  />
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`
                      p-2 rounded-lg 
                      ${isSelected ? 'bg-primary/10' : 'bg-secondary'}
                    `}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> You can set up detailed pricing, membership tiers, and special offers after completing the initial setup.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
