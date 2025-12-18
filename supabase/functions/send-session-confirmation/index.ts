import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SessionConfirmationRequest {
  externalClientId: string;
  sessionDate: string;
  duration: number;
  isOnline: boolean;
  location?: string;
  sessionType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { externalClientId, sessionDate, duration, isOnline, location, sessionType }: SessionConfirmationRequest = await req.json();

    console.log("Sending session confirmation to external client:", externalClientId);

    // Get the external client details
    const { data: externalClient, error: clientError } = await supabaseClient
      .from("external_session_clients")
      .select("name, email, coach_id")
      .eq("id", externalClientId)
      .single();

    if (clientError || !externalClient) {
      console.error("Failed to fetch external client:", clientError);
      throw new Error("External client not found");
    }

    // Get coach details
    const { data: coach, error: coachError } = await supabaseClient
      .from("coach_profiles")
      .select("display_name, user_id")
      .eq("id", externalClient.coach_id)
      .single();

    if (coachError) {
      console.error("Failed to fetch coach:", coachError);
    }

    // Get coach email from auth.users
    let coachEmail = "";
    if (coach?.user_id) {
      const { data: userData } = await supabaseClient.auth.admin.getUserById(coach.user_id);
      coachEmail = userData?.user?.email || "";
    }

    // Format the session date
    const date = new Date(sessionDate);
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const coachName = coach?.display_name || "Your Coach";

    // Send confirmation email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FitConnect <onboarding@resend.dev>",
        to: [externalClient.email],
        subject: `Session Confirmed with ${coachName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .session-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
              .detail-row { display: flex; margin: 10px 0; }
              .detail-label { font-weight: 600; width: 100px; color: #6b7280; }
              .detail-value { color: #111827; }
              .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Session Confirmed! ✓</h1>
              </div>
              <div class="content">
                <p>Hi ${externalClient.name},</p>
                <p>Your session with <strong>${coachName}</strong> has been confirmed.</p>
                
                <div class="session-card">
                  <h3 style="margin-top: 0; color: #6366f1;">Session Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">📅 Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🕐 Time:</span>
                    <span class="detail-value">${formattedTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">⏱️ Duration:</span>
                    <span class="detail-value">${duration} minutes</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">📍 Format:</span>
                    <span class="detail-value">${isOnline ? "Online (Video Call)" : `In-Person${location ? ` - ${location}` : ""}`}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">🏋️ Type:</span>
                    <span class="detail-value">${sessionType}</span>
                  </div>
                </div>
                
                ${isOnline ? `
                <p>You will receive a video call link before the session. Please ensure you have a stable internet connection and a quiet space for your session.</p>
                ` : `
                <p>Please arrive 5-10 minutes early to your session location.</p>
                `}
                
                <p>If you need to reschedule or cancel, please contact your coach directly${coachEmail ? ` at <a href="mailto:${coachEmail}">${coachEmail}</a>` : ""}.</p>
                
                <p>See you soon!</p>
              </div>
              <div class="footer">
                <p>This email was sent by FitConnect on behalf of ${coachName}.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Confirmation email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-session-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
