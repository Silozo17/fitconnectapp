import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  freeFloatingAvatarComponent,
  infoCard,
  getEmailAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayoutEmailRequest {
  coachId: string;
  amount: number;
  currency: string;
  periodStart?: string;
  periodEnd?: string;
  sessionsCount?: number;
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
    const { coachId, amount, currency, periodStart, periodEnd, sessionsCount }: PayoutEmailRequest = await req.json();

    console.log(`Sending payout notification to coach ${coachId}`);

    // Get coach details
    const { data: coach, error: coachError } = await supabase
      .from("coach_profiles")
      .select("user_id, display_name")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      throw new Error("Coach not found");
    }

    // Get coach email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const coachUser = users?.find(u => u.id === coach.user_id);
    
    if (!coachUser?.email) {
      throw new Error("Coach email not found");
    }

    const coachName = coach.display_name || "Coach";
    const { colors } = EMAIL_CONFIG;
    const avatarUrl = getEmailAvatarUrl('payout', supabaseUrl);

    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    // Format dates
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    };

    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Payout Mascot", 140)}
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Payout Sent!
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Great news, ${coachName}! Your payout has been processed and is on its way to your bank account.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%); border: 2px solid ${colors.primary}; border-radius: 16px; padding: 24px 48px;">
          <div style="color: ${colors.textMuted}; font-size: 14px; margin-bottom: 8px;">Amount Paid</div>
          <div style="color: ${colors.primary}; font-size: 36px; font-weight: 700;">${formattedAmount}</div>
        </div>
      </div>
      
      ${infoCard("Payout Details", [
        { label: "Period", value: `${formatDate(periodStart)} - ${formatDate(periodEnd)}` },
        { label: "Sessions", value: sessionsCount?.toString() || 'N/A' },
        { label: "Currency", value: currency.toUpperCase() },
        { label: "Status", value: "✓ Sent" },
      ])}
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("View Earnings Dashboard", `${siteUrl}/dashboard/coach/earnings`)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        Funds typically arrive within 2-3 business days depending on your bank.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `Payout sent: ${formattedAmount}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [coachUser.email],
        subject: `💰 Payout Sent: ${formattedAmount}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send payout email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: coach.user_id,
      email_type: "payout",
      recipient_email: coachUser.email,
      subject: `Payout Sent: ${formattedAmount}`,
      status: "sent",
    });

    console.log("Payout email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending payout email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});