import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    console.log("Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        console.log("Checkout completed:", session.id, metadata);

        if (metadata.type === "package") {
          // Record package purchase
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + parseInt(metadata.validity_days || "90"));

          const { error } = await supabase
            .from("client_package_purchases")
            .insert({
              client_id: metadata.client_id,
              coach_id: metadata.coach_id,
              package_id: metadata.item_id,
              sessions_total: parseInt(metadata.sessions_total || "0"),
              amount_paid: parseFloat(metadata.amount || "0"),
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              expires_at: expiresAt.toISOString(),
              status: "active",
            });

          if (error) {
            console.error("Error recording package purchase:", error);
          } else {
            console.log("Package purchase recorded successfully");
          }
        } else if (metadata.type === "subscription") {
          // Record subscription
          const { error } = await supabase
            .from("client_subscriptions")
            .insert({
              client_id: metadata.client_id,
              coach_id: metadata.coach_id,
              plan_id: metadata.item_id,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: "active",
              current_period_start: new Date().toISOString(),
            });

          if (error) {
            console.error("Error recording subscription:", error);
          } else {
            console.log("Subscription recorded successfully");
          }
        } else if (metadata.type === "platform_subscription") {
          // Coach platform subscription
          const { error } = await supabase
            .from("platform_subscriptions")
            .upsert({
              coach_id: metadata.coach_id,
              tier: metadata.tier,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: "active",
              current_period_start: new Date().toISOString(),
            }, { onConflict: "coach_id" });

          if (error) {
            console.error("Error recording platform subscription:", error);
          } else {
            // Update coach subscription tier
            await supabase
              .from("coach_profiles")
              .update({ subscription_tier: metadata.tier })
              .eq("id", metadata.coach_id);

            console.log("Platform subscription recorded successfully");
          }
        } else if (metadata.type === "booking") {
          // Booking payment (deposit or full payment)
          const bookingRequestId = metadata.booking_request_id;
          const paymentType = metadata.payment_type; // 'deposit' or 'full'
          const amountPaid = parseFloat(metadata.amount_due || "0");
          const sessionPrice = parseFloat(metadata.session_price || "0");
          const isBoostedAcquisition = metadata.is_boosted_acquisition === 'true';
          const boostFeeAmount = parseFloat(metadata.boost_fee_amount || "0");

          console.log("Booking payment completed:", { bookingRequestId, paymentType, amountPaid, isBoostedAcquisition, boostFeeAmount });

          // Determine payment status based on payment type
          const paymentStatus = paymentType === 'full' ? 'fully_paid' : 'deposit_paid';

          // Update booking request with payment info
          const { error } = await supabase
            .from("booking_requests")
            .update({
              payment_status: paymentStatus,
              amount_paid: amountPaid,
              stripe_payment_intent_id: session.payment_intent as string,
              is_boosted_acquisition: isBoostedAcquisition,
            })
            .eq("id", bookingRequestId);

          if (error) {
            console.error("Error updating booking request payment:", error);
          } else {
            console.log("Booking payment recorded successfully:", paymentStatus);
          }

          // Handle Boost attribution if applicable
          if (isBoostedAcquisition && boostFeeAmount > 0) {
            console.log("Creating boost attribution for coach:", metadata.coach_id);

            // Create attribution record
            const { error: attrError } = await supabase
              .from("boost_client_attributions")
              .insert({
                coach_id: metadata.coach_id,
                client_id: metadata.client_id,
                first_booking_id: bookingRequestId,
                booking_amount: sessionPrice,
                fee_amount: boostFeeAmount,
                fee_status: 'charged',
                stripe_charge_id: session.payment_intent as string,
              });

            if (attrError) {
              console.error("Error creating boost attribution:", attrError);
            } else {
              console.log("Boost attribution created successfully");
            }

            // Update coach boost stats using RPC
            const { error: statsError } = await supabase.rpc('increment_boost_stats', {
              p_coach_id: metadata.coach_id,
              p_fee_amount: boostFeeAmount,
            });

            if (statsError) {
              console.error("Error updating boost stats:", statsError);
            } else {
              console.log("Boost stats updated successfully");
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;

        console.log("Subscription updated:", subscription.id, status);

        // Update client subscription status
        await supabase
          .from("client_subscriptions")
          .update({
            status: status === "active" ? "active" : "cancelled",
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString() 
              : null,
          })
          .eq("stripe_subscription_id", subscription.id);

        // Also check platform subscriptions
        await supabase
          .from("platform_subscriptions")
          .update({
            status: status === "active" ? "active" : "cancelled",
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString() 
              : null,
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const coachId = account.metadata?.coach_id;

        if (coachId && account.charges_enabled && account.payouts_enabled) {
          console.log("Coach Stripe account fully onboarded:", coachId);

          await supabase
            .from("coach_profiles")
            .update({
              stripe_connect_id: account.id,
              stripe_connect_onboarded: true,
            })
            .eq("id", coachId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    );
  }
});
