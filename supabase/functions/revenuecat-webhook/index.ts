import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REVENUECAT-WEBHOOK] ${step}${detailsStr}`);
};

// RevenueCat event types we care about
type RevenueCatEventType = 
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "EXPIRATION"
  | "BILLING_ISSUE"
  | "SUBSCRIBER_ALIAS"
  | "PRODUCT_CHANGE"
  | "TRANSFER";

interface RevenueCatEvent {
  type: RevenueCatEventType;
  id: string;
  event_timestamp_ms: number;
  app_user_id: string;
  aliases?: string[];
  original_app_user_id?: string;
  product_id?: string;
  entitlement_id?: string;
  entitlement_ids?: string[];
  period_type?: "TRIAL" | "INTRO" | "NORMAL" | "PROMOTIONAL";
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  environment?: "SANDBOX" | "PRODUCTION";
  store?: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "PROMOTIONAL" | "AMAZON";
  is_family_share?: boolean;
  country_code?: string;
  currency?: string;
  price?: number;
  price_in_purchased_currency?: number;
  subscriber_attributes?: Record<string, { value: string; updated_at_ms: number }>;
  transaction_id?: string;
  original_transaction_id?: string;
  new_product_id?: string;
  presented_offering_id?: string;
  cancel_reason?: "UNSUBSCRIBE" | "BILLING_ERROR" | "DEVELOPER_INITIATED" | "PRICE_INCREASE" | "CUSTOMER_SUPPORT" | "UNKNOWN";
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

// Map RevenueCat product IDs to our tier names
const productToTier: Record<string, string> = {
  // iOS App Store product IDs
  "fitconnect.starter.monthly": "starter",
  "fitconnect.starter.annual": "starter",
  "fitconnect.pro.monthly": "pro",
  "fitconnect.pro.annual": "pro",
  "fitconnect.enterprise.monthly": "enterprise",
  "fitconnect.enterprise.annual": "enterprise",
  
  // Android Google Play product IDs (just the product ID part, before the colon)
  "starter.monthly.play": "starter",
  "starter.annual.play": "starter",
  "pro.monthly.play": "pro",
  "pro.annual.play": "pro",
  "enterprise.monthly.play": "enterprise",
  "enterprise.annual.play": "enterprise",
  
  // Legacy underscore format for backwards compatibility
  "fitconnect_starter_monthly": "starter",
  "fitconnect_starter_yearly": "starter",
  "fitconnect_pro_monthly": "pro",
  "fitconnect_pro_yearly": "pro",
  "fitconnect_enterprise_monthly": "enterprise",
  "fitconnect_enterprise_yearly": "enterprise",
};

// Extract coach ID from RevenueCat app_user_id
// We expect the app_user_id to be the coach's profile ID or user ID
const extractCoachId = async (
  supabase: ReturnType<typeof createClient<Record<string, unknown>>>,
  appUserId: string
): Promise<string | null> => {
  // First, try to find coach by user_id (if app_user_id is the auth user ID)
  const { data: coachByUserId } = await supabase
    .from("coach_profiles")
    .select("id")
    .eq("user_id", appUserId)
    .single();

  if (coachByUserId && typeof coachByUserId === 'object' && 'id' in coachByUserId) {
    return coachByUserId.id as string;
  }

  // Otherwise, try to find coach by profile ID directly
  const { data: coachById } = await supabase
    .from("coach_profiles")
    .select("id")
    .eq("id", appUserId)
    .single();

  if (coachById && typeof coachById === 'object' && 'id' in coachById) {
    return coachById.id as string;
  }

  return null;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookAuthKey = Deno.env.get("REVENUECAT_WEBHOOK_AUTH_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookAuthKey || !supabaseUrl || !supabaseServiceKey) {
      logStep("Missing environment variables");
      throw new Error("Missing environment variables");
    }

    // Validate authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== webhookAuthKey) {
      logStep("Invalid authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: RevenueCatWebhookPayload = await req.json();
    const event = payload.event;

    logStep("Received event", { 
      type: event.type, 
      id: event.id, 
      appUserId: event.app_user_id,
      productId: event.product_id,
      store: event.store,
      environment: event.environment 
    });

    // Get coach ID from app_user_id
    const coachId = await extractCoachId(supabase, event.app_user_id);

    if (!coachId && event.type !== "SUBSCRIBER_ALIAS") {
      logStep("Coach not found for app_user_id", { appUserId: event.app_user_id });
      // Return 200 to acknowledge receipt but log the issue
      return new Response(JSON.stringify({ received: true, warning: "Coach not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map product ID to tier
    const tier = event.product_id ? productToTier[event.product_id] : null;

    switch (event.type) {
      case "INITIAL_PURCHASE": {
        logStep("Processing INITIAL_PURCHASE", { coachId, tier, productId: event.product_id });

        if (!tier) {
          logStep("Unknown product ID", { productId: event.product_id });
          break;
        }

        const periodEnd = event.expiration_at_ms 
          ? new Date(event.expiration_at_ms).toISOString() 
          : null;

        // Upsert platform subscription
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .upsert({
            coach_id: coachId,
            tier: tier,
            status: "active",
            current_period_start: event.purchased_at_ms 
              ? new Date(event.purchased_at_ms).toISOString() 
              : new Date().toISOString(),
            current_period_end: periodEnd,
            // Store RevenueCat IDs in stripe fields for now (they're just identifiers)
            stripe_subscription_id: `rc_${event.original_transaction_id || event.transaction_id}`,
            stripe_customer_id: `rc_${event.app_user_id}`,
            updated_at: new Date().toISOString(),
          }, { onConflict: "coach_id" });

        if (subError) {
          logStep("Error upserting platform subscription", { error: subError.message });
        } else {
          // Update coach profile tier
          const { error: profileError } = await supabase
            .from("coach_profiles")
            .update({ subscription_tier: tier })
            .eq("id", coachId);

          if (profileError) {
            logStep("Error updating coach profile tier", { error: profileError.message });
          } else {
            logStep("Successfully processed INITIAL_PURCHASE", { coachId, tier });
          }
        }
        break;
      }

      case "RENEWAL": {
        logStep("Processing RENEWAL", { coachId, tier, productId: event.product_id });

        const periodEnd = event.expiration_at_ms 
          ? new Date(event.expiration_at_ms).toISOString() 
          : null;

        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "active",
            current_period_start: event.purchased_at_ms 
              ? new Date(event.purchased_at_ms).toISOString() 
              : new Date().toISOString(),
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error processing RENEWAL", { error: error.message });
        } else {
          logStep("Successfully processed RENEWAL", { coachId });
        }
        break;
      }

      case "CANCELLATION": {
        logStep("Processing CANCELLATION", { coachId, cancelReason: event.cancel_reason });

        // Mark as cancelled but don't remove access until expiration
        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error processing CANCELLATION", { error: error.message });
        } else {
          logStep("Successfully processed CANCELLATION", { coachId });
        }
        break;
      }

      case "UNCANCELLATION": {
        logStep("Processing UNCANCELLATION", { coachId });

        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error processing UNCANCELLATION", { error: error.message });
        } else {
          logStep("Successfully processed UNCANCELLATION", { coachId });
        }
        break;
      }

      case "EXPIRATION": {
        logStep("Processing EXPIRATION", { coachId });

        // Subscription has fully expired - downgrade to free tier
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (subError) {
          logStep("Error updating subscription status", { error: subError.message });
        }

        // Downgrade coach to free tier
        const { error: profileError } = await supabase
          .from("coach_profiles")
          .update({ subscription_tier: "free" })
          .eq("id", coachId);

        if (profileError) {
          logStep("Error downgrading coach tier", { error: profileError.message });
        } else {
          logStep("Successfully processed EXPIRATION - downgraded to free", { coachId });
        }
        break;
      }

      case "BILLING_ISSUE": {
        logStep("Processing BILLING_ISSUE", { coachId });

        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error processing BILLING_ISSUE", { error: error.message });
        } else {
          logStep("Successfully processed BILLING_ISSUE", { coachId });
        }
        break;
      }

      case "PRODUCT_CHANGE": {
        logStep("Processing PRODUCT_CHANGE", { coachId, oldProduct: event.product_id, newProduct: event.new_product_id });

        const newTier = event.new_product_id ? productToTier[event.new_product_id] : null;

        if (!newTier) {
          logStep("Unknown new product ID", { newProductId: event.new_product_id });
          break;
        }

        // Update tier
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .update({
            tier: newTier,
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (subError) {
          logStep("Error updating subscription tier", { error: subError.message });
        }

        const { error: profileError } = await supabase
          .from("coach_profiles")
          .update({ subscription_tier: newTier })
          .eq("id", coachId);

        if (profileError) {
          logStep("Error updating coach profile tier", { error: profileError.message });
        } else {
          logStep("Successfully processed PRODUCT_CHANGE", { coachId, newTier });
        }
        break;
      }

      case "SUBSCRIBER_ALIAS":
      case "TRANSFER": {
        // These events are informational - just log them
        logStep(`Received ${event.type} event`, { appUserId: event.app_user_id, aliases: event.aliases });
        break;
      }

      default: {
        logStep("Unhandled event type", { type: event.type });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[REVENUECAT-WEBHOOK] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

