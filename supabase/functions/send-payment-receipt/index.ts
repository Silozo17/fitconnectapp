import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  freeFloatingAvatarComponent,
  getEmailAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReceiptRequest {
  userId: string;
  email: string;
  firstName: string;
  amount: number;
  currency: string;
  description: string;
  coachName?: string;
  receiptUrl?: string;
  paymentIntentId?: string;
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
    const { 
      userId, 
      email, 
      firstName, 
      amount, 
      currency, 
      description, 
      coachName,
      receiptUrl,
      paymentIntentId 
    }: PaymentReceiptRequest = await req.json();

    console.log(`Sending payment receipt to ${email}`);

    const { colors } = EMAIL_CONFIG;
    const avatarUrl = getEmailAvatarUrl('payment', supabaseUrl);

    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    // Generate receipt number from payment intent
    const receiptNumber = paymentIntentId 
      ? `FC-${paymentIntentId.slice(-8).toUpperCase()}`
      : `FC-${Date.now().toString(36).toUpperCase()}`;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });

    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Payment Mascot", 140)}
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        Payment Receipt
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${firstName || 'there'}, thank you for your payment. Here's your receipt.
      </p>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid ${colors.border};">
        <!-- Receipt Header -->
        <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="color: ${colors.textMuted}; font-size: 12px;">Receipt #</span><br>
                <span style="color: ${colors.text}; font-weight: 500;">${receiptNumber}</span>
              </td>
              <td style="text-align: right;">
                <span style="color: ${colors.textMuted}; font-size: 12px;">Date</span><br>
                <span style="color: ${colors.text}; font-weight: 500;">${formattedDate}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Line Items -->
        <div style="margin-bottom: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 12px 0; color: ${colors.text};">
                ${description}
                ${coachName ? `<br><span style="color: ${colors.textMuted}; font-size: 12px;">Coach: ${coachName}</span>` : ''}
              </td>
              <td style="padding: 12px 0; text-align: right; color: ${colors.text}; font-weight: 500;">
                ${formattedAmount}
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Total -->
        <div style="border-top: 2px solid ${colors.primary}; padding-top: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color: ${colors.primary}; font-weight: 700; font-size: 16px;">
                Total Paid
              </td>
              <td style="text-align: right; color: ${colors.primary}; font-weight: 700; font-size: 20px;">
                ${formattedAmount}
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
          <strong style="color: ${colors.primary};">Payment Method</strong><br>
          Card ending in •••• (processed via Stripe)
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${receiptUrl 
          ? ctaButton("View Full Receipt", receiptUrl)
          : ctaButton("View My Purchases", `${siteUrl}/dashboard/client/library`)
        }
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center;">
        This receipt confirms your payment has been processed successfully.<br>
        For billing inquiries, please contact support.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `Payment receipt for ${formattedAmount}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [email],
        subject: `🧾 Payment Receipt - ${formattedAmount}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send payment receipt email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: userId,
      email_type: "payment_receipt",
      recipient_email: email,
      subject: `Payment Receipt - ${formattedAmount}`,
      status: "sent",
    });

    console.log("Payment receipt email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending payment receipt:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});