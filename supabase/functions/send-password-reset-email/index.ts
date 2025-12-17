import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, resetLink }: PasswordResetRequest = await req.json();

    console.log(`Sending password reset email to ${email}`);

    const { colors } = EMAIL_CONFIG;

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: rgba(190, 255, 0, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">🔐</span>
        </div>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Reset Your Password
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        We received a request to reset your FitConnect password. Click the button below to create a new password.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("Reset Password", resetLink)}
      </div>
      
      <div style="background: rgba(255, 165, 0, 0.1); border-left: 3px solid #FFA500; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
          <strong style="color: #FFA500;">Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin-top: 24px;">
        If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
        <span style="color: ${colors.textMuted}; word-break: break-all;">${resetLink}</span>
      </p>
    `;

    const html = baseEmailTemplate(emailContent, "Reset your FitConnect password");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <security@resend.dev>",
        to: [email],
        subject: "Reset Your FitConnect Password",
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send password reset email");
    }

    // Log email
    const { data: user } = await supabase.auth.admin.listUsers();
    const foundUser = user?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      await supabase.from("email_logs").insert({
        user_id: foundUser.id,
        email_type: "password_reset",
        recipient_email: email,
        subject: "Reset Your FitConnect Password",
        status: "sent",
      });
    }

    console.log("Password reset email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
