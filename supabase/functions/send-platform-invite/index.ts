import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { baseEmailTemplate, ctaButton, freeFloatingAvatarComponent, getEmailAvatarUrl, EMAIL_CONFIG } from "../_shared/email-templates.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

interface InviteRequest { email: string; name: string; coachId: string; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { email, name, coachId }: InviteRequest = await req.json();

    if (!email || !name || !coachId) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: coach } = await supabaseClient.from("coach_profiles").select("display_name").eq("id", coachId).single();
    const coachName = coach?.display_name || "Your Coach";
    const signupUrl = `${Deno.env.get("SITE_URL") || "https://app.example.com"}/auth?invite=true&coach=${coachId}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const { colors } = EMAIL_CONFIG;
      const avatarUrl = getEmailAvatarUrl('platform_invite', supabaseUrl);

      const emailContent = `
        ${freeFloatingAvatarComponent(avatarUrl, "FitConnect Mascot", 160)}
        <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">You're Invited!</h2>
        <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">Hi ${name}, <strong style="color: ${colors.primary}">${coachName}</strong> has invited you to join FitConnect - the platform for connecting with your personal trainer.</p>
        <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px;">With FitConnect, you can:</h3>
          <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 2;">
            <li>Book and manage your sessions</li>
            <li>Access your personalised training plans</li>
            <li>Track your progress</li>
            <li>Message your coach directly</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">${ctaButton("Create Your Account", signupUrl)}</div>
        <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">If you have any questions, just reply to this email or reach out to your coach.</p>
      `;

      const html = baseEmailTemplate(emailContent, `${coachName} has invited you to join FitConnect`);
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` }, body: JSON.stringify({ from: "FitConnect <noreply@getfitconnect.co.uk>", to: [email], subject: `${coachName} has invited you to join FitConnect`, html }) });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("Error sending platform invite:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});