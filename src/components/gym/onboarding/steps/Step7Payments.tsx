import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { 
  CreditCard, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step7Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  gymId: string | null;
}

export function Step7Payments({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
  gymId,
}: Step7Props) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStripeConnect = async () => {
    if (!gymId) {
      toast.error('Gym ID not found');
      return;
    }

    setIsConnecting(true);
    try {
      const returnUrl = `${window.location.origin}/onboarding/gym?step=7&stripe_return=true`;
      
      const { data: responseData, error } = await supabase.functions.invoke('gym-stripe-connect-onboard', {
        body: {
          gymId,
          returnUrl,
          existingAccountId: data.stripeAccountId || undefined,
        },
      });

      if (error) throw error;

      if (responseData?.onboardingUrl) {
        // Store account ID before redirecting
        if (responseData.accountId) {
          updateData({ stripeAccountId: responseData.accountId });
        }
        // Open Stripe onboarding in new tab
        window.open(responseData.onboardingUrl, '_blank');
        toast.success('Stripe onboarding opened in a new tab');
      }
    } catch (error: any) {
      console.error('Stripe connect error:', error);
      toast.error(error.message || 'Failed to start Stripe setup');
    } finally {
      setIsConnecting(false);
    }
  };

  const isUK = data.country === 'United Kingdom';

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Payment setup"
      subtitle="Connect Stripe to accept payments"
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
        {/* Stripe Connect Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Connect with Stripe</h3>
              <p className="text-sm text-muted-foreground">
                Accept card payments, direct debits, and more
              </p>
            </div>
          </div>

          {data.stripeConnected ? (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Stripe connected
                </p>
                <p className="text-sm text-muted-foreground">
                  You're ready to accept payments
                </p>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleStripeConnect}
              disabled={isConnecting}
              className="w-full justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connect with Stripe
                </>
              )}
            </Button>
          )}

          {!data.stripeConnected && data.stripeAccountId && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Stripe setup started but not completed. Click above to continue.
              </p>
            </div>
          )}
        </div>

        {/* VAT Section (UK only) */}
        {isUK && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Are you VAT registered?</Label>
                <p className="text-sm text-muted-foreground">
                  Required if your turnover exceeds the VAT threshold
                </p>
              </div>
              <Switch
                checked={data.vatRegistered}
                onCheckedChange={(checked) => updateData({ vatRegistered: checked })}
              />
            </div>

            {data.vatRegistered && (
              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT number</Label>
                <Input
                  id="vatNumber"
                  placeholder="GB123456789"
                  value={data.vatNumber}
                  onChange={(e) => updateData({ vatNumber: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* Skip Note */}
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Note:</strong> You can set up payments later, but you won't be able to accept online bookings or memberships until Stripe is connected.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
