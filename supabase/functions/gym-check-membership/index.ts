import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GYM-CHECK-MEMBERSHIP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { gymId } = await req.json();
    if (!gymId) throw new Error("Missing gymId parameter");

    // Get gym details
    const { data: gym, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, name, stripe_account_id, stripe_account_status")
      .eq("id", gymId)
      .single();

    if (gymError) throw new Error(`Failed to fetch gym: ${gymError.message}`);
    if (!gym) throw new Error("Gym not found");

    // Get member record
    const { data: member, error: memberError } = await supabaseClient
      .from("gym_members")
      .select("id, status")
      .eq("gym_id", gymId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) throw new Error(`Failed to check membership: ${memberError.message}`);

    // If no member record, not a member
    if (!member) {
      logStep("No member record found");
      return new Response(
        JSON.stringify({
          isMember: false,
          hasActiveMembership: false,
          memberId: null,
          membership: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get active membership
    const { data: membership, error: membershipError } = await supabaseClient
      .from("gym_memberships")
      .select(`
        id,
        status,
        current_period_start,
        current_period_end,
        credits_remaining,
        credits_expire_at,
        paused_at,
        pause_until,
        cancelled_at,
        cancel_at_period_end,
        started_at,
        plan:membership_plans!inner(
          id,
          name,
          plan_type,
          price_amount,
          currency,
          billing_interval,
          class_credits,
          unlimited_classes,
          max_classes_per_week
        )
      `)
      .eq("member_id", member.id)
      .eq("gym_id", gymId)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      logStep("Warning: Failed to fetch membership", { error: membershipError.message });
    }

    const hasActiveMembership = !!membership && membership.status === "active";
    
    // If gym has Stripe Connect, also verify with Stripe
    let stripeSubscriptionActive = false;
    if (membership?.status === "active" && gym.stripe_account_id && gym.stripe_account_status === "active") {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        
        // Find customer on the connected account
        const customers = await stripe.customers.list(
          { email: user.email, limit: 1 },
          { stripeAccount: gym.stripe_account_id }
        );

        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          
          // Check for active subscriptions
          const subscriptions = await stripe.subscriptions.list(
            { customer: customerId, status: "active", limit: 1 },
            { stripeAccount: gym.stripe_account_id }
          );

          stripeSubscriptionActive = subscriptions.data.length > 0;
          
          if (stripeSubscriptionActive) {
            const sub = subscriptions.data[0];
            // Update membership with current period from Stripe
            await supabaseClient
              .from("gym_memberships")
              .update({
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", membership.id);
          }
        }
        
        logStep("Stripe verification complete", { stripeSubscriptionActive });
      } catch (stripeError) {
        logStep("Warning: Stripe verification failed", { error: String(stripeError) });
        // Continue with database status if Stripe check fails
      }
    }

    logStep("Membership check complete", {
      memberId: member.id,
      hasActiveMembership,
      membershipId: membership?.id,
    });

    // Extract plan from the nested object (Supabase returns it as an object when using !inner)
    const plan = membership?.plan as unknown as {
      id: string;
      name: string;
      plan_type: string;
      price_amount: number;
      currency: string;
      billing_interval: string;
      class_credits: number | null;
      unlimited_classes: boolean;
      max_classes_per_week: number | null;
    } | null;

    return new Response(
      JSON.stringify({
        isMember: true,
        hasActiveMembership,
        memberId: member.id,
        memberStatus: member.status,
        membership: membership ? {
          id: membership.id,
          status: membership.status,
          planName: plan?.name,
          planType: plan?.plan_type,
          creditsRemaining: membership.credits_remaining,
          creditsExpireAt: membership.credits_expire_at,
          currentPeriodEnd: membership.current_period_end,
          isPaused: membership.status === "paused",
          pauseUntil: membership.pause_until,
          unlimitedClasses: plan?.unlimited_classes,
          maxClassesPerWeek: plan?.max_classes_per_week,
        } : null,
        stripeVerified: stripeSubscriptionActive,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
