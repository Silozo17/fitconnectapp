import { useCallback, useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export type CheckoutType = "package" | "subscription" | "digital-product" | "digital-bundle";

interface UnifiedEmbeddedCheckoutProps {
  checkoutType: CheckoutType;
  itemId: string;
  coachId?: string;
  clientId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function UnifiedEmbeddedCheckout({
  checkoutType,
  itemId,
  coachId,
  clientId,
  successUrl,
  cancelUrl,
}: UnifiedEmbeddedCheckoutProps) {
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);

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
      let functionName: string;
      let body: Record<string, any>;

      if (checkoutType === "digital-product" || checkoutType === "digital-bundle") {
        functionName = "content-checkout";
        body = {
          productId: checkoutType === "digital-product" ? itemId : undefined,
          bundleId: checkoutType === "digital-bundle" ? itemId : undefined,
          successUrl,
          cancelUrl,
          embedded: true,
        };
      } else {
        functionName = "stripe-checkout";
        body = {
          type: checkoutType,
          itemId,
          coachId,
          clientId,
          successUrl,
          cancelUrl,
          embedded: true,
        };
      }

      const { data, error: fnError } = await supabase.functions.invoke(functionName, { body });

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
  }, [checkoutType, itemId, coachId, clientId, successUrl, cancelUrl]);

  if (isLoadingStripe) {
    return <CheckoutLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-sm">
          <p className="text-destructive font-medium">Unable to load checkout</p>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoadingStripe(true);
            }}
            className="mt-3 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-md text-sm font-medium transition-colors"
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
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground text-sm">Loading checkout...</p>
    </div>
  );
}
