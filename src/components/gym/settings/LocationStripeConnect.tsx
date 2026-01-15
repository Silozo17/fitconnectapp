import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, AlertCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export function LocationStripeConnect() {
  const { gym, isOwner } = useGym();
  const { data: locations, isLoading } = useGymLocations();
  const [connectingLocationId, setConnectingLocationId] = useState<string | null>(null);

  const handleConnectStripe = async (locationId: string) => {
    setConnectingLocationId(locationId);

    try {
      const { data, error } = await supabase.functions.invoke(
        "gym-stripe-connect-onboard",
        {
          body: {
            gymId: gym?.id,
            locationId,
            returnUrl: window.location.href,
          },
        }
      );

      if (error) throw error;

      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, "_blank");
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast.error("Failed to start Stripe connection");
    } finally {
      setConnectingLocationId(null);
    }
  };

  // Check if gym-level Stripe is connected
  const gymStripeConnected = gym?.stripe_account_id && gym?.stripe_onboarding_complete;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Processing</CardTitle>
        <CardDescription>
          Connect Stripe to accept payments at each location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gym-level Stripe Status */}
        <div className={`p-4 border rounded-lg ${gymStripeConnected ? 'bg-green-50 dark:bg-green-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${gymStripeConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
              {gymStripeConnected ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${gymStripeConnected ? 'text-green-900 dark:text-green-100' : 'text-amber-900 dark:text-amber-100'}`}>
                {gymStripeConnected ? "Stripe Connected" : "Stripe Not Connected"}
              </p>
              <p className={`text-sm ${gymStripeConnected ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {gymStripeConnected 
                  ? "Payment processing is active for your gym"
                  : "Connect Stripe to accept payments"
                }
              </p>
            </div>
            {!gymStripeConnected && isOwner && (
              <Button
                onClick={() => handleConnectStripe("")}
                disabled={!!connectingLocationId}
              >
                {connectingLocationId === "" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="mr-2 h-4 w-4" />
                )}
                Connect Stripe
              </Button>
            )}
          </div>
        </div>

        {/* Per-Location Stripe Status */}
        {locations && locations.length > 1 && (
          <>
            <div className="text-sm font-medium text-muted-foreground pt-2">
              Location-Specific Stripe Accounts
            </div>
            {locations.map((location) => {
              const isConnected = location.stripe_account_id && location.stripe_onboarding_complete;
              
              return (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="secondary">Not Connected</Badge>
                        {isOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectStripe(location.id)}
                            disabled={!!connectingLocationId}
                          >
                            {connectingLocationId === location.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <LinkIcon className="mr-2 h-4 w-4" />
                            )}
                            Connect
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
