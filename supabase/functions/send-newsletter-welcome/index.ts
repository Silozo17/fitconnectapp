import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  squircleAvatarComponent,
  getDefaultAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterWelcomeRequest {
  email: string;
  firstName?: string;
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
    const { email, firstName }: NewsletterWelcomeRequest = await req.json();

    console.log(`Sending newsletter welcome to ${email}`);

    const { colors } = EMAIL_CONFIG;

    // Use default FitConnect mascot avatar
    const mascotAvatarUrl = getDefaultAvatarUrl(supabaseUrl);
    const name = firstName || "Fitness Enthusiast";

    const emailContent = `
      ${squircleAvatarComponent(mascotAvatarUrl, "FitConnect", 100)}
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Welcome to FitConnect!
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hey ${name}! Thanks for subscribing to our newsletter. You're now part of a community dedicated to fitness excellence.
      </p>
      
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px; text-align: center;">What to expect:</h3>
        <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 2;">
          <li>Weekly fitness tips from top coaches</li>
          <li>Exclusive workout routines and nutrition advice</li>
          <li>Success stories from our community</li>
          <li>Early access to new features and promotions</li>
          <li>Coach spotlights and interviews</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("Explore Coaches", `${siteUrl}/coaches`)}
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
          <strong style="color: ${colors.primary};">Ready to transform your fitness?</strong><br>
          Create a free account to connect with coaches and track your progress.
        </p>
        <div style="margin-top: 16px;">
          ${ctaButton("Get Started Free", `${siteUrl}/auth`, true)}
        </div>
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin-top: 24px;">
        You can unsubscribe at any time by clicking the link in any of our emails.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, "Welcome to the FitConnect community!");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [email],
        subject: "🎯 Welcome to FitConnect!",
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send newsletter welcome email");
    }

    // Log email (no user_id since they may not have an account)
    await supabase.from("email_logs").insert({
      email_type: "newsletter_welcome",
      recipient_email: email,
      subject: "Welcome to FitConnect!",
      status: "sent",
    });

    console.log("Newsletter welcome email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending newsletter welcome:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
