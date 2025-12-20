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

interface ReviewRequestEmailRequest {
  sessionId: string;
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
    const { sessionId }: ReviewRequestEmailRequest = await req.json();

    console.log(`Sending review request for session ${sessionId}`);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles(id, user_id, display_name, profile_image_url, selected_avatar_id),
        client:client_profiles(user_id, first_name)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (existingReview) {
      console.log("Review already exists for this session");
      return new Response(JSON.stringify({ skipped: true, reason: "Review exists" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { colors } = EMAIL_CONFIG;

    // Get client email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const clientUser = users?.find(u => u.id === session.client.user_id);

    if (!clientUser?.email) {
      throw new Error("Client email not found");
    }

    // Check email preferences - skip if user has disabled booking emails
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_bookings")
      .eq("user_id", session.client.user_id)
      .single();

    if (prefs && prefs.email_bookings === false) {
      console.log("User has disabled booking email notifications");
      return new Response(JSON.stringify({ skipped: true, reason: "Notifications disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use default FitConnect mascot avatar
    const avatarUrl = getDefaultAvatarUrl(supabaseUrl);

    const coachName = session.coach.display_name || "Your Coach";
    const clientName = session.client.first_name || "there";

    // Format session date
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long'
    });

    const reviewUrl = `${siteUrl}/coaches/${session.coach.id}?review=true`;

    const emailContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">⭐</span>
      </div>
      
      <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
        How Was Your Session?
      </h2>
      
      <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
        Hi ${clientName}, we hope you enjoyed your session with <strong style="color: ${colors.primary}">${coachName}</strong> on ${formattedDate}!
      </p>
      
      ${squircleAvatarComponent(avatarUrl, coachName, 80)}
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: ${colors.textMuted}; margin: 0 0 16px 0;">
          Your feedback helps other clients find great coaches and helps ${coachName.split(' ')[0]} improve their services.
        </p>
        
        <!-- Star Rating Preview -->
        <div style="margin: 20px 0;">
          <span style="font-size: 32px; letter-spacing: 8px;">⭐⭐⭐⭐⭐</span>
        </div>
        
        <p style="color: ${colors.primary}; font-size: 14px; margin: 0;">
          Click to rate your experience
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        ${ctaButton("Leave a Review", reviewUrl)}
      </div>
      
      <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
        It only takes a minute and means a lot to ${coachName.split(' ')[0]}!
      </p>
    `;

    const html = baseEmailTemplate(emailContent, `How was your session with ${coachName}?`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FitConnect <support@getfitconnect.co.uk>",
        to: [clientUser.email],
        subject: `⭐ How was your session with ${coachName}?`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      throw new Error("Failed to send review request email");
    }

    // Log email
    await supabase.from("email_logs").insert({
      user_id: session.client.user_id,
      email_type: "review_request",
      recipient_email: clientUser.email,
      subject: `How was your session with ${coachName}?`,
      status: "sent",
    });

    console.log("Review request email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending review request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
