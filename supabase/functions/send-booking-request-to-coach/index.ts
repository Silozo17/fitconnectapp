import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequestToCoachRequest {
  bookingRequestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { bookingRequestId }: BookingRequestToCoachRequest = await req.json();

    // Fetch booking request with coach and client details
    const { data: booking, error: bookingError } = await supabase
      .from("booking_requests")
      .select(`
        *,
        coach:coach_profiles!booking_requests_coach_id_fkey(
          id,
          user_id,
          first_name,
          last_name,
          display_name,
          username
        ),
        client:client_profiles!booking_requests_client_id_fkey(
          id,
          first_name,
          last_name
        ),
        session_type:session_types(name, duration_minutes, price, currency)
      `)
      .eq("id", bookingRequestId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking request not found:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coach = booking.coach;
    const client = booking.client;
    const sessionType = booking.session_type;

    if (!coach?.user_id) {
      console.error("Coach user_id not found");
      return new Response(
        JSON.stringify({ error: "Coach not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get coach's email
    const { data: userData } = await supabase.auth.admin.getUserById(coach.user_id);
    const coachEmail = userData?.user?.email;

    const clientName = [client?.first_name, client?.last_name].filter(Boolean).join(" ") || "A client";
    const sessionTypeName = sessionType?.name || "General Session";
    const requestedDate = new Date(booking.requested_at);
    const formattedDate = requestedDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = requestedDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send push notification to coach
    try {
      await supabase.functions.invoke("send-push-notification", {
        body: {
          userIds: [coach.user_id],
          title: "New Booking Request",
          message: `${clientName} has requested a ${sessionTypeName} on ${formattedDate} at ${formattedTime}`,
          data: {
            type: "booking_request",
            bookingRequestId,
          },
        },
      });
      console.log("Push notification sent to coach");
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError);
    }

    // Check coach's email notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_bookings")
      .eq("user_id", coach.user_id)
      .single();

    const emailEnabled = prefs?.email_bookings !== false;

    if (!emailEnabled || !coachEmail) {
      console.log("Email notifications disabled or no email found");
      return new Response(
        JSON.stringify({ success: true, emailSent: false, pushSent: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: true, emailSent: false, pushSent: true, error: "Email not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const coachName = coach.display_name || coach.first_name || coach.username || "Coach";
    const appUrl = Deno.env.get("APP_URL") || "https://fitconnectapp.lovable.app";

    const sessionDetails = booking.is_online ? "Online Session" : "In-Person Session";
    const duration = booking.duration_minutes || sessionType?.duration_minutes || 60;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Request</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📅 New Booking Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${coachName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${clientName}</strong> has requested to book a session with you.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #10b981;">Session Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Session Type:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${sessionTypeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${formattedTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${duration} minutes</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Location:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${sessionDetails}</td>
                </tr>
              </table>
              ${booking.message ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0 0 5px 0;">Client's Message:</p>
                <p style="margin: 0; font-style: italic;">"${booking.message}"</p>
              </div>
              ` : ""}
            </div>
            
            <div style="text-align: center;">
              <a href="${appUrl}/coach/schedule" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
                View & Respond to Request
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 25px; text-align: center;">
              Please respond to this request as soon as possible.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            This email was sent by FitConnect. You can manage your notification preferences in your account settings.
          </p>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "FitConnect <notifications@fitconnect.app>",
      to: [coachEmail],
      subject: `New Booking Request from ${clientName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: coachEmail,
      email_type: "booking_request_to_coach",
      status: "sent",
      metadata: { bookingRequestId, clientName },
    });

    return new Response(
      JSON.stringify({ success: true, emailSent: true, pushSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-booking-request-to-coach:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
