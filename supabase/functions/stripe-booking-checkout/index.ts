import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[STRIPE-BOOKING-CHECKOUT] ${step}${detailsStr}`);
  }
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
      bookingRequestId,
      sessionTypeId,
      clientId: providedClientId,
      coachId,
      requestedAt,
      durationMinutes,
      isOnline,
      message,
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

    logStep("Creating booking checkout", { sessionTypeId, clientId, coachId, bookingRequestId });

    // Validate required fields
    if (!sessionTypeId || !coachId) {
      throw new Error("Missing required fields: sessionTypeId and coachId are required");
    }

    // Validate success/cancel URLs are from allowed domains
    const allowedDomains = [
      Deno.env.get("SITE_URL") || "",
      "http://localhost:5173",
      "http://localhost:3000",
      "https://getfitconnect.co.uk",
    ].filter(Boolean);
    
    const isValidUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return allowedDomains.some(domain => {
          const domainUrl = new URL(domain);
          return parsed.origin === domainUrl.origin;
        });
      } catch {
        return false;
      }
    };

    if (successUrl && !isValidUrl(successUrl)) {
      throw new Error("Invalid success URL");
    }
    if (cancelUrl && !isValidUrl(cancelUrl)) {
      throw new Error("Invalid cancel URL");
    }

    // SECURITY: Fetch session type price from database - never trust client-provided amounts
    const { data: sessionType, error: sessionTypeError } = await supabase
      .from("session_types")
      .select("*")
      .eq("id", sessionTypeId)
      .eq("is_active", true)
      .single();

    if (sessionTypeError || !sessionType) {
      throw new Error("Session type not found or inactive");
    }

    // SECURITY: Validate that the session type belongs to the specified coach
    if (sessionType.coach_id !== coachId) {
      console.error("[STRIPE-BOOKING-CHECKOUT] Session type coach mismatch:", { 
        sessionTypeCoach: sessionType.coach_id, 
        providedCoach: coachId 
      });
      throw new Error("Invalid session type for this coach");
    }

    logStep("Session type validated from DB", {
      id: sessionType.id,
      name: sessionType.name,
      price: sessionType.price,
      payment_required: sessionType.payment_required,
      deposit_type: sessionType.deposit_type,
      deposit_value: sessionType.deposit_value,
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

    // Get coach's VAT settings
    const { data: invoiceSettings } = await supabase
      .from("coach_invoice_settings")
      .select("vat_registered, vat_rate, vat_inclusive")
      .eq("coach_id", coachId)
      .maybeSingle();

    const isVatRegistered = invoiceSettings?.vat_registered || false;
    const vatRate = invoiceSettings?.vat_rate || 0;
    const isVatInclusive = invoiceSettings?.vat_inclusive || false;

    logStep("VAT settings", { isVatRegistered, vatRate, isVatInclusive });

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

    logStep("Coach tier", { tier, commission: `${applicationFeePercent}%` });

    // Check if coach has Boost active
    const { data: coachBoost } = await supabase
      .from("coach_boosts")
      .select("is_active")
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .maybeSingle();

    // Check if this is a NEW client (never booked with this coach)
    const { count: previousBookings } = await supabase
      .from("coaching_sessions")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("client_id", clientId);

    const isNewClient = (previousBookings || 0) === 0;
    const isBoostedAcquisition = !!(coachBoost?.is_active && isNewClient);

    logStep("Boost check", { boostActive: coachBoost?.is_active, isNewClient, isBoostedAcquisition });

    // Get Boost settings and calculate fee if applicable
    let boostFeeAmount = 0;
    if (isBoostedAcquisition) {
      const { data: boostSettings } = await supabase
        .from("boost_settings")
        .select("commission_rate, min_fee, max_fee")
        .eq("is_active", true)
        .single();

      const commissionRate = boostSettings?.commission_rate || 0.30;
      const minFee = boostSettings?.min_fee || 10;
      const maxFee = boostSettings?.max_fee || 100;

      // Calculate: 30% of session price, min £10, max £100
      boostFeeAmount = Math.min(
        Math.max((sessionType.price || 0) * commissionRate, minFee),
        maxFee
      );
      logStep("Boost fee calculated", { boostFeeAmount });
    }

    // SECURITY: Calculate payment amount from DB-fetched price only
    const sessionPrice = sessionType.price || 0;
    const currency = (sessionType.currency || coachProfile.currency || 'GBP').toLowerCase();
    const currencySymbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : '£';
    
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
        paymentDescription = `${currencySymbol}${amountDue} deposit for ${sessionType.name}`;
      }
    }

    // Apply VAT if registered and NOT inclusive
    let vatAmount = 0;
    if (isVatRegistered && vatRate > 0 && !isVatInclusive) {
      // Fix: proper rounding for VAT calculation (vatRate is percentage like 20)
      vatAmount = Math.round(amountDue * vatRate / 100 * 100) / 100;
      amountDue = amountDue + vatAmount;
      paymentDescription += ` (incl. ${vatRate}% VAT)`;
    } else if (isVatRegistered && isVatInclusive) {
      paymentDescription += ` (incl. VAT)`;
    }

    if (amountDue <= 0) {
      throw new Error("Invalid payment amount calculated");
    }

    logStep("Payment amount calculated", { amountDue, currency, vatAmount });

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
        console.error("[STRIPE-BOOKING-CHECKOUT] Error creating booking request:", bookingError);
        throw new Error("Failed to create booking request");
      }

      finalBookingRequestId = newBooking.id;
      logStep("Created booking request", { id: finalBookingRequestId });
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
        console.error("[STRIPE-BOOKING-CHECKOUT] Error updating booking request:", updateError);
      }
    }

    // Build metadata for webhook
    const metadata: Record<string, string> = {
      type: 'booking',
      booking_request_id: finalBookingRequestId,
      session_type_id: sessionTypeId,
      client_id: clientId,
      coach_id: coachId,
      payment_type: sessionType.payment_required,
      session_price: String(sessionPrice),
      amount_due: String(amountDue),
      is_boosted_acquisition: isBoostedAcquisition ? 'true' : 'false',
      boost_fee_amount: String(boostFeeAmount),
      vat_registered: String(isVatRegistered),
      vat_rate: String(vatRate),
      vat_amount: String(vatAmount),
    };

    // Calculate application fee (platform commission + boost fee)
    const platformFeeAmount = Math.round(amountDue * 100 * applicationFeePercent / 100);
    const boostFeeInCents = Math.round(boostFeeAmount * 100);
    const applicationFeeAmount = platformFeeAmount + boostFeeInCents;

    logStep("Fees calculated", { platformFee: platformFeeAmount, boostFee: boostFeeInCents, totalFee: applicationFeeAmount });

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

    logStep("Stripe checkout session created", { sessionId: session.id });

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
    console.error("[STRIPE-BOOKING-CHECKOUT] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
