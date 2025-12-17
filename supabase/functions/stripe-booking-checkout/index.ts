import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      bookingRequestId, // optional - if paying after booking request created
      sessionTypeId,
      clientId: providedClientId,
      coachId,
      requestedAt, // ISO string of requested session time
      durationMinutes,
      isOnline,
      message, // client's message for the booking
      successUrl,
      cancelUrl,
    } = await req.json();

    // Resolve client_id from JWT if not provided
    let clientId = providedClientId;
    if (!clientId) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Authentication required");
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) throw new Error("Invalid authentication");
      
      const { data: clientProfile, error: clientError } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (clientError || !clientProfile) throw new Error("Client profile not found");
      clientId = clientProfile.id;
    }

    console.log("Creating booking checkout:", { sessionTypeId, clientId, coachId, bookingRequestId });

    // Get session type with payment configuration
    const { data: sessionType, error: sessionTypeError } = await supabase
      .from("session_types")
      .select("*")
      .eq("id", sessionTypeId)
      .single();

    if (sessionTypeError || !sessionType) {
      throw new Error("Session type not found");
    }

    console.log("Session type payment config:", {
      payment_required: sessionType.payment_required,
      deposit_type: sessionType.deposit_type,
      deposit_value: sessionType.deposit_value,
      price: sessionType.price,
    });

    // Check if payment is required
    if (sessionType.payment_required === 'none') {
      throw new Error("This session type does not require payment upfront");
    }

    // Get coach's Stripe Connect account
    const { data: coachProfile, error: coachError } = await supabase
      .from("coach_profiles")
      .select("stripe_connect_id, stripe_connect_onboarded, display_name, currency")
      .eq("id", coachId)
      .single();

    if (coachError || !coachProfile?.stripe_connect_id || !coachProfile?.stripe_connect_onboarded) {
      throw new Error("Coach has not set up payment processing yet");
    }

    // Get coach's platform subscription to determine commission rate
    const { data: platformSub } = await supabase
      .from("platform_subscriptions")
      .select("tier")
      .eq("coach_id", coachId)
      .eq("status", "active")
      .single();

    const tier = platformSub?.tier || "free";
    const commissionRates: Record<string, number> = { free: 4, starter: 3, pro: 2, enterprise: 1 };
    const applicationFeePercent = commissionRates[tier] || 4;

    console.log("Coach tier:", tier, "Commission:", applicationFeePercent + "%");

    // Calculate payment amount
    const sessionPrice = sessionType.price || 0;
    const currency = (sessionType.currency || coachProfile.currency || 'GBP').toLowerCase();
    
    let amountDue = 0;
    let paymentDescription = '';

    if (sessionType.payment_required === 'full') {
      amountDue = sessionPrice;
      paymentDescription = `Full payment for ${sessionType.name}`;
    } else if (sessionType.payment_required === 'deposit') {
      if (sessionType.deposit_type === 'percentage') {
        amountDue = Math.round(sessionPrice * (sessionType.deposit_value || 0) / 100 * 100) / 100;
        paymentDescription = `${sessionType.deposit_value}% deposit for ${sessionType.name}`;
      } else {
        // Fixed amount deposit
        amountDue = sessionType.deposit_value || 0;
        paymentDescription = `£${amountDue} deposit for ${sessionType.name}`;
      }
    }

    if (amountDue <= 0) {
      throw new Error("Invalid payment amount calculated");
    }

    console.log("Payment amount:", amountDue, currency);

    // Create or update booking request with payment status
    let finalBookingRequestId = bookingRequestId;
    
    if (!bookingRequestId) {
      // Create a new booking request with pending payment status
      const { data: newBooking, error: bookingError } = await supabase
        .from("booking_requests")
        .insert({
          client_id: clientId,
          coach_id: coachId,
          session_type_id: sessionTypeId,
          requested_at: requestedAt,
          duration_minutes: durationMinutes || sessionType.duration_minutes || 60,
          is_online: isOnline ?? true,
          message: message || null,
          currency: currency.toUpperCase(),
          status: 'pending',
          payment_required: sessionType.payment_required,
          payment_status: 'pending',
          amount_due: amountDue,
          amount_paid: 0,
        })
        .select()
        .single();

      if (bookingError || !newBooking) {
        console.error("Error creating booking request:", bookingError);
        throw new Error("Failed to create booking request");
      }

      finalBookingRequestId = newBooking.id;
      console.log("Created booking request:", finalBookingRequestId);
    } else {
      // Update existing booking request with payment info
      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({
          payment_required: sessionType.payment_required,
          payment_status: 'pending',
          amount_due: amountDue,
        })
        .eq("id", bookingRequestId);

      if (updateError) {
        console.error("Error updating booking request:", updateError);
      }
    }

    // Build metadata for webhook
    const metadata: Record<string, string> = {
      type: 'booking',
      booking_request_id: finalBookingRequestId,
      session_type_id: sessionTypeId,
      client_id: clientId,
      coach_id: coachId,
      payment_type: sessionType.payment_required, // 'deposit' or 'full'
      session_price: String(sessionPrice),
      amount_due: String(amountDue),
    };

    // Calculate application fee (platform commission)
    const applicationFeeAmount = Math.round(amountDue * 100 * applicationFeePercent / 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: sessionType.name,
            description: paymentDescription,
          },
          unit_amount: Math.round(amountDue * 100),
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: coachProfile.stripe_connect_id,
        },
        metadata,
      },
    });

    // Update booking request with Stripe session ID
    await supabase
      .from("booking_requests")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", finalBookingRequestId);

    console.log("Stripe checkout session created:", session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
        bookingRequestId: finalBookingRequestId,
        amountDue,
        currency: currency.toUpperCase(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in stripe-booking-checkout:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
