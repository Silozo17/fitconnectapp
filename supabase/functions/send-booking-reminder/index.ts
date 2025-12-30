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

interface BookingReminderRequest {
  sessionId: string;
  reminderType: '24h' | '1h';
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
    const { sessionId, reminderType }: BookingReminderRequest = await req.json();

    console.log(`Sending ${reminderType} booking reminder for session ${sessionId}`);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles(user_id, display_name, profile_image_url, selected_avatar_id),
        client:client_profiles(user_id, first_name, last_name, avatar_url, selected_avatar_id)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Skip if session is cancelled
    if (session.status === 'cancelled') {
      console.log("Session is cancelled, skipping reminder");
      return new Response(JSON.stringify({ skipped: true, reason: "Session cancelled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { colors } = EMAIL_CONFIG;

    // Get user emails
    const { data: { users } } = await supabase.auth.admin.listUsers();
    
    const coachUser = users?.find(u => u.id === session.coach.user_id);
    const clientUser = users?.find(u => u.id === session.client.user_id);

    // Get email preferences for both users
    const { data: clientPrefs } = await supabase
      .from("notification_preferences")
      .select("email_reminders")
      .eq("user_id", session.client.user_id)
      .single();

    const { data: coachPrefs } = await supabase
      .from("notification_preferences")
      .select("email_reminders")
      .eq("user_id", session.coach.user_id)
      .single();

    const clientEmailEnabled = clientPrefs?.email_reminders !== false;
    const coachEmailEnabled = coachPrefs?.email_reminders !== false;

    // Format session time
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long' 
    });
    const formattedTime = sessionDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const isUrgent = reminderType === '1h';
    const reminderText = isUrgent ? "Starting in 1 hour!" : "Tomorrow's Session";
    const urgencyEmoji = isUrgent ? "⏰" : "📅";

    // Use default FitConnect mascot avatar
    const avatarUrl = getDefaultAvatarUrl(supabaseUrl);

    const coachName = session.coach.display_name || "Your Coach";
    const clientName = [session.client.first_name, session.client.last_name].filter(Boolean).join(' ') || "Your Client";

    const locationText = session.is_online 
      ? "Online Session" 
      : session.location || "Location TBC";

    // Send to client (only if email reminders are enabled)
    if (clientUser?.email && clientEmailEnabled) {
      const clientContent = `
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">${urgencyEmoji}</span>
        </div>
        
        <h2 class="headline" style="color: ${colors.text}; margin: 0 0 8px 0; text-align: center; font-size: 24px;">
          ${reminderText}
        </h2>
        
        <p style="color: ${colors.primary}; font-size: 18px; text-align: center; margin: 0 0 24px 0;">
          Session with ${coachName}
        </p>
        
        ${squircleAvatarComponent(avatarUrl, coachName, 80)}
        
        ${infoCard("Session Details", [
          { label: "Date", value: formattedDate },
          { label: "Time", value: formattedTime },
          { label: "Duration", value: `${session.duration_minutes} minutes` },
          { label: "Location", value: locationText },
          { label: "Type", value: session.session_type || "Training Session" },
        ])}
        
        ${session.is_online && session.video_meeting_url ? `
          <div style="text-align: center; margin: 32px 0;">
            ${ctaButton("Join Video Call", session.video_meeting_url)}
          </div>
        ` : `
          <div style="text-align: center; margin: 32px 0;">
            ${ctaButton("View Session Details", `${siteUrl}/dashboard/client/sessions`)}
          </div>
        `}
        
        ${isUrgent ? `
          <p style="color: ${colors.primary}; font-size: 14px; text-align: center; font-weight: 600;">
            Get ready! Your session starts soon.
          </p>
        ` : `
          <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
            Need to reschedule? Contact your coach as soon as possible.
          </p>
        `}
      `;

      const clientHtml = baseEmailTemplate(clientContent, `${reminderText} - ${formattedDate} at ${formattedTime}`);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FitConnect <support@getfitconnect.co.uk>",
          to: [clientUser.email],
          subject: `${urgencyEmoji} ${reminderText}: Session with ${coachName}`,
          html: clientHtml,
        }),
      });

      await supabase.from("email_logs").insert({
        user_id: session.client.user_id,
        email_type: `booking_reminder_${reminderType}`,
        recipient_email: clientUser.email,
        subject: `${reminderText}: Session with ${coachName}`,
        status: "sent",
      });
    }

    // Send to coach (only if email reminders are enabled)
    if (coachUser?.email && coachEmailEnabled) {
      const coachContent = `
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">${urgencyEmoji}</span>
        </div>
        
        <h2 class="headline" style="color: ${colors.text}; margin: 0 0 8px 0; text-align: center; font-size: 24px;">
          ${reminderText}
        </h2>
        
        <p style="color: ${colors.primary}; font-size: 18px; text-align: center; margin: 0 0 24px 0;">
          Session with ${clientName}
        </p>
        
        ${squircleAvatarComponent(avatarUrl, clientName, 80)}
        
        ${infoCard("Session Details", [
          { label: "Client", value: clientName },
          { label: "Date", value: formattedDate },
          { label: "Time", value: formattedTime },
          { label: "Duration", value: `${session.duration_minutes} minutes` },
          { label: "Location", value: locationText },
        ])}
        
        <div style="text-align: center; margin: 32px 0;">
          ${ctaButton("View Schedule", `${siteUrl}/dashboard/coach/schedule`)}
        </div>
      `;

      const coachHtml = baseEmailTemplate(coachContent, `${reminderText} - ${clientName}`);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FitConnect <support@getfitconnect.co.uk>",
          to: [coachUser.email],
          subject: `${urgencyEmoji} ${reminderText}: Session with ${clientName}`,
          html: coachHtml,
        }),
      });

      await supabase.from("email_logs").insert({
        user_id: session.coach.user_id,
        email_type: `booking_reminder_${reminderType}`,
        recipient_email: coachUser.email,
        subject: `${reminderText}: Session with ${clientName}`,
        status: "sent",
      });
    }

    console.log("Booking reminder emails sent successfully");

    // Send push notifications to both client and coach
    const pushTitle = isUrgent ? "Session Starting Soon" : "Session Tomorrow";
    try {
      // Push to client
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [session.client.user_id],
          title: pushTitle,
          subtitle: coachName,
          message: `${formattedDate} at ${formattedTime}`,
          preferenceKey: "push_reminders",
          data: { type: "booking_reminder", sessionId, reminderType },
        }),
      });

      // Push to coach
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [session.coach.user_id],
          title: pushTitle,
          subtitle: clientName,
          message: `${formattedDate} at ${formattedTime}`,
          preferenceKey: "push_reminders",
          data: { type: "booking_reminder", sessionId, reminderType },
        }),
      });
      
      console.log("Push notifications sent successfully");
    } catch (pushError) {
      console.error("Push notification failed (non-blocking):", pushError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending booking reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
