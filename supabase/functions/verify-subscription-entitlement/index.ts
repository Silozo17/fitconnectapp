import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-SUBSCRIPTION-ENTITLEMENT] ${step}${detailsStr}`);
};

// Subscription entitlements to check (in order of tier priority - highest first)
const SUBSCRIPTION_ENTITLEMENTS = ['enterprise', 'pro', 'starter'] as const;

// All possible subscription tiers - founder is permanent and immutable
type SubscriptionTier = typeof SUBSCRIPTION_ENTITLEMENTS[number] | 'free' | 'founder';
type ActiveSubscriptionTier = typeof SUBSCRIPTION_ENTITLEMENTS[number];

// Narrowed tier for comparison after founder early-exit
type NonFounderTier = Exclude<SubscriptionTier, 'founder'>;

interface RevenueCatEntitlement {
  expires_date: string;
  purchase_date: string;
  product_identifier: string;
  grace_period_expires_date?: string;
}

interface RevenueCatSubscription {
  expires_date: string;
  purchase_date: string;
  original_purchase_date: string;
  product_plan_identifier?: string;
  store: string;
  unsubscribe_detected_at?: string; // Key for detecting cancellation
  billing_issues_detected_at?: string;
  grace_period_expires_date?: string;
  is_sandbox: boolean;
  ownership_type?: string;
}

interface RevenueCatSubscriberResponse {
  subscriber: {
    entitlements: Record<string, RevenueCatEntitlement>;
    subscriptions: Record<string, RevenueCatSubscription>;
  };
}

// Map RevenueCat product IDs to our tier names (same as webhook)
const productToTier: Record<string, string> = {
  // iOS App Store product IDs
  "fitconnect.starter.monthly": "starter",
  "fitconnect.starter.annual": "starter",
  "fitconnect.pro.monthly": "pro",
  "fitconnect.pro.annual": "pro",
  "fitconnect.enterprise.monthly": "enterprise",
  "fitconnect.enterprise.annual": "enterprise",
  
  // Android Google Play product IDs
  "starter.monthly.play": "starter",
  "starter.annual.play": "starter",
  "pro.monthly.play": "pro",
  "pro.annual.play": "pro",
  "enterprise.monthly.play": "enterprise",
  "enterprise.annual.play": "enterprise",
};

/**
 * Extract tier from product ID (handles both direct mapping and keyword matching)
 */
const getTierFromProductId = (productId: string): string | null => {
  // Direct mapping first
  if (productToTier[productId]) {
    return productToTier[productId];
  }
  
  // Fallback: check if product ID contains tier keywords
  const productIdLower = productId.toLowerCase();
  if (productIdLower.includes('enterprise')) return 'enterprise';
  if (productIdLower.includes('pro')) return 'pro';
  if (productIdLower.includes('starter')) return 'starter';
  
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const revenueCatApiKey = Deno.env.get("REVENUECAT_API_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!revenueCatApiKey || !supabaseUrl || !supabaseServiceKey) {
      logStep("Missing environment variables");
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      logStep("No authorization token provided");
      throw new Error("Unauthorized");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      logStep("Auth error", { error: authError?.message });
      throw new Error("Unauthorized");
    }

    logStep("Verifying subscription entitlement", { userId: user.id });

    // Get coach profile
    const { data: coachProfile, error: profileError } = await supabase
      .from("coach_profiles")
      .select("id, subscription_tier")
      .eq("user_id", user.id)
      .single();

    if (profileError || !coachProfile) {
      logStep("No coach profile found", { userId: user.id, error: profileError?.message });
      return new Response(JSON.stringify({ 
        status: "no_coach_profile", 
        reconciled: false 
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const currentDbTier = (coachProfile.subscription_tier as SubscriptionTier) || 'free';
    logStep("Found coach profile", { coachId: coachProfile.id, currentTier: currentDbTier });

    // CRITICAL: Founder tier is IMMUTABLE - never reconcile or sync with RevenueCat
    // Founder status is granted by admin and cannot be automatically changed
    if (currentDbTier === 'founder') {
      logStep("FOUNDER TIER DETECTED - Skipping reconciliation (immutable)", { 
        coachId: coachProfile.id,
        reason: "Founder tier is permanent and cannot be modified by automated processes"
      });
      return new Response(JSON.stringify({ 
        status: "founder_immutable", 
        reconciled: false,
        tier: "founder",
        message: "Founder tier is permanent and protected from automatic changes"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // PHASE 2 FIX: Check for admin-granted subscription BEFORE RevenueCat
    // This ensures admin grants are never overwritten by RevenueCat reconciliation
    const { data: adminSub, error: adminSubError } = await supabase
      .from("admin_granted_subscriptions")
      .select("tier, is_active, expires_at")
      .eq("coach_id", coachProfile.id)
      .eq("is_active", true)
      .maybeSingle();
    
    if (!adminSubError && adminSub && adminSub.is_active) {
      const isExpired = adminSub.expires_at && new Date(adminSub.expires_at) < new Date();
      if (!isExpired) {
        logStep("Active admin-granted subscription found BEFORE RevenueCat check - preserving tier", { 
          tier: adminSub.tier,
          expires_at: adminSub.expires_at 
        });
        
        // Ensure coach profile has the admin-granted tier (in case it got out of sync)
        if (currentDbTier !== adminSub.tier) {
          await supabase
            .from("coach_profiles")
            .update({ subscription_tier: adminSub.tier })
            .eq("id", coachProfile.id);
          logStep("Updated coach profile tier to match admin grant", { 
            from: currentDbTier, 
            to: adminSub.tier 
          });
        }
        
        return new Response(JSON.stringify({ 
          status: "admin_granted", 
          reconciled: currentDbTier !== adminSub.tier,
          tier: adminSub.tier,
          expires_at: adminSub.expires_at,
          message: "Admin-granted subscription is active and protected"
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Get current subscription status from DB
    const { data: currentSub } = await supabase
      .from("platform_subscriptions")
      .select("status, tier, current_period_end")
      .eq("coach_id", coachProfile.id)
      .maybeSingle();

    logStep("Current subscription record", { currentSub });

    // Call RevenueCat API to get subscriber entitlements
    const rcResponse = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
      {
        headers: {
          "Authorization": `Bearer ${revenueCatApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rcResponse.ok) {
      if (rcResponse.status === 404) {
        // No subscriber in RevenueCat - ensure downgraded to free
        // Note: Founder and admin-granted tiers already handled above with early return
        // This path should rarely be hit for admin grants now
        if (currentDbTier !== 'free') {
          logStep("No RevenueCat subscriber found - downgrading", { currentTier: currentDbTier });
          
          // Downgrade to free (admin grants already checked above)
          await supabase.from("coach_profiles").update({ subscription_tier: "free" }).eq("id", coachProfile.id);
          if (currentSub) {
            await supabase.from("platform_subscriptions").update({ status: "expired" }).eq("coach_id", coachProfile.id);
          }
          logStep("Downgraded to free - no active RevenueCat subscription");
          return new Response(JSON.stringify({ 
            status: "downgraded", 
            reconciled: true,
            tier: "free"
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({
          status: "no_subscriber", 
          reconciled: false,
          tier: currentDbTier
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      const errorText = await rcResponse.text();
      logStep("RevenueCat API error", { status: rcResponse.status, error: errorText });
      throw new Error(`RevenueCat API error: ${rcResponse.status}`);
    }

    const rcData: RevenueCatSubscriberResponse = await rcResponse.json();
    const entitlements = rcData?.subscriber?.entitlements || {};
    const subscriptions = rcData?.subscriber?.subscriptions || {};

    logStep("RevenueCat data", { 
      entitlementIds: Object.keys(entitlements),
      subscriptionProductIds: Object.keys(subscriptions),
      entitlements: Object.fromEntries(
        Object.entries(entitlements).map(([k, v]) => [k, { expires_date: v.expires_date }])
      ),
      subscriptions: Object.fromEntries(
        Object.entries(subscriptions).map(([k, v]) => [k, { 
          expires_date: v.expires_date,
          unsubscribe_detected_at: v.unsubscribe_detected_at 
        }])
      )
    });

    // PHASE 2 FIX: Use SUBSCRIPTIONS object (product-first) for tier detection
    // This is more reliable than entitlements which can lag behind product changes
    let activeTier: SubscriptionTier | null = null;
    let expiresDate: Date | null = null;
    let isInGracePeriod = false;
    let isCancelled = false;
    const now = new Date();

    // First, scan subscriptions for the highest active tier
    for (const [productId, subscription] of Object.entries(subscriptions)) {
      // Skip boost products
      if (productId.toLowerCase().includes('boost')) continue;
      
      const tier = getTierFromProductId(productId);
      if (!tier) continue;
      
      const expiration = new Date(subscription.expires_date);
      
      // Check if subscription is still valid (not expired)
      if (expiration > now) {
        // Check if this tier is higher than current best
        const tierPriority = SUBSCRIPTION_ENTITLEMENTS.indexOf(tier as ActiveSubscriptionTier);
        const currentPriority = activeTier ? SUBSCRIPTION_ENTITLEMENTS.indexOf(activeTier as ActiveSubscriptionTier) : Infinity;
        
        if (tierPriority !== -1 && tierPriority < currentPriority) {
          activeTier = tier as ActiveSubscriptionTier;
          expiresDate = expiration;
          
          // Check for cancellation via unsubscribe_detected_at
          isCancelled = !!subscription.unsubscribe_detected_at;
          
          // Check for grace period
          if (subscription.billing_issues_detected_at && subscription.grace_period_expires_date) {
            const gracePeriodEnd = new Date(subscription.grace_period_expires_date);
            if (gracePeriodEnd > now) {
              isInGracePeriod = true;
            }
          }
          
          logStep("Found active subscription (product-first)", { 
            productId, 
            tier,
            expiresDate: subscription.expires_date,
            isCancelled,
            isInGracePeriod 
          });
        }
      }
    }

    // Fallback: If no active subscription found via products, check entitlements
    if (!activeTier) {
      for (const entitlementId of SUBSCRIPTION_ENTITLEMENTS) {
        const entitlement = entitlements[entitlementId];
        if (entitlement) {
          const expiration = new Date(entitlement.expires_date);
          
          // Check if entitlement is active (not expired)
          if (expiration > now) {
            activeTier = entitlementId;
            expiresDate = expiration;
            logStep("Found active subscription entitlement (fallback)", { 
              entitlementId, 
              expiresDate: entitlement.expires_date 
            });
            break;
          }
          
          // Check if in grace period
          if (entitlement.grace_period_expires_date) {
            const gracePeriodEnd = new Date(entitlement.grace_period_expires_date);
            if (gracePeriodEnd > now) {
              activeTier = entitlementId;
              expiresDate = gracePeriodEnd;
              isInGracePeriod = true;
              logStep("Found entitlement in grace period (fallback)", { 
                entitlementId, 
                gracePeriodEnd: entitlement.grace_period_expires_date 
              });
              break;
            }
          }
        }
      }
    }

    // Determine if reconciliation is needed
    const dbStatus = currentSub?.status;
    // Use 'cancelled' status if user cancelled but still has access
    const expectedStatus = isCancelled ? 'cancelled' : (isInGracePeriod ? 'past_due' : 'active');

    if (activeTier) {
      // Active entitlement found - ensure DB matches
      const needsUpdate = currentDbTier !== activeTier || dbStatus !== expectedStatus;
      
      if (needsUpdate) {
        logStep("Reconciling: Updating to active tier", { 
          fromTier: currentDbTier, 
          toTier: activeTier,
          fromStatus: dbStatus,
          toStatus: expectedStatus,
          isInGracePeriod
        });

        // Update coach profile
        const { error: profileError } = await supabase
          .from("coach_profiles")
          .update({ subscription_tier: activeTier })
          .eq("id", coachProfile.id);
        
        if (profileError) {
          logStep("Error updating coach profile tier", { error: profileError.message });
        }

        // Upsert subscription record - now works correctly with UNIQUE constraint on coach_id
        const { data: upsertData, error: upsertError } = await supabase
          .from("platform_subscriptions")
          .upsert({
            coach_id: coachProfile.id,
            tier: activeTier,
            status: expectedStatus,
            current_period_end: expiresDate?.toISOString(),
            stripe_subscription_id: currentSub?.tier ? undefined : `rc_reconciled_${Date.now()}`,
            stripe_customer_id: currentSub?.tier ? undefined : `rc_${user.id}`,
            updated_at: new Date().toISOString(),
          }, { onConflict: "coach_id" })
          .select('id, tier, status');
        
        if (upsertError) {
          logStep("Error upserting platform_subscriptions", { error: upsertError.message });
        } else {
          logStep("Successfully upserted platform_subscriptions", { 
            upsertedRows: upsertData?.length || 0,
            data: upsertData
          });
        }

        return new Response(JSON.stringify({ 
          status: "reconciled", 
          reconciled: true,
          tier: activeTier,
          expires_at: expiresDate?.toISOString(),
          is_grace_period: isInGracePeriod,
          is_cancelled: isCancelled,
          effective_end_date: isCancelled ? expiresDate?.toISOString() : null,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ 
        status: "already_correct", 
        reconciled: false,
        tier: activeTier,
        expires_at: expiresDate?.toISOString(),
        is_cancelled: isCancelled,
        effective_end_date: isCancelled ? expiresDate?.toISOString() : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      // No active entitlement - ensure downgraded
      // Note: Founder and admin-granted tiers already handled above with early return
      // This path should rarely be hit for admin grants now
      if (currentDbTier !== 'free') {
        logStep("Reconciling: Downgrading to free (no active entitlement)", { from: currentDbTier });

        await supabase
          .from("coach_profiles")
          .update({ subscription_tier: "free" })
          .eq("id", coachProfile.id);

        if (currentSub) {
          await supabase
            .from("platform_subscriptions")
            .update({ status: "expired", updated_at: new Date().toISOString() })
            .eq("coach_id", coachProfile.id);
        }

        return new Response(JSON.stringify({ 
          status: "downgraded", 
          reconciled: true,
          tier: "free"
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ 
        status: "no_active_entitlement", 
        reconciled: false,
        tier: currentDbTier
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[VERIFY-SUBSCRIPTION-ENTITLEMENT] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
