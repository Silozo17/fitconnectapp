import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  profileImageWithGlow,
  getAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  firstName: string;
  role: 'client' | 'coach';
  avatarId?: string;
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
    const { userId, email, firstName, role, avatarId }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} (${role})`);

    // Get avatar URL if selected
    let avatarUrl = null;
    if (avatarId) {
      const { data: avatar } = await supabase
        .from("avatars")
        .select("name")
        .eq("id", avatarId)
        .single();
      
      if (avatar) {
        avatarUrl = getAvatarUrl(avatar.name, supabaseUrl);
      }
    }

    // Default mascot avatar for emails
    const mascotAvatarUrl = getAvatarUrl("Strongman Bear", supabaseUrl);
    const { colors } = EMAIL_CONFIG;

    let emailContent: string;
    let subject: string;

    if (role === 'client') {
      subject = `Welcome to FitConnect, ${firstName}! 🎉`;
      emailContent = `
        ${profileImageWithGlow(avatarUrl || mascotAvatarUrl, firstName, 100)}
        
        <h2 class="headline" style="color: ${colors.text}; margin: 24px 0 16px 0; text-align: center; font-size: 24px;">
          Welcome, ${firstName}!
        </h2>
        
        <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
          Your fitness journey starts here. FitConnect connects you with world-class coaches who will help you achieve your goals.
        </p>
        
        <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px;">Here's what you can do:</h3>
          <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 2;">
            <li>Browse and discover coaches that match your goals</li>
            <li>Book sessions and manage your schedule</li>
            <li>Receive personalised workout and nutrition plans</li>
            <li>Track your progress and earn achievements</li>
            <li>Connect your fitness wearables</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          ${ctaButton("Find Your Coach", `${siteUrl}/coaches`)}
        </div>
        
        <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
          Questions? Our support team is here to help you every step of the way.
        </p>
      `;
    } else {
      subject = `Welcome to FitConnect, Coach ${firstName}! 🏆`;
      emailContent = `
        ${profileImageWithGlow(avatarUrl || mascotAvatarUrl, firstName, 100)}
        
        <h2 class="headline" style="color: ${colors.text}; margin: 24px 0 16px 0; text-align: center; font-size: 24px;">
          Welcome, Coach ${firstName}!
        </h2>
        
        <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
          Thank you for joining FitConnect! You're now part of a community of elite fitness professionals. Let's get your profile set up so clients can find you.
        </p>
        
        <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px;">Complete your profile to get started:</h3>
          <ul style="color: ${colors.textMuted}; margin: 0; padding-left: 20px; line-height: 2;">
            <li>Add your profile photo and bio</li>
            <li>Set your specialties and certifications</li>
            <li>Configure your availability and session types</li>
            <li>Connect your Stripe account for payments</li>
            <li>Upload verification documents</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          ${ctaButton("Complete Your Profile", `${siteUrl}/dashboard/coach/settings`)}
        </div>
        
        <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
          A complete profile increases your visibility and helps attract more clients.
        </p>
      `;
    }

    const html = baseEmailTemplate(emailContent, `Welcome to FitConnect, ${firstName}!`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send welcome email");
    }

    // Log email sent
    await supabase.from("email_logs").insert({
      user_id: userId,
      email_type: `welcome_${role}`,
      recipient_email: email,
      subject,
      status: "sent",
    });

    console.log("Welcome email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
