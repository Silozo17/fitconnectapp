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
    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("Missing required parameter: bookingId");
    }

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from("gym_class_bookings")
      .select(`
        id,
        status,
        gym_classes!inner(
          id,
          start_time,
          end_time,
          gym_class_types!inner(name, description),
          gym_locations(name, address),
          gym_staff(first_name, last_name)
        ),
        gym_members!inner(
          id,
          first_name,
          email,
          gym_profiles!inner(id, name, slug)
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    const member = booking.gym_members as any;
    const gymClass = booking.gym_classes as any;
    const gym = member.gym_profiles;
    const classType = gymClass.gym_class_types;
    const location = gymClass.gym_locations;
    const instructor = gymClass.gym_staff;

    if (!member.email) {
      console.log("[gym-send-booking-confirmation] No email for member, skipping");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://getfitconnect.co.uk";
    const portalUrl = `${siteUrl}/club/${gym?.slug}/portal`;
    const { colors } = EMAIL_CONFIG;

    const classTime = new Date(gymClass.start_time);
    const endTime = new Date(gymClass.end_time);
    const formattedDate = classTime.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = `${classTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const emailContent = `
      <h2 style="color: ${colors.text}; text-align: center; margin-bottom: 24px;">
        Booking Confirmed! 🎯
      </h2>
      
      <p style="color: ${colors.textMuted}; text-align: center; margin-bottom: 24px;">
        Hi ${member.first_name || 'there'}!<br/><br/>
        Your class booking has been confirmed. See you there!
      </p>
      
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.primary}; margin: 0 0 16px 0;">${classType?.name || 'Class'}</h3>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 14px;">📅 Date</td>
            <td style="padding: 8px 0; color: ${colors.text}; font-weight: 500; text-align: right;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 14px;">⏰ Time</td>
            <td style="padding: 8px 0; color: ${colors.text}; font-weight: 500; text-align: right;">${formattedTime}</td>
          </tr>
          ${location ? `
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 14px;">📍 Location</td>
            <td style="padding: 8px 0; color: ${colors.text}; font-weight: 500; text-align: right;">${location.name}</td>
          </tr>
          ` : ''}
          ${instructor ? `
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted}; font-size: 14px;">👤 Instructor</td>
            <td style="padding: 8px 0; color: ${colors.text}; font-weight: 500; text-align: right;">${instructor.first_name} ${instructor.last_name || ''}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
          ⚡ <strong style="color: ${colors.text};">Tip:</strong> Arrive 10 minutes early to check in and warm up.
          ${location?.address ? `<br/><br/>📍 ${location.address}` : ''}
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("View My Schedule", portalUrl)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        Can't make it? Please cancel your booking so someone else can take your spot.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `Class Booking Confirmed - ${classType?.name}`);

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
        subject: `Booking Confirmed: ${classType?.name || 'Class'} - ${formattedDate}`,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to send email: ${errorBody}`);
    }

    console.log(`[gym-send-booking-confirmation] Confirmation email sent to ${member.email}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[gym-send-booking-confirmation] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
