import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { baseEmailTemplate, ctaButton, freeFloatingAvatarComponent, getEmailAvatarUrl, EMAIL_CONFIG } from "../_shared/email-templates.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

interface ReviewRequestEmailRequest { sessionId: string; customMessage?: string | null; delayHours?: number; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("APP_URL") || Deno.env.get("SITE_URL") || "https://app.getfitconnect.co.uk";
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sessionId, customMessage, delayHours = 0 }: ReviewRequestEmailRequest = await req.json();

    const { data: session, error: sessionError } = await supabase.from("coaching_sessions").select(`*, coach:coach_profiles(id, user_id, display_name), client:client_profiles(user_id, first_name)`).eq("id", sessionId).single();
    if (sessionError || !session) throw new Error("Session not found");

    const { data: existingReview } = await supabase.from("reviews").select("id").eq("session_id", sessionId).single();
    if (existingReview) return new Response(JSON.stringify({ skipped: true, reason: "Review exists" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { colors } = EMAIL_CONFIG;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === session.client.user_id);
    if (!clientUser?.email) throw new Error("Client email not found");

    const { data: prefs } = await supabase.from("notification_preferences").select("email_bookings").eq("user_id", session.client.user_id).single();
    if (prefs && prefs.email_bookings === false) return new Response(JSON.stringify({ skipped: true, reason: "Notifications disabled" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const avatarUrl = getEmailAvatarUrl('review_request', supabaseUrl);
    const coachName = session.coach.display_name || "Your Coach";
    const clientName = session.client.first_name || "there";
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

    let personalizedMessage = "";
    if (customMessage) personalizedMessage = customMessage.replace(/{client_name}/g, clientName).replace(/{session_date}/g, formattedDate);

    const reviewUrl = `${siteUrl}/review?sessionId=${sessionId}&coachId=${session.coach.id}&coachName=${encodeURIComponent(coachName)}`;

    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Review Mascot", 140)}
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">How Was Your Session?</h2>
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">Hi ${clientName}, we hope you enjoyed your session with <strong style="color: ${colors.primary}">${coachName}</strong> on ${formattedDate}!</p>
      ${personalizedMessage ? `<div style="background: rgba(255,255,255,0.03); border-left: 3px solid ${colors.primary}; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;"><p style="color: ${colors.text}; margin: 0; font-style: italic; line-height: 1.6;">"${personalizedMessage}"</p><p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 13px;">— ${coachName.split(' ')[0]}</p></div>` : ''}
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;"><p style="color: ${colors.textMuted}; margin: 0 0 16px 0;">Your feedback helps other clients find great coaches.</p><div style="margin: 20px 0;"><span style="font-size: 32px; letter-spacing: 8px;">⭐⭐⭐⭐⭐</span></div></div>
      <div style="text-align: center; margin: 32px 0;">${ctaButton("Leave a Review", reviewUrl)}</div>
    `;

    const html = baseEmailTemplate(emailContent, `How was your session with ${coachName}?`);
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "FitConnect <support@getfitconnect.co.uk>", to: [clientUser.email], subject: `⭐ How was your session with ${coachName}?`, html }) });
    await supabase.from("email_logs").insert({ user_id: session.client.user_id, email_type: "review_request", recipient_email: clientUser.email, subject: `How was your session with ${coachName}?`, status: "sent" });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error sending review request:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});