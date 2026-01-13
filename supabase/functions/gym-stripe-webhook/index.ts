import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = Deno.env.get("GYM_STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("GYM_STRIPE_WEBHOOK_SECRET not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`[GYM-STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(`[GYM-STRIPE-WEBHOOK] Error processing ${event.type}:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const gymId = session.metadata?.gym_id;
  const memberId = session.metadata?.member_id;
  const planId = session.metadata?.plan_id;

  if (!gymId || !memberId || !planId) {
    console.log("[GYM-STRIPE-WEBHOOK] Missing metadata in checkout session");
    return;
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Checkout completed for gym ${gymId}, member ${memberId}`);

  // Get plan details
  const { data: plan } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) {
    console.error("[GYM-STRIPE-WEBHOOK] Plan not found:", planId);
    return;
  }

  // Create or update membership
  const startDate = new Date();
  let endDate: Date | null = null;
  
  if (plan.billing_period === "monthly") {
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.billing_period === "yearly") {
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const { error: membershipError } = await supabase
    .from("gym_memberships")
    .upsert({
      gym_id: gymId,
      member_id: memberId,
      plan_id: planId,
      status: "active",
      start_date: startDate.toISOString(),
      end_date: endDate?.toISOString() || null,
      stripe_subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      credits_remaining: plan.included_classes || null,
    }, {
      onConflict: "member_id,plan_id",
    });

  if (membershipError) {
    console.error("[GYM-STRIPE-WEBHOOK] Error creating membership:", membershipError);
    throw membershipError;
  }

  // Record payment
  const { error: paymentError } = await supabase
    .from("gym_payments")
    .insert({
      gym_id: gymId,
      member_id: memberId,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || "gbp",
      payment_type: "membership",
      payment_method: "stripe",
      status: "completed",
      stripe_payment_intent_id: session.payment_intent as string,
      description: `Membership: ${plan.name}`,
    });

  if (paymentError) {
    console.error("[GYM-STRIPE-WEBHOOK] Error recording payment:", paymentError);
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Membership activated for member ${memberId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  // Find membership by subscription ID
  const { data: membership } = await supabase
    .from("gym_memberships")
    .select("*, plan:membership_plans(*)")
    .eq("stripe_subscription_id", subscriptionId)
    .single();

  if (!membership) {
    console.log("[GYM-STRIPE-WEBHOOK] Membership not found for subscription:", subscriptionId);
    return;
  }

  // Reset credits if plan includes them
  const plan = membership.plan as any;
  if (plan?.included_classes) {
    await supabase
      .from("gym_memberships")
      .update({ 
        credits_remaining: plan.included_classes,
        status: "active"
      })
      .eq("id", membership.id);
  }

  // Extend membership end date
  const newEndDate = new Date();
  if (plan?.billing_period === "monthly") {
    newEndDate.setMonth(newEndDate.getMonth() + 1);
  } else if (plan?.billing_period === "yearly") {
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
  }

  await supabase
    .from("gym_memberships")
    .update({ end_date: newEndDate.toISOString() })
    .eq("id", membership.id);

  // Record payment
  await supabase
    .from("gym_payments")
    .insert({
      gym_id: membership.gym_id,
      member_id: membership.member_id,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || "gbp",
      payment_type: "membership_renewal",
      payment_method: "stripe",
      status: "completed",
      stripe_payment_intent_id: invoice.payment_intent as string,
      description: `Membership renewal: ${plan?.name || "Unknown"}`,
    });

  console.log(`[GYM-STRIPE-WEBHOOK] Invoice paid, membership renewed: ${membership.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscriptionId = typeof invoice.subscription === "string" 
    ? invoice.subscription 
    : invoice.subscription.id;

  // Update membership status
  const { error } = await supabase
    .from("gym_memberships")
    .update({ status: "payment_failed" })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("[GYM-STRIPE-WEBHOOK] Error updating membership status:", error);
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Payment failed for subscription: ${subscriptionId}`);
  // TODO: Send notification to member
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("gym_memberships")
    .update({
      status: subscription.status === "active" ? "active" : subscription.status,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("[GYM-STRIPE-WEBHOOK] Error updating subscription:", error);
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Subscription updated: ${subscription.id}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("gym_memberships")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("[GYM-STRIPE-WEBHOOK] Error cancelling membership:", error);
  }

  console.log(`[GYM-STRIPE-WEBHOOK] Subscription cancelled: ${subscription.id}`);
}
