import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { baseEmailTemplate, ctaButton, infoCard, EMAIL_CONFIG } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Format opening hours for email display
function formatOpeningHours(hours: Record<string, any> | null): string {
  if (!hours || Object.keys(hours).length === 0) return '';
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
    thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  };
  
  let html = '<table style="width: 100%; font-size: 13px; color: #a0a0a0;">';
  for (const day of days) {
    const dayHours = hours[day];
    if (dayHours) {
      const time = dayHours.closed ? 'Closed' : `${dayHours.open || '06:00'} - ${dayHours.close || '22:00'}`;
      html += `<tr><td style="padding: 4px 0;">${dayLabels[day]}</td><td style="text-align: right; padding: 4px 0;">${time}</td></tr>`;
    }
  }
  html += '</table>';
  return html;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberId, gymId } = await req.json();

    if (!memberId || !gymId) {
      throw new Error("Missing required parameters: memberId and gymId");
    }

    // Fetch member details with location info
    const { data: member, error: memberError } = await supabase
      .from("gym_members")
      .select(`
        id,
        first_name,
        last_name,
        email,
        member_number,
        home_location_id,
        gym_profiles!inner(id, name, slug, primary_color, logo_url),
        gym_memberships(
          membership_plans(name, description, price, billing_interval),
          start_date
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

    // Fetch home location details if available
    let location = null;
    if (member.home_location_id) {
      const { data: loc } = await supabase
        .from("gym_locations")
        .select("name, address_line_1, address_line_2, city, postal_code, phone, opening_hours")
        .eq("id", member.home_location_id)
        .single();
      location = loc;
    }

    const gym = member.gym_profiles as any;
    const membership = (member.gym_memberships as any[])?.[0];
    const plan = membership?.membership_plans;
    const siteUrl = Deno.env.get("SITE_URL") || "https://getfitconnect.co.uk";
    const portalUrl = `${siteUrl}/club/${gym?.slug}/portal`;
    const { colors } = EMAIL_CONFIG;

    // Format address
    const addressParts = [
      location?.address_line_1,
      location?.address_line_2,
      location?.city,
      location?.postal_code
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    // Format price
    const formatPrice = (price: number, interval: string) => {
      const formatted = `£${(price / 100).toFixed(2)}`;
      const intervalMap: Record<string, string> = {
        month: '/month', year: '/year', week: '/week', day: '/day'
      };
      return `${formatted}${intervalMap[interval] || ''}`;
    };

    const emailContent = `
      <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
        Welcome to ${gym?.name || 'the Gym'}! 🎉
      </h2>
      
      <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
        Hi ${member.first_name || 'there'}!<br/><br/>
        We're thrilled to have you as a member. Your fitness journey starts now!
      </p>
      
      ${member.member_number ? `
      <div style="background: linear-gradient(135deg, rgba(190, 255, 0, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 1px solid rgba(190, 255, 0, 0.3);">
        <p style="color: ${colors.textMuted}; margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Member Number</p>
        <p style="color: ${colors.primary}; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">${member.member_number}</p>
      </div>
      ` : ''}
      
      ${plan ? `
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.primary}; margin: 0 0 12px 0;">Your Membership</h3>
        <p style="color: ${colors.text}; margin: 0 0 4px 0; font-weight: 600; font-size: 18px;">${plan.name}</p>
        ${plan.price ? `<p style="color: ${colors.textMuted}; margin: 0 0 8px 0; font-size: 16px;">${formatPrice(plan.price, plan.billing_interval || 'month')}</p>` : ''}
        ${plan.description ? `<p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 14px;">${plan.description}</p>` : ''}
        ${membership?.start_date ? `<p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 13px;">Started: ${new Date(membership.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
      </div>
      ` : ''}
      
      ${location ? `
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.text}; margin: 0 0 16px 0;">📍 Your Home Club</h3>
        <p style="color: ${colors.text}; margin: 0 0 8px 0; font-weight: 600;">${location.name || gym?.name}</p>
        ${fullAddress ? `<p style="color: ${colors.textMuted}; margin: 0 0 8px 0; font-size: 14px;">${fullAddress}</p>` : ''}
        ${location.phone ? `<p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">📞 ${location.phone}</p>` : ''}
        
        ${location.opening_hours && Object.keys(location.opening_hours).length > 0 ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: ${colors.textMuted}; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">Opening Hours</p>
          ${formatOpeningHours(location.opening_hours)}
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.text}; margin: 0 0 16px 0;">🚀 What's Next?</h3>
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
      
      <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: ${colors.text}; margin: 0 0 12px 0; font-weight: 600;">📱 Get the FitConnect App</p>
        <p style="color: ${colors.textMuted}; margin: 0 0 16px 0; font-size: 14px;">Check in, book classes, and track your progress on the go</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <a href="https://apps.apple.com/app/fitconnect" style="display: inline-block; margin: 0 8px; color: ${colors.textMuted}; font-size: 13px; text-decoration: underline;">App Store</a>
              <span style="color: ${colors.textDark};">•</span>
              <a href="https://play.google.com/store/apps/details?id=com.fitconnect" style="display: inline-block; margin: 0 8px; color: ${colors.textMuted}; font-size: 13px; text-decoration: underline;">Google Play</a>
            </td>
          </tr>
        </table>
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
        subject: `Welcome to ${gym?.name || 'the Gym'}! 🎉 Your Member Number: ${member.member_number || ''}`.trim(),
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to send email: ${errorBody}`);
    }

    console.log(`[gym-send-welcome-email] Welcome email sent to ${member.email} with member number ${member.member_number}`);

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
