import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  squircleAvatarComponent,
  infoCard,
  getDefaultAvatarUrl,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewClientEmailRequest {
  coachId: string;
  clientId: string;
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
    const { coachId, clientId }: NewClientEmailRequest = await req.json();

    console.log(`Sending new client notification to coach ${coachId}`);

    // Get coach details
    const { data: coach, error: coachError } = await supabase
      .from("coach_profiles")
      .select("user_id, display_name, selected_avatar_id")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      throw new Error("Coach not found");
    }

    // Get coach email
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    const coachUser = users?.find(u => u.id === coach.user_id);
    
    if (!coachUser?.email) {
      throw new Error("Coach email not found");
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from("client_profiles")
      .select("first_name, last_name, avatar_url, fitness_goals, location, selected_avatar_id")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new Error("Client not found");
    }

    const clientName = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'New Client';
    const { colors } = EMAIL_CONFIG;

    // Use default FitConnect mascot avatar
    const avatarUrl = getDefaultAvatarUrl(supabaseUrl);

    const goalsText = client.fitness_goals?.length 
      ? client.fitness_goals.join(', ')
      : 'Not specified';

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        New Client Added!
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Great news! <strong style="color: ${colors.primary}">${clientName}</strong> is now your client.
      </p>
      
      ${squircleAvatarComponent(avatarUrl, clientName, 80)}
      
      ${infoCard("Client Details", [
        { label: "Name", value: clientName },
        { label: "Location", value: client.location || "Not specified" },
        { label: "Goals", value: goalsText },
      ])}
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("View Client Profile", `${siteUrl}/dashboard/coach/clients/${clientId}`)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        Start by reviewing their profile and sending a welcome message!
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `New client: ${clientName}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [coachUser.email],
        subject: `🎉 New Client: ${clientName}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send new client email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: coach.user_id,
      email_type: "new_client",
      recipient_email: coachUser.email,
      subject: `New Client: ${clientName}`,
      status: "sent",
    });

    console.log("New client email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending new client email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
