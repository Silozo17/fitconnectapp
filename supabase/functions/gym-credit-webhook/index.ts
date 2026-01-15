import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    // Verify webhook signature if webhook secret is set
    let event: Stripe.Event;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Only process gym credit purchases
      const metadata = session.metadata;
      if (!metadata?.gymId || !metadata?.credits) {
        console.log("Not a gym credit purchase, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const gymId = metadata.gymId;
      const credits = parseInt(metadata.credits, 10);
      const userId = metadata.userId;
      const memberId = metadata.memberId;

      console.log(`Processing credit purchase: ${credits} credits for gym ${gymId}`);

      // Get the member record
      let targetMemberId = memberId;
      if (!targetMemberId && userId) {
        const { data: member } = await supabaseAdmin
          .from("gym_members")
          .select("id")
          .eq("gym_id", gymId)
          .eq("user_id", userId)
          .eq("status", "active")
          .single();
        
        if (member) {
          targetMemberId = member.id;
        }
      }

      if (!targetMemberId) {
        console.error("Could not find member for credit purchase");
        return new Response(JSON.stringify({ error: "Member not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Get current credits
      const { data: currentMember } = await supabaseAdmin
        .from("gym_members")
        .select("credits_remaining")
        .eq("id", targetMemberId)
        .single();

      const currentCredits = currentMember?.credits_remaining || 0;
      const newBalance = currentCredits + credits;

      // Update member credits
      const { error: updateError } = await supabaseAdmin
        .from("gym_members")
        .update({ credits_remaining: newBalance })
        .eq("id", targetMemberId);

      if (updateError) throw updateError;

      // Log credit transaction
      await supabaseAdmin
        .from("gym_credit_transactions")
        .insert({
          gym_id: gymId,
          member_id: targetMemberId,
          amount: credits,
          balance_after: newBalance,
          transaction_type: "purchase",
          reference_type: "stripe_payment",
          reference_id: session.id,
          notes: `Purchased ${credits} credit(s) via Stripe`,
        });

      // Create notification for member
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Credits Added!",
          message: `${credits} class credits have been added to your account.`,
          type: "success",
        });

      console.log(`Successfully added ${credits} credits to member ${targetMemberId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
