import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  squircleAvatarComponent,
  infoCard,
  getAvatarUrl,
  getDefaultAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingRequestId: string;
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
    const { bookingRequestId }: BookingConfirmationRequest = await req.json();

    console.log(`Sending booking confirmation for request ${bookingRequestId}`);

    // Get booking request details
    const { data: booking, error: bookingError } = await supabase
      .from("booking_requests")
      .select(`
        *,
        coach:coach_profiles(user_id, display_name, profile_image_url, selected_avatar_id, location),
        client:client_profiles(user_id, first_name, last_name),
        session_type:session_types(name, duration_minutes, price, currency)
      `)
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking request not found");
    }

    const { colors } = EMAIL_CONFIG;

    // Get client email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === booking.client.user_id);

    if (!clientUser?.email) {
      throw new Error("Client email not found");
    }

    const coachName = booking.coach.display_name || "Your Coach";

    // Format date/time for push notification
    const requestedDate = new Date(booking.requested_at);
    const formattedDateShort = requestedDate.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short'
    });

    // Send push notification FIRST (before email preference check)
    try {
      console.log("[Push] Sending booking confirmation push to client:", booking.client.user_id);
      const sessionType = booking.session_type?.name || "Training Session";
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [booking.client.user_id],
          title: "Booking Request Sent",
          subtitle: coachName,
          message: `${sessionType} on ${formattedDateShort}`,
          preferenceKey: "push_bookings",
          data: { type: "booking_confirmation", bookingRequestId },
        }),
      });
      const pushResult = await pushResponse.json();
      console.log("[Push] Booking confirmation result:", JSON.stringify(pushResult));
    } catch (pushError) {
      console.error("[Push] Booking confirmation failed (non-blocking):", pushError);
    }

    // Check email preferences - only skip EMAIL, not push (push already sent above)
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_bookings")
      .eq("user_id", booking.client.user_id)
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

    const clientName = booking.client.first_name || "there";

    // Format date/time for email (longer format)
    const formattedDate = requestedDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = requestedDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const sessionType = booking.session_type?.name || "Training Session";
    const duration = booking.session_type?.duration_minutes || booking.duration_minutes || 60;
    
    // Format price
    const price = booking.session_type?.price || 0;
    const currency = booking.session_type?.currency || booking.currency || 'GBP';
    const formattedPrice = price > 0 
      ? new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price)
      : 'Free';

    const locationText = booking.is_online ? "Online Session" : booking.coach.location || "Location TBC";

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">✅</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Booking Request Sent!
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${clientName}, your booking request has been sent to <strong style="color: ${colors.primary}">${coachName}</strong>. You'll receive a confirmation once they accept.
      </p>
      
      ${squircleAvatarComponent(avatarUrl, coachName, 80)}
      
      ${infoCard("Booking Details", [
        { label: "Coach", value: coachName },
        { label: "Session Type", value: sessionType },
        { label: "Requested Date", value: formattedDate },
        { label: "Requested Time", value: formattedTime },
        { label: "Duration", value: `${duration} minutes` },
        { label: "Location", value: locationText },
        { label: "Price", value: formattedPrice },
      ])}
      
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
          <strong style="color: ${colors.primary};">What happens next?</strong><br>
          ${coachName} will review your request and confirm the booking. You'll receive an email when they respond.
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("View My Bookings", `${siteUrl}/dashboard/client/sessions`)}
      </div>
    `;

    const html = baseEmailTemplate(emailContent, `Booking request sent to ${coachName}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [clientUser.email],
        subject: `✅ Booking Request Sent to ${coachName}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send booking confirmation email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: booking.client.user_id,
      email_type: "booking_confirmation",
      recipient_email: clientUser.email,
      subject: `Booking Request Sent to ${coachName}`,
      status: "sent",
    });

    console.log("Booking confirmation email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
