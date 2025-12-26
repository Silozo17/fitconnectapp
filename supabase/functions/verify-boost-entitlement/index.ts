import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-BOOST-ENTITLEMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
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

    // Get user from auth header
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

    logStep("Verifying boost entitlement for user", { userId: user.id });

    // Get coach profile
    const { data: coachProfile, error: profileError } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !coachProfile) {
      logStep("Coach profile not found", { error: profileError?.message });
      return new Response(JSON.stringify({ 
        status: "no_coach_profile", 
        reconciled: false 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    logStep("Found coach profile", { coachId: coachProfile.id });

    // Check current boost status
    const { data: boostStatus } = await supabase
      .from("coach_boosts")
      .select("payment_status, boost_end_date, is_active")
      .eq("coach_id", coachProfile.id)
      .maybeSingle();

    // If already succeeded and active, no reconciliation needed
    if (boostStatus?.payment_status === 'succeeded' && boostStatus?.is_active) {
      logStep("Boost already active", { boostStatus });
      return new Response(JSON.stringify({ 
        status: "already_active", 
        reconciled: false,
        boost_end_date: boostStatus.boost_end_date
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Call RevenueCat API to check entitlements
    logStep("Checking RevenueCat entitlements", { userId: user.id });
    
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
      const errorText = await rcResponse.text();
      logStep("RevenueCat API error", { status: rcResponse.status, error: errorText });
      
      // If subscriber not found, that's okay - just no entitlement
      if (rcResponse.status === 404) {
        return new Response(JSON.stringify({ 
          status: "no_subscriber", 
          reconciled: false 
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      
      throw new Error(`RevenueCat API error: ${rcResponse.status}`);
    }

    const rcData = await rcResponse.json();
    const entitlements = rcData?.subscriber?.entitlements || {};

    logStep("RevenueCat entitlements", { entitlements: Object.keys(entitlements) });

    // Check if boost entitlement is active
    const boostEntitlement = entitlements["boost"];
    const hasActiveBoost = boostEntitlement && 
      new Date(boostEntitlement.expires_date) > new Date();

    if (hasActiveBoost) {
      logStep("Found active boost entitlement", { 
        expiresDate: boostEntitlement.expires_date,
        productId: boostEntitlement.product_identifier
      });

      // Reconcile: Activate boost in DB
      const expiresDate = new Date(boostEntitlement.expires_date);
      const now = new Date();
      const purchaseDate = boostEntitlement.purchase_date 
        ? new Date(boostEntitlement.purchase_date) 
        : now;

      const { error: upsertError } = await supabase
        .from("coach_boosts")
        .upsert({
          coach_id: coachProfile.id,
          is_active: true,
          boost_start_date: purchaseDate.toISOString(),
          boost_end_date: expiresDate.toISOString(),
          payment_status: "succeeded",
          activation_payment_intent_id: `rc_reconciled_${Date.now()}`,
          activated_at: now.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: "coach_id" });

      if (upsertError) {
        logStep("Error reconciling boost", { error: upsertError.message });
        throw new Error(`Failed to reconcile boost: ${upsertError.message}`);
      }

      logStep("Successfully reconciled boost", { 
        coachId: coachProfile.id, 
        endDate: expiresDate.toISOString() 
      });

      return new Response(JSON.stringify({ 
        status: "reconciled", 
        reconciled: true,
        boost_end_date: expiresDate.toISOString()
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    logStep("No active boost entitlement found");
    return new Response(JSON.stringify({ 
      status: "no_entitlement", 
      reconciled: false 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[VERIFY-BOOST-ENTITLEMENT] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
