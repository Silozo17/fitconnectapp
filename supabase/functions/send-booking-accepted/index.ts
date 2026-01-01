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
    const { sessionId } = await req.json();
    const { data: session, error } = await supabase.from("coaching_sessions").select(`*, coach:coach_profiles(user_id, display_name), client:client_profiles(user_id, first_name)`).eq("id", sessionId).single();
    if (error || !session) throw new Error("Session not found");

    const { colors } = EMAIL_CONFIG;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === session.client.user_id);
    if (!clientUser?.email) throw new Error("Client email not found");

    const coachName = session.coach.display_name || "Your Coach";
    const sessionDate = new Date(session.scheduled_at);
    const formattedDateShort = sessionDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const formattedTimeShort = sessionDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    try { await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, { method: "POST", headers: { "Authorization": `Bearer ${supabaseServiceKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ userIds: [session.client.user_id], title: "Booking Confirmed", subtitle: coachName, message: `${formattedDateShort} at ${formattedTimeShort}`, preferenceKey: "push_bookings", data: { type: "booking_accepted", sessionId } }) }); } catch {}

    const { data: prefs } = await supabase.from("notification_preferences").select("email_bookings").eq("user_id", session.client.user_id).single();
    if (prefs && prefs.email_bookings === false) return new Response(JSON.stringify({ success: true, emailSkipped: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const avatarUrl = getEmailAvatarUrl('booking_accepted', supabaseUrl);
    const clientName = session.client.first_name || "there";
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = sessionDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const locationText = session.is_online ? "Online Session" : session.location || "Location TBC";

    const startTime = sessionDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(sessionDate.getTime() + session.duration_minutes * 60000);
    const endTime = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Session with ${coachName}`)}&dates=${startTime}/${endTime}&location=${encodeURIComponent(session.is_online ? 'Online' : session.location || '')}`;

    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Confirmed Mascot", 140)}
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">Booking Confirmed!</h2>
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">Great news, ${clientName}! <strong style="color: ${colors.primary}">${coachName}</strong> has accepted your booking request.</p>
      ${infoCard("Session Details", [{ label: "Coach", value: coachName }, { label: "Date", value: formattedDate }, { label: "Time", value: formattedTime }, { label: "Duration", value: `${session.duration_minutes} min` }, { label: "Location", value: locationText }])}
      <div style="text-align: center; margin: 32px 0;">${ctaButton("Add to Calendar", calendarUrl)}</div>
      <div style="text-align: center; margin: 16px 0;">${ctaButton("View Session", `${siteUrl}/dashboard/client/sessions`, true)}</div>
    `;

    const html = baseEmailTemplate(emailContent, `Your session with ${coachName} is confirmed!`);
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "FitConnect <support@getfitconnect.co.uk>", to: [clientUser.email], subject: `🎉 Booking Confirmed with ${coachName}!`, html }) });
    await supabase.from("email_logs").insert({ user_id: session.client.user_id, email_type: "booking_accepted", recipient_email: clientUser.email, subject: `Booking Confirmed with ${coachName}`, status: "sent" });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});