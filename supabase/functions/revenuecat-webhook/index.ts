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

// RevenueCat event types - comprehensive list
type RevenueCatEventType = 
  | "INITIAL_PURCHASE"
  | "NON_RENEWING_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "UNCANCELLATION"
  | "EXPIRATION"
  | "BILLING_ISSUE"
  | "BILLING_ISSUES_GRACE_PERIOD_EXPIRED"
  | "SUBSCRIBER_ALIAS"
  | "PRODUCT_CHANGE"
  | "TRANSFER"
  | "REFUND"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "TEST";

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

// Entitlement ID to tier mapping (entitlement-first approach)
const entitlementToTier: Record<string, string> = {
  'starter': 'starter',
  'pro': 'pro',
  'enterprise': 'enterprise',
};

// Boost product IDs (non-renewing subs / consumables)
const boostProductIds = [
  // iOS - Non-renewing subscription
  "boost.fitconnect.apple",
  // Android - Consumable
  "fitconnect.boost.play",
  // Legacy fallback
  "fitconnect.boost",
];

/**
 * Check if a product or entitlement is for boost
 * Entitlement-first: if entitlement_ids includes 'boost', it's a boost purchase
 */
const isBoostProduct = (productId: string | undefined, entitlementIds?: string[]): boolean => {
  // Entitlement check takes priority (most reliable)
  if (entitlementIds?.includes('boost')) {
    return true;
  }
  if (!productId) return false;
  return boostProductIds.some(id => productId.includes(id));
};

/**
 * Get tier from event using entitlement-first approach
 * Falls back to product ID mapping if no entitlement match
 */
const getTierFromEvent = (event: RevenueCatEvent): string | null => {
  // First, check entitlements (most reliable - handles product ID variations)
  if (event.entitlement_ids?.length) {
    for (const entId of event.entitlement_ids) {
      if (entitlementToTier[entId]) {
        logStep("Tier from entitlement", { entitlementId: entId, tier: entitlementToTier[entId] });
        return entitlementToTier[entId];
      }
    }
  }
  
  // Fallback to product ID mapping
  if (event.product_id && productToTier[event.product_id]) {
    logStep("Tier from product_id", { productId: event.product_id, tier: productToTier[event.product_id] });
    return productToTier[event.product_id];
  }
  
  // Also check new_product_id for PRODUCT_CHANGE events
  if (event.new_product_id && productToTier[event.new_product_id]) {
    logStep("Tier from new_product_id", { newProductId: event.new_product_id, tier: productToTier[event.new_product_id] });
    return productToTier[event.new_product_id];
  }
  
  return null;
};

/**
 * Activate boost for a coach - handles stacking and idempotency
 */
const activateBoost = async (
  supabase: ReturnType<typeof createClient<Record<string, unknown>>>,
  coachId: string,
  event: RevenueCatEvent
): Promise<{ success: boolean; error?: string; startDate?: Date; endDate?: Date }> => {
  // Check for existing active boost to stack time
  const { data: existingBoost } = await supabase
    .from("coach_boosts")
    .select("boost_end_date, payment_status, activation_payment_intent_id")
    .eq("coach_id", coachId)
    .maybeSingle();

  const transactionId = `rc_${event.transaction_id || event.original_transaction_id}`;
  
  // Idempotency check - prevent duplicate activations for same transaction
  if (existingBoost?.activation_payment_intent_id === transactionId && 
      existingBoost?.payment_status === 'succeeded') {
    logStep("Duplicate transaction detected - already processed", { transactionId });
    return { 
      success: true, 
      startDate: new Date(existingBoost.boost_end_date), 
      endDate: new Date(existingBoost.boost_end_date) 
    };
  }

  const now = new Date();
  let startDate = now;
  let endDate = new Date(now);

  // If there's an existing active boost that hasn't expired, stack from its end date
  if (existingBoost?.boost_end_date) {
    const existingEndDate = new Date(existingBoost.boost_end_date);
    if (existingEndDate > now && (existingBoost.payment_status === 'succeeded' || existingBoost.payment_status === 'migrated_free')) {
      // Stack: new 30 days starts from existing end date
      startDate = existingEndDate;
      endDate = new Date(existingEndDate);
      endDate.setDate(endDate.getDate() + 30);
      logStep("Stacking boost from existing end date", { existingEndDate: existingEndDate.toISOString(), newEndDate: endDate.toISOString() });
    } else {
      // Expired or not succeeded - start from now
      endDate.setDate(endDate.getDate() + 30);
    }
  } else {
    // No existing boost - start from now
    endDate.setDate(endDate.getDate() + 30);
  }

  const { error: boostError } = await supabase
    .from("coach_boosts")
    .upsert({
      coach_id: coachId,
      is_active: true,
      boost_start_date: startDate.toISOString(),
      boost_end_date: endDate.toISOString(),
      payment_status: "succeeded",
      activation_payment_intent_id: transactionId,
      activated_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: "coach_id" });

  if (boostError) {
    logStep("Error activating boost", { error: boostError.message });
    return { success: false, error: boostError.message };
  }

  logStep("Successfully activated boost via IAP", { coachId, startDate: startDate.toISOString(), endDate: endDate.toISOString() });
  return { success: true, startDate, endDate };
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
      entitlementIds: event.entitlement_ids,
      store: event.store,
      environment: event.environment 
    });

    // Get coach ID from app_user_id
    const coachId = await extractCoachId(supabase, event.app_user_id);

    if (!coachId && event.type !== "SUBSCRIBER_ALIAS" && event.type !== "TEST") {
      logStep("Coach not found for app_user_id", { appUserId: event.app_user_id });
      // Return 200 to acknowledge receipt but log the issue
      return new Response(JSON.stringify({ received: true, warning: "Coach not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get tier using entitlement-first approach
    const tier = getTierFromEvent(event);

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE": {
        logStep(`Processing ${event.type}`, { coachId, tier, productId: event.product_id, entitlementIds: event.entitlement_ids });

        // Check if this is a boost purchase (entitlement-first)
        if (isBoostProduct(event.product_id, event.entitlement_ids)) {
          logStep("Processing BOOST purchase", { coachId, productId: event.product_id, entitlementIds: event.entitlement_ids });
          await activateBoost(supabase, coachId!, event);
          break;
        }

        // Skip tier handling for NON_RENEWING_PURCHASE (non-subscription products)
        if (event.type === "NON_RENEWING_PURCHASE") {
          logStep("NON_RENEWING_PURCHASE is not a subscription product", { productId: event.product_id });
          break;
        }

        if (!tier) {
          logStep("Unknown product ID / no matching entitlement", { productId: event.product_id, entitlementIds: event.entitlement_ids });
          break;
        }

        const transactionId = `rc_${event.original_transaction_id || event.transaction_id}`;
        
        // Idempotency check - prevent duplicate subscription activations
        const { data: existingSub } = await supabase
          .from("platform_subscriptions")
          .select("stripe_subscription_id, status, tier")
          .eq("coach_id", coachId)
          .maybeSingle();

        if (existingSub?.stripe_subscription_id === transactionId && 
            existingSub?.status === 'active' && 
            existingSub?.tier === tier) {
          logStep("Duplicate subscription transaction - already processed", { transactionId, tier });
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
            stripe_subscription_id: transactionId,
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
        logStep("Processing RENEWAL", { coachId, tier, productId: event.product_id, entitlementIds: event.entitlement_ids });

        const periodEnd = event.expiration_at_ms 
          ? new Date(event.expiration_at_ms).toISOString() 
          : null;

        // Update subscription record
        const updateData: Record<string, unknown> = {
          status: "active",
          current_period_start: event.purchased_at_ms 
            ? new Date(event.purchased_at_ms).toISOString() 
            : new Date().toISOString(),
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        };
        
        // Also update tier if available (handles tier changes during renewal)
        if (tier) {
          updateData.tier = tier;
        }

        const { error } = await supabase
          .from("platform_subscriptions")
          .update(updateData)
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error processing RENEWAL", { error: error.message });
        } else {
          // Also update coach profile tier if we have it
          if (tier) {
            await supabase
              .from("coach_profiles")
              .update({ subscription_tier: tier })
              .eq("id", coachId);
          }
          logStep("Successfully processed RENEWAL", { coachId, tier });
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

        // Mark as past_due - user is in grace period
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

      case "BILLING_ISSUES_GRACE_PERIOD_EXPIRED": {
        logStep("Processing BILLING_ISSUES_GRACE_PERIOD_EXPIRED", { coachId });

        // Grace period over - same as EXPIRATION, downgrade to free
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (subError) {
          logStep("Error updating subscription after grace period", { error: subError.message });
        }

        // Downgrade to free tier
        const { error: profileError } = await supabase
          .from("coach_profiles")
          .update({ subscription_tier: "free" })
          .eq("id", coachId);

        if (profileError) {
          logStep("Error downgrading tier after grace period", { error: profileError.message });
        } else {
          logStep("Successfully processed grace period expiration - downgraded to free", { coachId });
        }
        break;
      }

      case "REFUND": {
        logStep("Processing REFUND", { coachId, productId: event.product_id });

        // Check if this is a boost refund
        if (isBoostProduct(event.product_id, event.entitlement_ids)) {
          logStep("Processing BOOST refund", { coachId });
          const { error: boostError } = await supabase
            .from("coach_boosts")
            .update({
              is_active: false,
              payment_status: "refunded",
              deactivated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("coach_id", coachId);

          if (boostError) {
            logStep("Error processing boost refund", { error: boostError.message });
          } else {
            logStep("Successfully processed BOOST refund", { coachId });
          }
          break;
        }

        // Subscription refund - mark as refunded and downgrade
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (subError) {
          logStep("Error updating subscription status for refund", { error: subError.message });
        }

        // Downgrade to free tier
        const { error: profileError } = await supabase
          .from("coach_profiles")
          .update({ subscription_tier: "free" })
          .eq("id", coachId);

        if (profileError) {
          logStep("Error downgrading tier on refund", { error: profileError.message });
        } else {
          logStep("Successfully processed REFUND - downgraded to free", { coachId });
        }
        break;
      }

      case "SUBSCRIPTION_PAUSED": {
        logStep("Processing SUBSCRIPTION_PAUSED (Google Play)", { coachId });

        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "paused",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error pausing subscription", { error: error.message });
        } else {
          logStep("Successfully paused subscription", { coachId });
        }
        break;
      }

      case "SUBSCRIPTION_RESUMED": {
        logStep("Processing SUBSCRIPTION_RESUMED (Google Play)", { coachId });

        const { error } = await supabase
          .from("platform_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("coach_id", coachId);

        if (error) {
          logStep("Error resuming subscription", { error: error.message });
        } else {
          logStep("Successfully resumed subscription", { coachId });
        }
        break;
      }

      case "PRODUCT_CHANGE": {
        logStep("Processing PRODUCT_CHANGE", { coachId, oldProduct: event.product_id, newProduct: event.new_product_id, entitlementIds: event.entitlement_ids });

        // Use entitlement-first tier detection
        const newTier = getTierFromEvent(event);

        if (!newTier) {
          logStep("Unknown new product ID / no matching entitlement", { newProductId: event.new_product_id, entitlementIds: event.entitlement_ids });
          break;
        }

        // Update tier
        const { error: subError } = await supabase
          .from("platform_subscriptions")
          .update({
            tier: newTier,
            status: "active",
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

      case "TEST": {
        // Test event from RevenueCat - acknowledge and log
        logStep("Received TEST event - acknowledging", { 
          appUserId: event.app_user_id,
          environment: event.environment,
          store: event.store
        });
        break;
      }

      default: {
        // Type-safe exhaustive check
        const _exhaustiveCheck: never = event.type;
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
