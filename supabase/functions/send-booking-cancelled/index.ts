import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  infoCard,
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingCancelledRequest {
  sessionId: string;
  cancelledBy: 'coach' | 'client';
  reason?: string;
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
    const { sessionId, cancelledBy, reason }: BookingCancelledRequest = await req.json();

    console.log(`Sending booking cancelled email for session ${sessionId}`);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles(user_id, display_name),
        client:client_profiles(user_id, first_name, last_name)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    const { colors } = EMAIL_CONFIG;

    // Get user emails
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const coachUser = users?.find(u => u.id === session.coach.user_id);
    const clientUser = users?.find(u => u.id === session.client.user_id);

    const coachName = session.coach.display_name || "Your Coach";
    const clientName = [session.client.first_name, session.client.last_name].filter(Boolean).join(' ') || "Your Client";

    // Format date/time
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
    const formattedTime = sessionDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Email to the OTHER party (not the one who cancelled)
    const recipientIsClient = cancelledBy === 'coach';
    const recipientUser = recipientIsClient ? clientUser : coachUser;
    const recipientName = recipientIsClient ? (session.client.first_name || 'there') : coachName;
    const cancellerName = cancelledBy === 'coach' ? coachName : clientName;

    if (recipientUser?.email) {
      const emailContent = `
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">😔</span>
        </div>
        
        <h2 class="headline" style="color: ${colors.text}; margin: 0 0 16px 0; text-align: center; font-size: 24px;">
          Session Cancelled
        </h2>
        
        <p style="color: ${colors.textMuted}; line-height: 1.7; text-align: center; margin-bottom: 24px;">
          Hi ${recipientName}, unfortunately your session with <strong style="color: ${colors.primary}">${cancellerName}</strong> has been cancelled.
        </p>
        
        ${infoCard("Cancelled Session", [
          { label: "Date", value: formattedDate },
          { label: "Time", value: formattedTime },
          { label: "Duration", value: `${session.duration_minutes} minutes` },
          { label: "Type", value: session.session_type || "Training Session" },
        ])}
        
        ${reason ? `
          <div style="background: rgba(255, 165, 0, 0.1); border-left: 3px solid #FFA500; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
              <strong style="color: #FFA500;">Reason:</strong> ${reason}
            </p>
          </div>
        ` : ''}
        
        ${session.amount_paid && session.amount_paid > 0 ? `
          <div style="background: rgba(190, 255, 0, 0.1); border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="color: ${colors.textMuted}; margin: 0; font-size: 14px;">
              <strong style="color: ${colors.primary};">Refund Information</strong><br>
              If you've already paid, a refund will be processed within 5-10 business days.
            </p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 32px 0;">
          ${recipientIsClient 
            ? ctaButton("Find Another Session", `${siteUrl}/coaches`)
            : ctaButton("View Schedule", `${siteUrl}/dashboard/coach/schedule`)
          }
        </div>
        
        <p style="color: ${colors.textDark}; font-size: 14px; text-align: center;">
          We're sorry for any inconvenience. If you have questions, please contact support.
        </p>
      `;

      const html = baseEmailTemplate(emailContent, `Your session on ${formattedDate} has been cancelled`);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FitConnect <bookings@resend.dev>",
          to: [recipientUser.email],
          subject: `😔 Session Cancelled - ${formattedDate}`,
          html,
        }),
      });

      // Log email
      await supabase.from("email_logs").insert({
        user_id: recipientIsClient ? session.client.user_id : session.coach.user_id,
        email_type: "booking_cancelled",
        recipient_email: recipientUser.email,
        subject: `Session Cancelled - ${formattedDate}`,
        status: "sent",
      });
    }

    console.log("Booking cancelled email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending booking cancelled email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
