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

interface MemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  medicalConditions?: string | null;
  injuries?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string | null;
  referredByEmail?: string | null;
  marketingSource?: string;
  marketingSourceOther?: string | null;
}

interface RequestBody {
  gymId: string;
  planId: string;
  locationId?: string;
  memberData: MemberData;
  contractIds: string[];
  successUrl: string;
  cancelUrl: string;
  emailVerified?: boolean; // Flag indicating email has been verified via OTP
}

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

    // Parse request body
    const body: RequestBody = await req.json();
    const { gymId, planId, locationId, memberData, contractIds, successUrl, cancelUrl, emailVerified } = body;
    
    if (!gymId || !planId || !memberData || !successUrl || !cancelUrl) {
      throw new Error("Missing required parameters");
    }

    if (!memberData.email || !memberData.firstName || !memberData.lastName) {
      throw new Error("Missing required member data");
    }

    const email = memberData.email.toLowerCase().trim();
    logStep("Processing checkout for", { email, gymId, planId });

    // Check if user already exists in auth.users
    const { data: existingUsers, error: userCheckError } = await supabaseClient.auth.admin.listUsers();
    if (userCheckError) throw new Error(`Failed to check users: ${userCheckError.message}`);
    
    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email);
    
    let userId: string;
    let isNewUser = false;
    
    if (existingUser) {
      // User exists - verify they've completed OTP verification
      if (!emailVerified) {
        logStep("Existing user requires OTP verification", { email });
        return new Response(
          JSON.stringify({
            requiresOtp: true,
            email,
            message: "This email is already registered. Please verify with the code sent to your email."
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      userId = existingUser.id;
      logStep("Using existing verified user", { userId });
    } else {
      // Create new user account
      const tempPassword = crypto.randomUUID(); // Temporary password, user will set their own later
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm since we verified via OTP or it's a new signup
        user_metadata: {
          first_name: memberData.firstName,
          last_name: memberData.lastName,
          phone: memberData.phone,
        }
      });
      
      if (createError) throw new Error(`Failed to create user: ${createError.message}`);
      if (!newUser.user) throw new Error("User creation returned no user");
      
      userId = newUser.user.id;
      isNewUser = true;
      logStep("Created new user account", { userId, email });
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
    logStep("Plan found", { planId: plan.id, planName: plan.name, gymId: gym.id });

    // Get Stripe account from the location
    let stripeAccountId: string | null = null;
    let locationName: string | null = null;

    if (locationId) {
      const { data: location, error: locationError } = await supabaseClient
        .from("gym_locations")
        .select("id, name, stripe_account_id, stripe_account_status, stripe_onboarding_complete")
        .eq("id", locationId)
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .single();

      if (locationError) throw new Error(`Failed to fetch location: ${locationError.message}`);
      if (!location) throw new Error("Location not found");
      if (!location.stripe_account_id || !location.stripe_onboarding_complete) {
        throw new Error("This location has not completed Stripe Connect setup");
      }

      stripeAccountId = location.stripe_account_id;
      locationName = location.name;
      logStep("Using location Stripe account", { locationId: location.id, locationName });
    } else {
      // Fallback: Get primary location or any location with Stripe setup
      const { data: locations, error: locationsError } = await supabaseClient
        .from("gym_locations")
        .select("id, name, stripe_account_id, stripe_account_status, stripe_onboarding_complete, is_primary")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .eq("stripe_onboarding_complete", true)
        .order("is_primary", { ascending: false })
        .limit(1);

      if (locationsError) throw new Error(`Failed to fetch locations: ${locationsError.message}`);
      
      if (locations && locations.length > 0) {
        stripeAccountId = locations[0].stripe_account_id;
        locationName = locations[0].name;
        logStep("Using primary location Stripe account", { locationId: locations[0].id, locationName });
      } else {
        // Last fallback: Check gym_profiles for legacy Stripe setup
        const { data: gymProfile } = await supabaseClient
          .from("gym_profiles")
          .select("stripe_account_id, stripe_account_status")
          .eq("id", gymId)
          .single();

        if (gymProfile?.stripe_account_id && gymProfile.stripe_account_status === "active") {
          stripeAccountId = gymProfile.stripe_account_id;
          logStep("Using legacy gym profile Stripe account");
        }
      }
    }

    if (!stripeAccountId) {
      throw new Error("No active Stripe Connect account found for this gym. Please complete payment setup first.");
    }

    // Look up referrer if referredByEmail provided
    let referredByMemberId: string | null = null;
    if (memberData.referredByEmail) {
      const { data: referrer } = await supabaseClient
        .from("gym_members")
        .select("id")
        .eq("gym_id", gymId)
        .eq("email", memberData.referredByEmail.toLowerCase())
        .maybeSingle();
      
      if (referrer) {
        referredByMemberId = referrer.id;
        logStep("Found referrer", { referrerId: referredByMemberId });
      }
    }

    // Create or update gym member record with full details
    let { data: member, error: memberError } = await supabaseClient
      .from("gym_members")
      .select("id")
      .eq("gym_id", gymId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memberError) throw new Error(`Failed to check membership: ${memberError.message}`);

    // Prepare medical conditions and injuries as arrays
    const medicalConditionsArray = memberData.medicalConditions 
      ? [memberData.medicalConditions] 
      : null;
    const injuriesArray = memberData.injuries 
      ? [memberData.injuries] 
      : null;

    if (!member) {
      // Create new member record with all details
      const { data: newMember, error: createError } = await supabaseClient
        .from("gym_members")
        .insert({
          gym_id: gymId,
          user_id: userId,
          email,
          first_name: memberData.firstName,
          last_name: memberData.lastName,
          phone: memberData.phone,
          date_of_birth: memberData.dateOfBirth || null,
          gender: memberData.gender || null,
          medical_conditions: medicalConditionsArray,
          injuries: injuriesArray,
          emergency_contact_name: memberData.emergencyContactName,
          emergency_contact_phone: memberData.emergencyContactPhone,
          emergency_contact_relation: memberData.emergencyContactRelation || null,
          referred_by_member_id: referredByMemberId,
          marketing_source: memberData.marketingSource || null,
          marketing_source_other: memberData.marketingSourceOther || null,
          home_location_id: locationId || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (createError) throw new Error(`Failed to create member: ${createError.message}`);
      member = newMember;
      logStep("Created new member record with full details", { memberId: member.id });
    } else {
      // Update existing member with new details
      const { error: updateError } = await supabaseClient
        .from("gym_members")
        .update({
          first_name: memberData.firstName,
          last_name: memberData.lastName,
          phone: memberData.phone,
          date_of_birth: memberData.dateOfBirth || null,
          gender: memberData.gender || null,
          medical_conditions: medicalConditionsArray,
          injuries: injuriesArray,
          emergency_contact_name: memberData.emergencyContactName,
          emergency_contact_phone: memberData.emergencyContactPhone,
          emergency_contact_relation: memberData.emergencyContactRelation || null,
          referred_by_member_id: referredByMemberId || undefined,
          marketing_source: memberData.marketingSource || undefined,
          marketing_source_other: memberData.marketingSourceOther || undefined,
          home_location_id: locationId || undefined,
        })
        .eq("id", member.id);

      if (updateError) {
        logStep("Warning: Failed to update member details", { error: updateError.message });
      } else {
        logStep("Updated existing member record", { memberId: member.id });
      }
    }

    // Save signed contracts
    if (contractIds && contractIds.length > 0) {
      logStep("Saving signed contracts", { count: contractIds.length });
      
      // Fetch contract templates to get content snapshots
      const { data: templates, error: templatesError } = await supabaseClient
        .from("gym_contract_templates")
        .select("id, content, version")
        .in("id", contractIds);

      if (templatesError) {
        logStep("Warning: Failed to fetch contract templates", { error: templatesError.message });
      } else if (templates) {
        const signedContracts = templates.map(template => ({
          gym_id: gymId,
          member_id: member!.id,
          template_id: template.id,
          signature_type: "checkbox", // Signed via wizard checkbox
          signed_at: new Date().toISOString(),
          template_version: template.version || 1,
          template_content_snapshot: template.content || "",
        }));

        const { error: signError } = await supabaseClient
          .from("gym_signed_contracts")
          .insert(signedContracts);

        if (signError) {
          logStep("Warning: Failed to save signed contracts", { error: signError.message });
        } else {
          logStep("Saved signed contracts successfully", { count: signedContracts.length });
          
          // Update member with contracts_signed_at timestamp
          await supabaseClient
            .from("gym_members")
            .update({ contracts_signed_at: new Date().toISOString() })
            .eq("id", member!.id);
        }
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Flat £1 platform fee per member payment
    const PLATFORM_FEE_AMOUNT = 100; // £1 = 100 pence

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

    const productName = locationName 
      ? `${plan.name} - ${locationName}`
      : plan.name;

    const lineItems: LineItem[] = [{
      price_data: {
        currency: plan.currency?.toLowerCase() || "gbp",
        product_data: {
          name: productName,
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
        location_id?: string;
        is_new_user?: string;
      };
      subscription_data?: {
        application_fee_amount?: number;
        transfer_data?: {
          destination: string;
        };
        metadata: {
          gym_id: string;
          member_id: string;
          plan_id: string;
          location_id?: string;
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
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        gym_id: gymId,
        member_id: member.id,
        plan_id: planId,
        user_id: userId,
        location_id: locationId || undefined,
        is_new_user: isNewUser ? "true" : "false",
      },
    };

    // For subscriptions, use flat £1 application fee per payment
    if (isSubscription) {
      sessionParams.subscription_data = {
        application_fee_amount: PLATFORM_FEE_AMOUNT,
        metadata: {
          gym_id: gymId,
          member_id: member.id,
          plan_id: planId,
          location_id: locationId || undefined,
        },
      };
    } else {
      // For one-time payments, use flat £1 application fee
      sessionParams.payment_intent_data = {
        application_fee_amount: PLATFORM_FEE_AMOUNT,
        transfer_data: {
          destination: stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams, {
      stripeAccount: isSubscription ? stripeAccountId : undefined,
    });

    logStep("Checkout session created", { sessionId: session.id, mode, isNewUser });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        memberId: member.id,
        isNewUser,
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
