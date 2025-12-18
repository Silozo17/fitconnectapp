import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  profileImageWithGlow,
  messageBox,
  getAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConnectionRequestEmailRequest {
  connectionRequestId: string;
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
    const { connectionRequestId }: ConnectionRequestEmailRequest = await req.json();

    console.log(`Sending connection request email for ${connectionRequestId}`);

    // Get connection request details
    const { data: request, error: requestError } = await supabase
      .from("connection_requests")
      .select(`
        *,
        client:client_profiles(user_id, first_name, last_name, avatar_url, selected_avatar_id, fitness_goals, location),
        coach:coach_profiles(user_id, display_name)
      `)
      .eq("id", connectionRequestId)
      .single();

    if (requestError || !request) {
      throw new Error("Connection request not found");
    }

    const { colors } = EMAIL_CONFIG;

    // Get coach email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const coachUser = users?.find(u => u.id === request.coach.user_id);

    if (!coachUser?.email) {
      throw new Error("Coach email not found");
    }

    // Get client avatar
    let clientAvatarUrl = request.client.avatar_url;
    if (request.client.selected_avatar_id) {
      const { data: avatar } = await supabase
        .from("avatars")
        .select("name")
        .eq("id", request.client.selected_avatar_id)
        .single();
      if (avatar) clientAvatarUrl = getAvatarUrl(avatar.name, supabaseUrl);
    }

    const clientName = [request.client.first_name, request.client.last_name].filter(Boolean).join(' ') || "A potential client";
    const coachName = request.coach.display_name || "Coach";
    const goalsText = request.client.fitness_goals?.join(', ') || "Not specified";

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🤝</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        New Connection Request
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${coachName}, <strong style="color: ${colors.primary}">${clientName}</strong> wants to connect with you!
      </p>
      
      ${profileImageWithGlow(clientAvatarUrl, clientName, 80)}
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h4 style="color: ${colors.primary}; margin: 0 0 12px 0; font-size: 14px;">About ${request.client.first_name || 'this client'}</h4>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted};">Location</td>
            <td style="padding: 8px 0; text-align: right; color: ${colors.text};">${request.client.location || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${colors.textMuted};">Goals</td>
            <td style="padding: 8px 0; text-align: right; color: ${colors.text};">${goalsText}</td>
          </tr>
        </table>
      </div>
      
      ${request.message ? messageBox(request.message, clientName) : ''}
      
      <div style="text-align: center; margin: 32px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 8px;">
              ${ctaButton("View Request", `${siteUrl}/dashboard/coach/connections`)}
            </td>
          </tr>
        </table>
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        Accept to start working with this client, or decline to pass on this opportunity.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `${clientName} wants to connect with you`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [coachUser.email],
        subject: `🤝 New Connection Request from ${clientName}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send connection request email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: request.coach.user_id,
      email_type: "connection_request",
      recipient_email: coachUser.email,
      subject: `New Connection Request from ${clientName}`,
      status: "sent",
    });

    console.log("Connection request email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending connection request email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
