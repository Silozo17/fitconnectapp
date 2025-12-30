import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  squircleAvatarComponent,
  infoCard,
  getDefaultAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingAcceptedRequest {
  sessionId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "https://fitconnect.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sessionId }: BookingAcceptedRequest = await req.json();

    console.log(`Sending booking accepted email for session ${sessionId}`);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles(user_id, display_name, profile_image_url, selected_avatar_id),
        client:client_profiles(user_id, first_name, last_name)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    const { colors } = EMAIL_CONFIG;

    // Get client email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === session.client.user_id);

    if (!clientUser?.email) {
      throw new Error("Client email not found");
    }

    const coachName = session.coach.display_name || "Your Coach";

    // Format date/time for push notification
    const sessionDate = new Date(session.scheduled_at);
    const formattedDateShort = sessionDate.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });
    const formattedTimeShort = sessionDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Send push notification FIRST (before email preference check)
    try {
      console.log("[Push] Sending booking accepted push to client:", session.client.user_id);
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [session.client.user_id],
          title: "Booking Confirmed",
          subtitle: coachName,
          message: `${formattedDateShort} at ${formattedTimeShort}`,
          preferenceKey: "push_bookings",
          data: { type: "booking_accepted", sessionId },
        }),
      });
      const pushResult = await pushResponse.json();
      console.log("[Push] Booking accepted result:", JSON.stringify(pushResult));
    } catch (pushError) {
      console.error("[Push] Booking accepted failed (non-blocking):", pushError);
    }

    // Check email preferences - only skip EMAIL, not push (push already sent above)
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_bookings")
      .eq("user_id", session.client.user_id)
      .single();

    if (prefs && prefs.email_bookings === false) {
      console.log("User has disabled booking email notifications - email skipped, push already sent");
      return new Response(JSON.stringify({ success: true, emailSkipped: true, pushSent: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use default FitConnect mascot avatar
    const avatarUrl = getDefaultAvatarUrl(supabaseUrl);

    const clientName = session.client.first_name || "there";

    // Format date/time for email (longer format)
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = sessionDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const locationText = session.is_online ? "Online Session" : session.location || "Location TBC";

    // Generate calendar link (Google Calendar)
    const startTime = sessionDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(sessionDate.getTime() + session.duration_minutes * 60000);
    const endTime = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Session with ${coachName}`)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Training session with ${coachName} on FitConnect`)}&location=${encodeURIComponent(session.is_online ? 'Online' : session.location || '')}`;

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Booking Confirmed!
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Great news, ${clientName}! <strong style="color: ${colors.primary}">${coachName}</strong> has accepted your booking request.
      </p>
      
      ${squircleAvatarComponent(avatarUrl, coachName, 80)}
      
      ${infoCard("Session Details", [
        { label: "Coach", value: coachName },
        { label: "Date", value: formattedDate },
        { label: "Time", value: formattedTime },
        { label: "Duration", value: `${session.duration_minutes} minutes` },
        { label: "Location", value: locationText },
        { label: "Type", value: session.session_type || "Training Session" },
      ])}
      
      ${session.is_online && session.video_meeting_url ? `
        <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="color: ${colors.textMuted}; margin: 0 0 12px 0; font-size: 14px;">
            <strong style="color: ${colors.primary};">Video Meeting Link Ready</strong>
          </p>
          <a href="${session.video_meeting_url}" style="color: ${colors.primary}; word-break: break-all;">${session.video_meeting_url}</a>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 32px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 8px;">
              ${ctaButton("Add to Calendar", calendarUrl, false)}
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 8px;">
              ${ctaButton("View Session", `${siteUrl}/dashboard/client/sessions`, true)}
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin: 24px 0;">
        <h4 style="color: ${colors.primary}; margin: 0 0 12px 0; font-size: 14px;">Preparation Tips:</h4>
        <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
          <li>Arrive 5-10 minutes early</li>
          <li>Wear comfortable workout clothes</li>
          <li>Bring water and a towel</li>
          <li>Let your coach know about any injuries or concerns</li>
        </ul>
      </div>
    `;

    const html = baseEmailTemplate(emailContent, `Your session with ${coachName} is confirmed!`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [clientUser.email],
        subject: `🎉 Booking Confirmed with ${coachName}!`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send booking accepted email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: session.client.user_id,
      email_type: "booking_accepted",
      recipient_email: clientUser.email,
      subject: `Booking Confirmed with ${coachName}`,
      status: "sent",
    });

    console.log("Booking accepted email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending booking accepted email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
