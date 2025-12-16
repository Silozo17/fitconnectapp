import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { TierKey, BillingInterval } from "@/lib/stripe-config";
import { Loader2 } from "lucide-react";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface SubscriptionCheckoutProps {
  tier: TierKey;
  billingInterval: BillingInterval;
}

export function SubscriptionCheckout({ tier, billingInterval }: SubscriptionCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-subscription-checkout",
        {
          body: { tier, billingInterval },
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
  }, [tier, billingInterval]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <p className="text-red-800 font-medium">Unable to load checkout</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
