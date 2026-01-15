import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StripeConfig {
  publishableKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useStripeConfig(): StripeConfig {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: fetchError } = await supabase.functions.invoke(
          "get-stripe-config"
        );

        if (fetchError) {
          throw fetchError;
        }

        setPublishableKey(data.publishableKey);
      } catch (err) {
        console.error("Failed to fetch Stripe config:", err);
        setError(err instanceof Error ? err.message : "Failed to load Stripe configuration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { publishableKey, isLoading, error };
}
