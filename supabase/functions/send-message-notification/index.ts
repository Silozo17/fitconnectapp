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

interface MessageNotificationRequest {
  messageId: string;
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
    const { messageId }: MessageNotificationRequest = await req.json();

    console.log(`Sending message notification for message ${messageId}`);

    // Get message details
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      throw new Error("Message not found");
    }

    const { colors } = EMAIL_CONFIG;

    // Determine sender and receiver types
    // Check if sender is coach
    const { data: senderCoach } = await supabase
      .from("coach_profiles")
      .select("user_id, display_name, profile_image_url, selected_avatar_id")
      .eq("id", message.sender_id)
      .single();

    // Check if sender is client
    const { data: senderClient } = await supabase
      .from("client_profiles")
      .select("user_id, first_name, last_name, avatar_url, selected_avatar_id")
      .eq("id", message.sender_id)
      .single();

    // Check if receiver is coach
    const { data: receiverCoach } = await supabase
      .from("coach_profiles")
      .select("user_id, display_name")
      .eq("id", message.receiver_id)
      .single();

    // Check if receiver is client
    const { data: receiverClient } = await supabase
      .from("client_profiles")
      .select("user_id, first_name")
      .eq("id", message.receiver_id)
      .single();

    const sender = senderCoach || senderClient;
    const receiver = receiverCoach || receiverClient;

    if (!sender || !receiver) {
      throw new Error("Sender or receiver not found");
    }

    // Get receiver email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const receiverUserId = receiverCoach?.user_id || receiverClient?.user_id;
    const receiverUser = users?.find(u => u.id === receiverUserId);

    if (!receiverUser?.email) {
      throw new Error("Receiver email not found");
    }

    // Check email preferences
    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("message_notifications")
      .eq("user_id", receiverUserId)
      .single();

    if (prefs && prefs.message_notifications === false) {
      console.log("User has disabled message notifications");
      return new Response(JSON.stringify({ skipped: true, reason: "Notifications disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sender avatar
    let senderAvatarUrl = senderCoach?.profile_image_url || senderClient?.avatar_url;
    const senderAvatarId = senderCoach?.selected_avatar_id || senderClient?.selected_avatar_id;
    if (senderAvatarId) {
      const { data: avatar } = await supabase
        .from("avatars")
        .select("name")
        .eq("id", senderAvatarId)
        .single();
      if (avatar) senderAvatarUrl = getAvatarUrl(avatar.name, supabaseUrl);
    }

    const senderName = senderCoach?.display_name || 
      [senderClient?.first_name, senderClient?.last_name].filter(Boolean).join(' ') || 
      "Someone";
    
    const receiverName = receiverCoach?.display_name || receiverClient?.first_name || "there";

    // Truncate message preview
    const messagePreview = message.content.length > 150 
      ? message.content.substring(0, 150) + '...' 
      : message.content;

    const dashboardUrl = receiverCoach 
      ? `${siteUrl}/dashboard/coach/messages`
      : `${siteUrl}/dashboard/client/messages`;

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">💬</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        New Message
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${receiverName}, you have a new message from <strong style="color: ${colors.primary}">${senderName}</strong>
      </p>
      
      ${profileImageWithGlow(senderAvatarUrl, senderName, 64)}
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 3px solid ${colors.primary};">
        <p style="color: ${colors.text}; margin: 0; line-height: 1.6; font-size: 15px;">
          "${messagePreview}"
        </p>
        <p style="color: ${colors.textMuted}; margin: 12px 0 0 0; font-size: 13px;">
          — ${senderName}
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("Reply Now", dashboardUrl)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center;">
        You can manage your email preferences in your account settings.
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `New message from ${senderName}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [receiverUser.email],
        subject: `💬 New message from ${senderName}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send message notification");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: receiverUserId,
      email_type: "message_notification",
      recipient_email: receiverUser.email,
      subject: `New message from ${senderName}`,
      status: "sent",
    });

    console.log("Message notification email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending message notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
