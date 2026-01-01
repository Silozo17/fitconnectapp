import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { baseEmailTemplate, ctaButton, freeFloatingAvatarComponent, infoCard, getEmailAvatarUrl, EMAIL_CONFIG } from "../_shared/email-templates.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "https://fitconnect.com";
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { bookingRequestId } = await req.json();
    const { data: booking, error: bookingError } = await supabase.from("booking_requests").select(`*, coach:coach_profiles(user_id, display_name, location), client:client_profiles(user_id, first_name), session_type:session_types(name, duration_minutes, price, currency)`).eq("id", bookingRequestId).single();
    if (bookingError || !booking) throw new Error("Booking request not found");

    const { colors } = EMAIL_CONFIG;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === booking.client.user_id);
    if (!clientUser?.email) throw new Error("Client email not found");

    const coachName = booking.coach.display_name || "Your Coach";
    const requestedDate = new Date(booking.requested_at);
    const formattedDateShort = requestedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    try {
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, { method: "POST", headers: { "Authorization": `Bearer ${supabaseServiceKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ userIds: [booking.client.user_id], title: "Booking Request Sent", subtitle: coachName, message: `${booking.session_type?.name || "Session"} on ${formattedDateShort}`, preferenceKey: "push_bookings", data: { type: "booking_confirmation", bookingRequestId } }) });
    } catch {}

    const { data: prefs } = await supabase.from("notification_preferences").select("email_bookings").eq("user_id", booking.client.user_id).single();
    if (prefs && prefs.email_bookings === false) return new Response(JSON.stringify({ success: true, emailSkipped: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const avatarUrl = getEmailAvatarUrl('booking', supabaseUrl);
    const clientName = booking.client.first_name || "there";
    const formattedDate = requestedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = requestedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const duration = booking.session_type?.duration_minutes || booking.duration_minutes || 60;
    const price = booking.session_type?.price || 0;
    const currency = booking.session_type?.currency || booking.currency || 'GBP';
    const formattedPrice = price > 0 ? new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(price) : 'Free';

    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Booking Mascot", 140)}
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">Booking Request Sent!</h2>
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">Hi ${clientName}, your booking request has been sent to <strong style="color: ${colors.primary}">${coachName}</strong>.</p>
      ${infoCard("Booking Details", [{ label: "Coach", value: coachName }, { label: "Session Type", value: booking.session_type?.name || "Training" }, { label: "Date", value: formattedDate }, { label: "Time", value: formattedTime }, { label: "Duration", value: `${duration} minutes` }, { label: "Price", value: formattedPrice }])}
      <div style="text-align: center; margin: 32px 0;">${ctaButton("View My Bookings", `${siteUrl}/dashboard/client/sessions`)}</div>
    `;

    const html = baseEmailTemplate(emailContent, `Booking request sent to ${coachName}`);
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "FitConnect <support@getfitconnect.co.uk>", to: [clientUser.email], subject: `✅ Booking Request Sent to ${coachName}`, html }) });
    await supabase.from("email_logs").insert({ user_id: booking.client.user_id, email_type: "booking_confirmation", recipient_email: clientUser.email, subject: `Booking Request Sent to ${coachName}`, status: "sent" });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});