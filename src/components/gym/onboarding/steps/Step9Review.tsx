import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Dumbbell, 
  Users, 
  CreditCard, 
  Palette,
  Check,
  AlertCircle,
  Rocket
} from 'lucide-react';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step9Props {
  data: GymOnboardingData;
  onComplete: () => void;
  onBack: () => void;
  goToStep: (step: number) => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const SERVICE_LABELS: Record<string, string> = {
  classes: 'Classes',
  personal_training: 'Personal Training',
  group_training: 'Group Training',
  open_gym: 'Open Gym',
  online_coaching: 'Online Coaching',
  hybrid: 'Hybrid',
};

export function Step9Review({
  data,
  onComplete,
  onBack,
  goToStep,
  isLoading,
  currentStep,
  totalSteps,
}: Step9Props) {
  const hasPayment = data.stripeConnected || data.stripeAccountId;
  const hasBranding = data.logoUrl || data.brandColor || data.coverImageUrl;

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Review & launch"
      subtitle="You're almost ready to go!"
      showBackButton
      onBack={onBack}
      footerActions={{
        primary: {
          label: 'Go to Dashboard',
          onClick: onComplete,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-4">
        {/* Gym Name */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(1)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Gym details</h3>
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-lg font-semibold mt-1">{data.gymName}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.businessTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(2)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Locations</h3>
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.locations.length} location{data.locations.length !== 1 ? 's' : ''}
                </p>
                {data.locations[0]?.address && (
                  <p className="text-sm mt-1 truncate">
                    {data.locations[0].name || data.locations[0].address}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(3)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Services</h3>
                  {data.services.length > 0 ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.services.map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {SERVICE_LABELS[service] || service}
                    </Badge>
                  ))}
                  {data.services.length === 0 && (
                    <p className="text-sm text-muted-foreground">Not configured</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(4)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Team</h3>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.staffInvites.length > 0 
                    ? `${data.staffInvites.length} invite${data.staffInvites.length !== 1 ? 's' : ''} pending`
                    : 'No team members added yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(6)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${hasPayment ? 'bg-primary/10' : 'bg-yellow-500/10'}`}>
                <CreditCard className={`w-5 h-5 ${hasPayment ? 'text-primary' : 'text-yellow-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Payments</h3>
                  {data.stripeConnected ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.stripeConnected 
                    ? 'Stripe connected' 
                    : data.stripeAccountId 
                      ? 'Setup in progress'
                      : 'Not connected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => goToStep(7)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Branding</h3>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasBranding ? 'Customized' : 'Using defaults'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Launch Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Rocket className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">Ready to launch!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your gym dashboard is ready. You can always update these settings later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
