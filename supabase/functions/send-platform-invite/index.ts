import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  name: string;
  coachId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name, coachId }: InviteRequest = await req.json();

    if (!email || !name || !coachId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get coach info
    const { data: coach } = await supabaseClient
      .from("coach_profiles")
      .select("display_name, profile_image_url")
      .eq("id", coachId)
      .single();

    const coachName = coach?.display_name || "Your Coach";
    const signupUrl = `${Deno.env.get("SITE_URL") || "https://app.example.com"}/auth?invite=true&coach=${coachId}`;

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "CoachConnect <noreply@coachconnect.app>",
          to: [email],
          subject: `${coachName} has invited you to join CoachConnect`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">You're Invited!</h1>
              <p>Hi ${name},</p>
              <p><strong>${coachName}</strong> has invited you to join CoachConnect - the platform for connecting with your personal trainer.</p>
              <p>With CoachConnect, you can:</p>
              <ul>
                <li>Book and manage your sessions</li>
                <li>Access your personalized training plans</li>
                <li>Track your progress</li>
                <li>Message your coach directly</li>
              </ul>
              <p style="margin: 30px 0;">
                <a href="${signupUrl}" style="background-color: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Create Your Account
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                If you have any questions, just reply to this email or reach out to your coach.
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email:", await emailResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending platform invite:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
