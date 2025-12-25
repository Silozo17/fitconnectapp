import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

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
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const { coachId, userId, returnUrl, existingAccountId } = await req.json();

    if (!coachId || !userId || !returnUrl) {
      throw new Error("Missing required parameters");
    }

    console.log("Stripe Connect onboard request for coach:", coachId);

    let accountId = existingAccountId;

    // If we have an existing account ID, just create a new account link
    // This is much faster than creating a new account
    if (existingAccountId) {
      console.log("Using existing Stripe Connect account:", existingAccountId);
      
      try {
        // Verify the account exists
        const existingAccount = await stripe.accounts.retrieve(existingAccountId);
        if (existingAccount) {
          accountId = existingAccountId;
          console.log("Verified existing account, creating new link");
        }
      } catch (accountError) {
        // Account doesn't exist or is invalid, create a new one
        console.log("Existing account not found, creating new account");
        accountId = null;
      }
    }

    // Create a new account if we don't have a valid one
    if (!accountId) {
      console.log("Creating new Stripe Connect account for coach:", coachId);
      const account = await stripe.accounts.create({
        type: "express",
        metadata: {
          coach_id: coachId,
          user_id: userId,
        },
      });
      accountId = account.id;
      console.log("Stripe Connect account created:", accountId);
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?refresh=true`,
      return_url: `${returnUrl}?success=true&account_id=${accountId}`,
      type: "account_onboarding",
    });

    console.log("Account link created:", accountLink.url);

    return new Response(
      JSON.stringify({
        accountId: accountId,
        onboardingUrl: accountLink.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in stripe-connect-onboard:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
