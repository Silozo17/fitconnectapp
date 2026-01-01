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
    // Messages store profile_id values (coach_profiles.id or client_profiles.id)
    // Check if sender is coach (by profile id)
    const { data: senderCoach } = await supabase
      .from("coach_profiles")
      .select("id, user_id, display_name, profile_image_url, selected_avatar_id")
      .eq("id", message.sender_id)
      .single();

    // Check if sender is client (by profile id)
    const { data: senderClient } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name, last_name, avatar_url, selected_avatar_id")
      .eq("id", message.sender_id)
      .single();

    // Check if receiver is coach (by profile id)
    const { data: receiverCoach } = await supabase
      .from("coach_profiles")
      .select("id, user_id, display_name")
      .eq("id", message.receiver_id)
      .single();

    // Check if receiver is client (by profile id)
    const { data: receiverClient } = await supabase
      .from("client_profiles")
      .select("id, user_id, first_name")
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

    // Truncate message preview (needed for both push and email)
    const messagePreview = message.content.length > 150 
      ? message.content.substring(0, 150) + '...' 
      : message.content;

    const senderName = senderCoach?.display_name || 
      [senderClient?.first_name, senderClient?.last_name].filter(Boolean).join(' ') || 
      "Someone";

    // SEND PUSH NOTIFICATION FIRST (before email preference check)
    // This ensures push is sent regardless of email preferences
    let pushSent = false;
    try {
      console.log("[Push] Sending push notification to user:", receiverUserId);
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [receiverUserId],
          title: "New Message",
          subtitle: senderName,
          message: messagePreview,
          preferenceKey: "push_messages",
          data: { type: "message", senderId: message.sender_id, messageId },
        }),
      });
      
      const pushResult = await pushResponse.json();
      console.log("[Push] Push notification result:", JSON.stringify(pushResult));
      pushSent = pushResponse.ok;
    } catch (pushError) {
      console.error("[Push] Push notification failed (non-blocking):", pushError);
    }

    // Check email preferences - only skip EMAIL, not the whole function
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_messages")
      .eq("user_id", receiverUserId)
      .single();

    if (prefs && prefs.email_messages === false) {
      console.log("User has disabled message email notifications - email skipped, push already sent");
      return new Response(JSON.stringify({ 
        success: true, 
        emailSkipped: true,
        pushSent 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use contextual avatar for messages
    const avatarUrl = getEmailAvatarUrl('message', supabaseUrl);
    
    const receiverName = receiverCoach?.display_name || receiverClient?.first_name || "there";

    const dashboardUrl = receiverCoach 
      ? `${siteUrl}/dashboard/coach/messages`
      : `${siteUrl}/dashboard/client/messages`;
    const emailContent = `
      ${freeFloatingAvatarComponent(avatarUrl, "Message Mascot", 140)}
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        New Message
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${receiverName}, you have a new message from <strong style="color: ${colors.primary}">${senderName}</strong>
      </p>
      
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

    return new Response(JSON.stringify({ success: true, pushSent }), {
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