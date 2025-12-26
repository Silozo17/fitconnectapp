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

    // SECURITY: Webhook signature validation is REQUIRED
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured - rejecting webhook");
      throw new Error("Webhook secret not configured. Signature validation is required.");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // SECURITY: Signature validation is mandatory
    if (!signature) {
      console.error("Missing stripe-signature header - rejecting webhook");
      throw new Error("Missing stripe-signature header. All webhook requests must be signed.");
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown signature error";
      console.error("Webhook signature verification failed:", errorMessage);
      throw new Error(`Webhook signature verification failed: ${errorMessage}`);
    }

    console.log("Webhook event received (signature verified):", event.type);

    // Helper function to create an invoice after purchase
    const createInvoice = async (params: {
      type: "package" | "subscription" | "booking";
      purchaseId: string;
      coachId: string;
      clientId: string;
      amount: number;
      currency?: string;
      description: string;
      stripePaymentIntentId?: string;
    }) => {
      try {
        console.log("Creating invoice for purchase:", params.type, params.purchaseId);
        
        const { data, error } = await supabase.functions.invoke("create-purchase-invoice", {
          body: params,
        });

        if (error) {
          console.error("Error invoking create-purchase-invoice:", error);
        } else {
          console.log("Invoice created successfully:", data);
        }
      } catch (err) {
        console.error("Failed to create invoice:", err);
        // Don't throw - invoice creation failure shouldn't fail the webhook
      }
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        console.log("Checkout completed:", session.id, metadata);

        if (metadata.type === "package") {
          // Record package purchase
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + parseInt(metadata.validity_days || "90"));

          const { data: insertedPurchase, error } = await supabase
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
            })
            .select()
            .single();

          if (error) {
            console.error("Error recording package purchase:", error);
          } else {
            console.log("Package purchase recorded successfully");
            
            // Create invoice for package purchase
            await createInvoice({
              type: "package",
              purchaseId: insertedPurchase.id,
              coachId: metadata.coach_id,
              clientId: metadata.client_id,
              amount: parseFloat(metadata.amount || "0"),
              currency: metadata.currency || "GBP",
              description: `${metadata.package_name || "Training Package"} (${metadata.sessions_total || 0} sessions)`,
              stripePaymentIntentId: session.payment_intent as string,
            });
            
            // Send payment receipt email
            try {
              await supabase.functions.invoke("send-payment-receipt", {
                body: {
                  clientId: metadata.client_id,
                  coachId: metadata.coach_id,
                  amount: parseFloat(metadata.amount || "0"),
                  currency: metadata.currency || "GBP",
                  description: `${metadata.package_name || "Training Package"} (${metadata.sessions_total || 0} sessions)`,
                  paymentIntentId: session.payment_intent as string,
                },
              });
              console.log("Payment receipt email sent for package");
            } catch (emailErr) {
              console.error("Failed to send payment receipt email:", emailErr);
            }
          }
        } else if (metadata.type === "subscription") {
          // Record subscription
          const { data: insertedSub, error } = await supabase
            .from("client_subscriptions")
            .insert({
              client_id: metadata.client_id,
              coach_id: metadata.coach_id,
              plan_id: metadata.item_id,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: "active",
              current_period_start: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error("Error recording subscription:", error);
          } else {
            console.log("Subscription recorded successfully");
            
            // Create invoice for subscription
            await createInvoice({
              type: "subscription",
              purchaseId: insertedSub.id,
              coachId: metadata.coach_id,
              clientId: metadata.client_id,
              amount: parseFloat(metadata.amount || "0"),
              currency: metadata.currency || "GBP",
              description: `${metadata.plan_name || "Subscription Plan"} - ${metadata.billing_period || "monthly"}`,
              stripePaymentIntentId: session.payment_intent as string,
            });
            
            // Send payment receipt email
            try {
              await supabase.functions.invoke("send-payment-receipt", {
                body: {
                  clientId: metadata.client_id,
                  coachId: metadata.coach_id,
                  amount: parseFloat(metadata.amount || "0"),
                  currency: metadata.currency || "GBP",
                  description: `${metadata.plan_name || "Subscription Plan"} - ${metadata.billing_period || "monthly"}`,
                  paymentIntentId: session.payment_intent as string,
                },
              });
              console.log("Payment receipt email sent for subscription");
            } catch (emailErr) {
              console.error("Failed to send payment receipt email:", emailErr);
            }
          }
        } else if (metadata.type === "platform_subscription") {
          // Coach platform subscription
          const { data: insertedPlatformSub, error } = await supabase
            .from("platform_subscriptions")
            .upsert({
              coach_id: metadata.coach_id,
              tier: metadata.tier,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: "active",
              current_period_start: new Date().toISOString(),
            }, { onConflict: "coach_id" })
            .select()
            .single();

          if (error) {
            console.error("Error recording platform subscription:", error);
          } else {
            // Update coach subscription tier
            await supabase
              .from("coach_profiles")
              .update({ subscription_tier: metadata.tier })
              .eq("id", metadata.coach_id);

            console.log("Platform subscription recorded successfully");

            // Create internal invoice for platform subscription payment if amount is provided
            const subscriptionAmount = parseFloat(metadata.amount || "0");
            if (subscriptionAmount > 0 && insertedPlatformSub) {
              // Get the next invoice number for platform subscriptions
              const { count } = await supabase
                .from("coach_invoices")
                .select("*", { count: "exact", head: true })
                .eq("coach_id", metadata.coach_id);

              const invoiceNumber = `PLATFORM-${metadata.coach_id.substring(0, 8).toUpperCase()}-${String((count || 0) + 1).padStart(4, "0")}`;

              const { error: invoiceError } = await supabase
                .from("coach_invoices")
                .insert({
                  coach_id: metadata.coach_id,
                  invoice_number: invoiceNumber,
                  total: subscriptionAmount,
                  subtotal: subscriptionAmount,
                  currency: metadata.currency || "GBP",
                  status: "paid",
                  paid_at: new Date().toISOString(),
                  source_type: "platform_subscription",
                  source_id: insertedPlatformSub.id,
                  stripe_payment_intent_id: session.payment_intent as string,
                  notes: `FitConnect ${metadata.tier} Plan - Monthly Subscription`,
                });

              if (invoiceError) {
                console.error("Error creating platform subscription invoice:", invoiceError);
              } else {
                console.log("Platform subscription invoice created:", invoiceNumber);
              }
            }
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
            
            // Create invoice for booking payment
            await createInvoice({
              type: "booking",
              purchaseId: bookingRequestId,
              coachId: metadata.coach_id,
              clientId: metadata.client_id,
              amount: amountPaid,
              currency: metadata.currency || "GBP",
              description: `${metadata.session_type || "Training Session"} - ${paymentType === 'full' ? 'Full Payment' : 'Deposit'}`,
              stripePaymentIntentId: session.payment_intent as string,
            });
            
            // Send payment receipt email
            try {
              await supabase.functions.invoke("send-payment-receipt", {
                body: {
                  clientId: metadata.client_id,
                  coachId: metadata.coach_id,
                  amount: amountPaid,
                  currency: metadata.currency || "GBP",
                  description: `${metadata.session_type || "Training Session"} - ${paymentType === 'full' ? 'Full Payment' : 'Deposit'}`,
                  paymentIntentId: session.payment_intent as string,
                },
              });
              console.log("Payment receipt email sent");
            } catch (emailErr) {
              console.error("Failed to send payment receipt email:", emailErr);
            }
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
        } else if (metadata.type === "digital_content") {
          // Handle digital content purchase completion
          const productId = metadata.product_id || null;
          const bundleId = metadata.bundle_id || null;

          console.log("Digital content purchase completed:", { productId, bundleId, sessionId: session.id });

          const { error: contentError } = await supabase
            .from("content_purchases")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("stripe_checkout_session_id", session.id);

          if (contentError) {
            console.error("Error updating content purchase:", contentError);
          } else {
            console.log("Content purchase marked as completed");
          }
        } else if (metadata.type === "boost_activation") {
          // Handle Boost activation payment with stacking support
          const coachId = metadata.coach_id;
          const durationDays = parseInt(metadata.duration_days || "30");
          const pricePaid = parseInt(metadata.price_paid || "500");

          console.log("Boost activation payment completed:", { coachId, durationDays, pricePaid });

          // Check for existing active boost to stack time
          const { data: existingBoost } = await supabase
            .from("coach_boosts")
            .select("boost_end_date, payment_status")
            .eq("coach_id", coachId)
            .maybeSingle();

          const now = new Date();
          let startDate = now;
          let endDate = new Date(now);

          // If there's an existing active boost that hasn't expired, stack from its end date
          if (existingBoost?.boost_end_date) {
            const existingEndDate = new Date(existingBoost.boost_end_date);
            if (existingEndDate > now && (existingBoost.payment_status === 'succeeded' || existingBoost.payment_status === 'migrated_free')) {
              // Stack: new period starts from existing end date
              startDate = existingEndDate;
              endDate = new Date(existingEndDate);
              endDate.setDate(endDate.getDate() + durationDays);
              console.log("Stacking boost from existing end date:", { existingEndDate: existingEndDate.toISOString(), newEndDate: endDate.toISOString() });
            } else {
              // Expired or not succeeded - start from now
              endDate.setDate(endDate.getDate() + durationDays);
            }
          } else {
            // No existing boost - start from now
            endDate.setDate(endDate.getDate() + durationDays);
          }

          // Update coach_boosts with activation details
          const { error: boostError } = await supabase
            .from("coach_boosts")
            .update({
              is_active: true,
              boost_start_date: startDate.toISOString(),
              boost_end_date: endDate.toISOString(),
              payment_status: "succeeded",
              activation_payment_intent_id: session.payment_intent as string,
              activated_at: now.toISOString(),
              deactivated_at: null,
              updated_at: now.toISOString(),
            })
            .eq("coach_id", coachId);

          if (boostError) {
            console.error("Error activating boost:", boostError);
          } else {
            console.log("Boost activated successfully until:", endDate.toISOString());
          }

          // Create invoice for boost purchase
          const { count } = await supabase
            .from("coach_invoices")
            .select("*", { count: "exact", head: true })
            .eq("coach_id", coachId);

          const invoiceNumber = `BOOST-${coachId.substring(0, 8).toUpperCase()}-${String((count || 0) + 1).padStart(4, "0")}`;

          const { error: invoiceError } = await supabase
            .from("coach_invoices")
            .insert({
              coach_id: coachId,
              invoice_number: invoiceNumber,
              total: pricePaid / 100, // Convert pence to pounds
              subtotal: pricePaid / 100,
              currency: "GBP",
              status: "paid",
              paid_at: now.toISOString(),
              source_type: "boost_activation",
              stripe_payment_intent_id: session.payment_intent as string,
              notes: `Boost Activation - ${durationDays} days`,
            });

          if (invoiceError) {
            console.error("Error creating boost invoice:", invoiceError);
          } else {
            console.log("Boost invoice created:", invoiceNumber);
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const stripeSubId = subscription.id;
        const periodEndDate = subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : null;
        const newStatus = status === "active" ? "active" : "cancelled";

        console.log("Subscription updated:", stripeSubId, status);

        // Check if this is a platform subscription first (more specific check)
        const { data: platformSubMatch } = await supabase
          .from("platform_subscriptions")
          .select("id, coach_id")
          .eq("stripe_subscription_id", stripeSubId)
          .maybeSingle();

        if (platformSubMatch) {
          // This is a platform subscription - only update platform_subscriptions
          console.log("Updating platform subscription:", platformSubMatch.id);
          const { error: platformError } = await supabase
            .from("platform_subscriptions")
            .update({
              status: newStatus,
              current_period_end: periodEndDate,
            })
            .eq("id", platformSubMatch.id);

          if (platformError) {
            console.error("Error updating platform subscription:", platformError);
          } else {
            // Also update coach profile subscription tier if cancelled
            if (newStatus === "cancelled") {
              await supabase
                .from("coach_profiles")
                .update({ subscription_tier: "free" })
                .eq("id", platformSubMatch.coach_id);
              console.log("Coach subscription tier reset to free");
            }
          }
        } else {
          // Check if this is a client subscription
          const { data: clientSubMatch } = await supabase
            .from("client_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", stripeSubId)
            .maybeSingle();

          if (clientSubMatch) {
            // This is a client subscription - only update client_subscriptions
            console.log("Updating client subscription:", clientSubMatch.id);
            const { error: clientError } = await supabase
              .from("client_subscriptions")
              .update({
                status: newStatus,
                current_period_end: periodEndDate,
              })
              .eq("id", clientSubMatch.id);

            if (clientError) {
              console.error("Error updating client subscription:", clientError);
            }
          } else {
            console.log("No matching subscription found for:", stripeSubId);
          }
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        const amountRefunded = charge.amount_refunded; // In cents
        const totalAmount = charge.amount; // In cents
        const isPartialRefund = amountRefunded < totalAmount;
        const refundAmountDecimal = amountRefunded / 100;

        console.log("Charge refunded:", {
          paymentIntentId,
          amountRefunded,
          totalAmount,
          isPartialRefund,
        });

        if (paymentIntentId) {
          const refundStatus = isPartialRefund ? "partially_refunded" : "refunded";
          const now = new Date().toISOString();

          // Update invoice with refund details
          const { data: updatedInvoices, error: invoiceError } = await supabase
            .from("coach_invoices")
            .update({
              status: refundStatus,
              refund_amount: refundAmountDecimal,
              refunded_at: now,
              updated_at: now,
            })
            .eq("stripe_payment_intent_id", paymentIntentId)
            .select();

          if (invoiceError) {
            console.error("Error updating invoice to refunded:", invoiceError);
          } else if (updatedInvoices && updatedInvoices.length > 0) {
            console.log("Invoice(s) marked as", refundStatus, ":", updatedInvoices.map(i => i.id));
          }

          // Update booking requests
          await supabase
            .from("booking_requests")
            .update({
              payment_status: refundStatus,
              refund_amount: refundAmountDecimal,
              refunded_at: now,
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          // Update package purchases
          await supabase
            .from("client_package_purchases")
            .update({
              status: refundStatus,
              refund_amount: refundAmountDecimal,
              refunded_at: now,
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          // Update content purchases
          await supabase
            .from("content_purchases")
            .update({
              status: refundStatus,
              refund_amount: refundAmountDecimal,
              refunded_at: now,
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          console.log("Refund processed:", {
            refundStatus,
            amount: refundAmountDecimal,
            invoicesUpdated: updatedInvoices?.length || 0,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata || {};
        const failureMessage = paymentIntent.last_payment_error?.message || "Payment failed";

        console.log("Payment failed:", paymentIntent.id, metadata.type, failureMessage);

        // Update booking request if it's a booking payment
        if (metadata.type === "booking" && metadata.booking_request_id) {
          const { error } = await supabase
            .from("booking_requests")
            .update({ payment_status: "failed" })
            .eq("id", metadata.booking_request_id);

          if (error) {
            console.error("Error updating booking to failed:", error);
          } else {
            console.log("Booking payment marked as failed:", metadata.booking_request_id);
          }
        }

        // Update content purchase if it's a digital content payment
        if (metadata.type === "digital_content") {
          const { error } = await supabase
            .from("content_purchases")
            .update({ status: "failed" })
            .eq("stripe_checkout_session_id", paymentIntent.id);

          if (error) {
            console.error("Error updating content purchase to failed:", error);
          }
        }

        // Update package purchase if applicable
        if (metadata.type === "package") {
          const { error } = await supabase
            .from("client_package_purchases")
            .update({ status: "failed" })
            .eq("stripe_payment_intent_id", paymentIntent.id);

          if (error) {
            console.error("Error updating package purchase to failed:", error);
          }
        }

        // Update boost activation if applicable
        if (metadata.type === "boost_activation" && metadata.coach_id) {
          const { error } = await supabase
            .from("coach_boosts")
            .update({ payment_status: "failed" })
            .eq("coach_id", metadata.coach_id);

          if (error) {
            console.error("Error updating boost to failed:", error);
          } else {
          console.log("Boost payment marked as failed for coach:", metadata.coach_id);
          }
        }

        break;
      }

      case "checkout.session.expired": {
        // Handle expired checkout sessions - reset pending boost status
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        console.log("Checkout session expired:", session.id, metadata);

        if (metadata.type === "boost_activation" && metadata.coach_id) {
          const { error } = await supabase
            .from("coach_boosts")
            .update({
              payment_status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("coach_id", metadata.coach_id)
            .eq("payment_status", "pending"); // Only if still pending

          if (error) {
            console.error("Error resetting expired boost:", error);
          } else {
            console.log("Boost payment reset after session expired for coach:", metadata.coach_id);
          }
        }

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
