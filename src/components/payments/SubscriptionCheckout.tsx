import { useCallback, useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { TierKey, BillingInterval } from "@/lib/stripe-config";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCountry } from "@/hooks/useCountry";
import { isDespia } from "@/lib/despia";

interface SubscriptionCheckoutProps {
  tier: TierKey;
  billingInterval: BillingInterval;
}

export function SubscriptionCheckout({ tier, billingInterval }: SubscriptionCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);
  const { countryCode } = useCountry();

  // PHASE 5 FIX: HARD BLOCK - Never render Stripe checkout on native apps
  if (isDespia()) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-sm">
          <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">Subscription Not Available Here</p>
          <p className="text-amber-600 text-sm mt-2">
            Please use the in-app subscription buttons to subscribe. Stripe checkout is only available on web.
          </p>
        </div>
      </div>
    );
  }

  // Fetch Stripe publishable key on mount
  useEffect(() => {
    async function initStripe() {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-stripe-config");
        
        if (fnError || !data?.publishableKey) {
          throw new Error("Failed to load Stripe configuration");
        }
        
        setStripePromise(loadStripe(data.publishableKey));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize Stripe");
      } finally {
        setIsLoadingStripe(false);
      }
    }
    
    initStripe();
  }, []);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-subscription-checkout",
        {
          body: { tier, billingInterval, countryCode },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to create checkout session");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.clientSecret) {
        throw new Error("No client secret returned");
      }

      return data.clientSecret;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize checkout";
      setError(message);
      throw err;
    }
  }, [tier, billingInterval, countryCode]);

  if (isLoadingStripe) {
    return <CheckoutLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <p className="text-red-800 font-medium">Unable to load checkout</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoadingStripe(true);
            }}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return <CheckoutLoading />;
  }

  const options = { fetchClientSecret };

  return (
    <div id="checkout" className="min-h-[500px]">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="text-gray-500 text-sm">Loading checkout...</p>
    </div>
  );
}
