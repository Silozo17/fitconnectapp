import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { baseEmailTemplate, ctaButton, EMAIL_CONFIG } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, gymId } = await req.json();

    if (!memberId || !gymId) {
      throw new Error("Missing required parameters: memberId and gymId");
    }

    // Fetch member details
    const { data: member, error: memberError } = await supabase
      .from("gym_members")
      .select(`
        id,
        first_name,
        last_name,
        email,
        gym_profiles!inner(id, name, slug, primary_color, logo_url),
        gym_memberships(
          membership_plans(name, description)
        )
      `)
      .eq("id", memberId)
      .eq("gym_id", gymId)
      .single();

    if (memberError || !member) {
      throw new Error(`Member not found: ${memberError?.message}`);
    }

    if (!member.email) {
      console.log("[gym-send-welcome-email] No email for member, skipping");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gym = member.gym_profiles as any;
    const membership = (member.gym_memberships as any[])?.[0];
    const plan = membership?.membership_plans;
    const siteUrl = Deno.env.get("SITE_URL") || "https://getfitconnect.co.uk";
    const portalUrl = `${siteUrl}/club/${gym?.slug}/portal`;
    const { colors } = EMAIL_CONFIG;

    const emailContent = `
      <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
        Welcome to ${gym?.name || 'the Gym'}! 🎉
      </h2>
      
      <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
        Hi ${member.first_name || 'there'}!<br/><br/>
        We're thrilled to have you as a member. Your fitness journey starts now!
      </p>
      
      ${plan ? `
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.primary}; margin: 0 0 8px 0;">Your Membership</h3>
        <p style="color: ${colors.text}; margin: 0; font-weight: 600;">${plan.name}</p>
        ${plan.description ? `<p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 14px;">${plan.description}</p>` : ''}
      </div>
      ` : ''}
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.text}; margin: 0 0 16px 0;">What's Next?</h3>
        <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Access your member portal to view classes and book sessions</li>
          <li>Check the class schedule and reserve your spot</li>
          <li>Download our app to check in quickly when you arrive</li>
          <li>Connect with trainers and start achieving your goals</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("Access Member Portal", portalUrl)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        Questions? Just reply to this email or speak to our team at the gym.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `Welcome to ${gym?.name}!`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${gym?.name || 'FitConnect'} <support@getfitconnect.co.uk>`,
        to: [member.email],
        subject: `Welcome to ${gym?.name || 'the Gym'}! 🎉`,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to send email: ${errorBody}`);
    }

    console.log(`[gym-send-welcome-email] Welcome email sent to ${member.email}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[gym-send-welcome-email] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
