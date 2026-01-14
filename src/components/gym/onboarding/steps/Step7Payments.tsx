import { useState, useEffect } from 'react';
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
  Loader2,
  MapPin 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface LocationStripeStatus {
  id: string;
  name: string;
  stripe_account_id: string | null;
  stripe_account_status: string | null;
  stripe_onboarding_complete: boolean;
  is_primary: boolean;
}

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
  const [connectingLocationId, setConnectingLocationId] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationStripeStatus[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Fetch locations with their Stripe status
  useEffect(() => {
    const fetchLocations = async () => {
      if (!gymId) return;
      
      setLoadingLocations(true);
      try {
        const { data: locationData, error } = await supabase
          .from('gym_locations')
          .select('id, name, stripe_account_id, stripe_account_status, stripe_onboarding_complete, is_primary')
          .eq('gym_id', gymId)
          .eq('is_active', true)
          .order('is_primary', { ascending: false })
          .order('name');

        if (error) throw error;
        setLocations(locationData || []);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [gymId]);

  // Check for Stripe return from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const accountId = params.get('account_id');
    const locationId = params.get('location_id');

    if (success === 'true' && accountId) {
      // Update the location's Stripe status
      if (locationId) {
        setLocations(prev => prev.map(loc => 
          loc.id === locationId 
            ? { ...loc, stripe_account_id: accountId, stripe_account_status: 'active', stripe_onboarding_complete: true }
            : loc
        ));
        toast.success('Stripe connected successfully for this location!');
      } else {
        // Legacy: update main stripe connected status
        updateData({ stripeConnected: true, stripeAccountId: accountId });
        toast.success('Stripe connected successfully!');
      }
      
      // Clean up URL
      const newUrl = window.location.pathname + '?step=7';
      window.history.replaceState({}, '', newUrl);
    }
  }, [updateData]);

  const handleStripeConnect = async (locationId: string) => {
    if (!gymId) {
      toast.error('Gym ID not found');
      return;
    }

    setConnectingLocationId(locationId);
    try {
      const returnUrl = `${window.location.origin}/onboarding/gym?step=7&stripe_return=true`;
      
      const location = locations.find(l => l.id === locationId);
      
      const { data: responseData, error } = await supabase.functions.invoke('gym-stripe-connect-onboard', {
        body: {
          gymId,
          locationId,
          returnUrl,
          existingAccountId: location?.stripe_account_id || undefined,
        },
      });

      if (error) throw error;

      if (responseData?.onboardingUrl) {
        // Open Stripe onboarding in new tab
        window.open(responseData.onboardingUrl, '_blank');
        toast.success('Stripe onboarding opened in a new tab');
      }
    } catch (error: any) {
      console.error('Stripe connect error:', error);
      toast.error(error.message || 'Failed to start Stripe setup');
    } finally {
      setConnectingLocationId(null);
    }
  };

  const isUK = data.country === 'United Kingdom';
  const allLocationsConnected = locations.length > 0 && locations.every(l => l.stripe_onboarding_complete);
  const someLocationsConnected = locations.some(l => l.stripe_onboarding_complete);

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Payment setup"
      subtitle="Connect Stripe for each location to accept payments"
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
        {/* Per-Location Stripe Connect Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Connect with Stripe</h3>
              <p className="text-sm text-muted-foreground">
                Each location needs its own Stripe account for payment processing
              </p>
            </div>
          </div>

          {loadingLocations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : locations.length === 0 ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  No locations found. Please add at least one location in Step 3 before setting up payments.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div 
                  key={location.id}
                  className={`p-4 rounded-lg border ${
                    location.stripe_onboarding_complete 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-secondary/50 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        {location.is_primary && (
                          <span className="text-xs text-muted-foreground">Primary location</span>
                        )}
                      </div>
                    </div>
                    
                    {location.stripe_onboarding_complete ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStripeConnect(location.id)}
                        disabled={connectingLocationId === location.id}
                        className="gap-2"
                      >
                        {connectingLocationId === location.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3" />
                            Connect Stripe
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Show pending status */}
                  {!location.stripe_onboarding_complete && location.stripe_account_id && (
                    <div className="mt-2 flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Setup started but not completed. Click to continue.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary status */}
          {locations.length > 0 && (
            <div className={`p-3 rounded-lg ${
              allLocationsConnected 
                ? 'bg-green-500/10 border border-green-500/30' 
                : someLocationsConnected
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-secondary/50 border border-border'
            }`}>
              {allLocationsConnected ? (
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  All locations are ready to accept payments
                </p>
              ) : someLocationsConnected ? (
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {locations.filter(l => l.stripe_onboarding_complete).length} of {locations.length} locations connected
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect at least one location to accept payments
                </p>
              )}
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
            💡 <strong>Note:</strong> You can set up payments later, but you won't be able to accept online bookings or memberships until at least one location has Stripe connected.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
