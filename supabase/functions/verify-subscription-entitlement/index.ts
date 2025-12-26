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

type SubscriptionTier = typeof SUBSCRIPTION_ENTITLEMENTS[number] | 'free' | 'founder';

interface RevenueCatEntitlement {
  expires_date: string;
  purchase_date: string;
  product_identifier: string;
  grace_period_expires_date?: string;
}

interface RevenueCatSubscriberResponse {
  subscriber: {
    entitlements: Record<string, RevenueCatEntitlement>;
    subscriptions: Record<string, unknown>;
  };
}

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
        // No subscriber in RevenueCat - ensure downgraded to free (unless founder)
        if (currentDbTier !== 'free' && currentDbTier !== 'founder') {
          logStep("No RevenueCat subscriber found - checking if downgrade needed", { currentTier: currentDbTier });
          
          // Double-check there's no active admin-granted subscription
          const { data: adminSub } = await supabase
            .from("admin_granted_subscriptions")
            .select("tier, is_active, expires_at")
            .eq("coach_id", coachProfile.id)
            .eq("is_active", true)
            .maybeSingle();
          
          if (adminSub && (!adminSub.expires_at || new Date(adminSub.expires_at) > new Date())) {
            logStep("Active admin-granted subscription found - keeping tier", { tier: adminSub.tier });
            return new Response(JSON.stringify({ 
              status: "admin_granted", 
              reconciled: false,
              tier: adminSub.tier
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          
          // No RevenueCat and no admin grant - downgrade
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

    logStep("RevenueCat entitlements", { 
      entitlementIds: Object.keys(entitlements),
      entitlements: Object.fromEntries(
        Object.entries(entitlements).map(([k, v]) => [k, { expires_date: v.expires_date }])
      )
    });

    // Find highest active subscription entitlement
    let activeTier: SubscriptionTier | null = null;
    let expiresDate: Date | null = null;
    let isInGracePeriod = false;

    for (const entitlementId of SUBSCRIPTION_ENTITLEMENTS) {
      const entitlement = entitlements[entitlementId];
      if (entitlement) {
        const expiration = new Date(entitlement.expires_date);
        const now = new Date();
        
        // Check if entitlement is active (not expired)
        if (expiration > now) {
          activeTier = entitlementId;
          expiresDate = expiration;
          logStep("Found active subscription entitlement", { 
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
            logStep("Found entitlement in grace period", { 
              entitlementId, 
              gracePeriodEnd: entitlement.grace_period_expires_date 
            });
            break;
          }
        }
      }
    }

    // Determine if reconciliation is needed
    const dbStatus = currentSub?.status;
    const expectedStatus = isInGracePeriod ? 'past_due' : 'active';

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
        await supabase
          .from("coach_profiles")
          .update({ subscription_tier: activeTier })
          .eq("id", coachProfile.id);

        // Upsert subscription record
        await supabase
          .from("platform_subscriptions")
          .upsert({
            coach_id: coachProfile.id,
            tier: activeTier,
            status: expectedStatus,
            current_period_end: expiresDate?.toISOString(),
            stripe_subscription_id: currentSub?.tier ? undefined : `rc_reconciled_${Date.now()}`,
            stripe_customer_id: currentSub?.tier ? undefined : `rc_${user.id}`,
            updated_at: new Date().toISOString(),
          }, { onConflict: "coach_id" });

        return new Response(JSON.stringify({ 
          status: "reconciled", 
          reconciled: true,
          tier: activeTier,
          expires_at: expiresDate?.toISOString(),
          is_grace_period: isInGracePeriod
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ 
        status: "already_correct", 
        reconciled: false,
        tier: activeTier,
        expires_at: expiresDate?.toISOString()
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      // No active entitlement - ensure downgraded (unless founder or admin-granted)
      if (currentDbTier !== 'free' && currentDbTier !== 'founder') {
        // Check for admin-granted subscription before downgrading
        const { data: adminSub } = await supabase
          .from("admin_granted_subscriptions")
          .select("tier, is_active, expires_at")
          .eq("coach_id", coachProfile.id)
          .eq("is_active", true)
          .maybeSingle();
        
        if (adminSub && (!adminSub.expires_at || new Date(adminSub.expires_at) > new Date())) {
          logStep("Active admin-granted subscription found - keeping tier", { tier: adminSub.tier });
          return new Response(JSON.stringify({ 
            status: "admin_granted", 
            reconciled: false,
            tier: adminSub.tier
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
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
