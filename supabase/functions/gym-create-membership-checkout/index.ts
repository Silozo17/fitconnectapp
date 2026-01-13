import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GYM-MEMBERSHIP-CHECKOUT] ${step}${detailsStr}`);
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
    const { gymId, planId, successUrl, cancelUrl } = await req.json();
    if (!gymId || !planId || !successUrl || !cancelUrl) {
      throw new Error("Missing required parameters");
    }

    // Get membership plan details
    const { data: plan, error: planError } = await supabaseClient
      .from("membership_plans")
      .select(`
        *,
        gym:gym_profiles!inner(
          id,
          name,
          slug,
          stripe_account_id,
          stripe_account_status,
          platform_fee_percentage
        )
      `)
      .eq("id", planId)
      .eq("gym_id", gymId)
      .eq("is_active", true)
      .single();

    if (planError) throw new Error(`Failed to fetch plan: ${planError.message}`);
    if (!plan) throw new Error("Membership plan not found");

    const gym = plan.gym;
    if (!gym.stripe_account_id || gym.stripe_account_status !== "active") {
      throw new Error("Gym has not completed Stripe Connect setup");
    }

    logStep("Plan found", { planId: plan.id, planName: plan.name, gymId: gym.id });

    // Get or create gym member record
    let { data: member, error: memberError } = await supabaseClient
      .from("gym_members")
      .select("id")
      .eq("gym_id", gymId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) throw new Error(`Failed to check membership: ${memberError.message}`);

    if (!member) {
      // Create member record
      const { data: newMember, error: createError } = await supabaseClient
        .from("gym_members")
        .insert({
          gym_id: gymId,
          user_id: user.id,
          email: user.email,
          status: "pending",
        })
        .select("id")
        .single();

      if (createError) throw new Error(`Failed to create member: ${createError.message}`);
      member = newMember;
      logStep("Created new member record", { memberId: member.id });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Calculate platform fee (application_fee_percent for subscriptions)
    const platformFeePercent = gym.platform_fee_percentage || 2.5;

    // Determine checkout mode based on plan type
    const isSubscription = plan.plan_type === "recurring";
    const mode = isSubscription ? "subscription" : "payment";

    // Build line items
    interface LineItem {
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
        };
        unit_amount: number;
        recurring?: {
          interval: "day" | "week" | "month" | "year";
          interval_count: number;
        };
      };
      quantity: number;
    }

    const lineItems: LineItem[] = [{
      price_data: {
        currency: plan.currency?.toLowerCase() || "gbp",
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
        },
        unit_amount: plan.price_amount,
        recurring: isSubscription ? {
          interval: (plan.billing_interval || "month") as "day" | "week" | "month" | "year",
          interval_count: plan.billing_interval_count || 1,
        } : undefined,
      },
      quantity: 1,
    }];

    // Create checkout session with Stripe Connect
    interface SessionCreateParams {
      customer?: string;
      customer_email?: string;
      line_items: LineItem[];
      mode: "subscription" | "payment";
      success_url: string;
      cancel_url: string;
      metadata: {
        gym_id: string;
        member_id: string;
        plan_id: string;
        user_id: string;
      };
      subscription_data?: {
        application_fee_percent: number;
        metadata: {
          gym_id: string;
          member_id: string;
          plan_id: string;
        };
      };
      payment_intent_data?: {
        application_fee_amount: number;
        transfer_data: {
          destination: string;
        };
      };
    }

    const sessionParams: SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        gym_id: gymId,
        member_id: member.id,
        plan_id: planId,
        user_id: user.id,
      },
    };

    // For subscriptions, use application_fee_percent
    if (isSubscription) {
      sessionParams.subscription_data = {
        application_fee_percent: platformFeePercent,
        metadata: {
          gym_id: gymId,
          member_id: member.id,
          plan_id: planId,
        },
      };
    } else {
      // For one-time payments, calculate application_fee_amount
      const feeAmount = Math.round(plan.price_amount * (platformFeePercent / 100));
      sessionParams.payment_intent_data = {
        application_fee_amount: feeAmount,
        transfer_data: {
          destination: gym.stripe_account_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams, {
      stripeAccount: isSubscription ? gym.stripe_account_id : undefined,
    });

    logStep("Checkout session created", { sessionId: session.id, mode });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
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
