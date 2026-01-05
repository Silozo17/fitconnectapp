import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Helper function to refresh Zoom token
async function refreshZoomToken(videoSettings: any, supabase: any) {
  const ZOOM_CLIENT_ID = Deno.env.get("ZOOM_CLIENT_ID");
  const ZOOM_CLIENT_SECRET = Deno.env.get("ZOOM_CLIENT_SECRET");

  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error("Zoom credentials not configured");
  }

  console.log("Refreshing Zoom access token...");

  const refreshResponse = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      refresh_token: videoSettings.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshResponse.ok) {
    const errorData = await refreshResponse.text();
    console.error("Zoom token refresh failed:", errorData);
    throw new Error("Token refresh failed - please reconnect Zoom");
  }

  const tokenData = await refreshResponse.json();
  console.log("Zoom token refreshed successfully");

  // Update stored token
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  await supabase
    .from("video_conference_settings")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || videoSettings.refresh_token,
      token_expires_at: expiresAt,
    })
    .eq("id", videoSettings.id);

  return tokenData.access_token;
}

// Helper function to refresh Google token
async function refreshGoogleToken(videoSettings: any, supabase: any) {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google credentials not configured");
  }

  console.log("Refreshing Google access token...");

  const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: videoSettings.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshResponse.ok) {
    const errorData = await refreshResponse.text();
    console.error("Google token refresh failed:", errorData);
    throw new Error("Token refresh failed - please reconnect Google Meet");
  }

  const tokenData = await refreshResponse.json();
  console.log("Google token refreshed successfully");

  // Update stored token (Google doesn't always return new refresh token)
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
  await supabase
    .from("video_conference_settings")
    .update({
      access_token: tokenData.access_token,
      token_expires_at: expiresAt,
    })
    .eq("id", videoSettings.id);

  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { sessionId, provider } = await req.json();
    console.log("Creating meeting for session:", sessionId, "provider:", provider);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles!coaching_sessions_coach_id_fkey(id, display_name, user_id),
        client:client_profiles!coaching_sessions_client_id_fkey(id, first_name, last_name)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) throw new Error("Session not found");

    // Get coach video settings
    const { data: videoSettings } = await supabase
      .from("video_conference_settings")
      .select("*")
      .eq("coach_id", session.coach_id)
      .eq("provider", provider)
      .eq("is_active", true)
      .single();

    if (!videoSettings) throw new Error("Video provider not connected");

    // Check if token needs refresh
    let accessToken = videoSettings.access_token;
    const tokenExpiry = videoSettings.token_expires_at 
      ? new Date(videoSettings.token_expires_at) 
      : null;
    
    // Refresh token if it's expired or will expire in the next 5 minutes
    const tokenNeedsRefresh = tokenExpiry && 
      (tokenExpiry.getTime() - Date.now()) < 5 * 60 * 1000;

    if (tokenNeedsRefresh && videoSettings.refresh_token) {
      console.log("Token expired or expiring soon, refreshing...");
      try {
        if (provider === "zoom") {
          accessToken = await refreshZoomToken(videoSettings, supabase);
        } else if (provider === "google_meet") {
          accessToken = await refreshGoogleToken(videoSettings, supabase);
        }
      } catch (refreshError: any) {
        console.error("Token refresh failed:", refreshError);
        throw new Error(`${refreshError.message}. Please reconnect your ${provider === "zoom" ? "Zoom" : "Google Meet"} account.`);
      }
    }

    let meetingUrl: string;
    let meetingId: string;

    const sessionDate = new Date(session.scheduled_at);
    const clientName = session.client 
      ? `${session.client.first_name} ${session.client.last_name}`
      : "Client";
    const topic = `Coaching Session with ${clientName}`;

    switch (provider) {
      case "zoom":
        console.log("Creating Zoom meeting...");
        const zoomResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            type: 2, // Scheduled meeting
            start_time: sessionDate.toISOString(),
            duration: session.duration_minutes,
            timezone: "UTC",
            settings: {
              host_video: true,
              participant_video: true,
              join_before_host: false,
              waiting_room: true,
            },
          }),
        });

        const zoomData = await zoomResponse.json();
        console.log("Zoom API response status:", zoomResponse.status);
        
        if (!zoomResponse.ok || zoomData.code) {
          console.error("Zoom API error:", zoomData);
          throw new Error(zoomData.message || "Failed to create Zoom meeting");
        }
        
        meetingUrl = zoomData.join_url;
        meetingId = zoomData.id.toString();
        console.log("Zoom meeting created:", meetingId);
        break;

      case "google_meet":
        console.log("Creating Google Meet...");
        // Create Google Calendar event with Meet link
        const calendarResponse = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: topic,
              start: {
                dateTime: sessionDate.toISOString(),
                timeZone: "UTC",
              },
              end: {
                dateTime: new Date(sessionDate.getTime() + session.duration_minutes * 60000).toISOString(),
                timeZone: "UTC",
              },
              conferenceData: {
                createRequest: {
                  requestId: sessionId,
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              },
            }),
          }
        );

        const calendarData = await calendarResponse.json();
        console.log("Google Calendar API response status:", calendarResponse.status);
        
        if (!calendarResponse.ok || calendarData.error) {
          console.error("Google Calendar API error:", calendarData);
          throw new Error(calendarData.error?.message || "Failed to create Google Meet");
        }
        
        meetingUrl = calendarData.hangoutLink;
        meetingId = calendarData.conferenceData?.conferenceId || calendarData.id;
        console.log("Google Meet created:", meetingId);
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Update session with meeting details
    await supabase
      .from("coaching_sessions")
      .update({
        video_meeting_url: meetingUrl,
        video_meeting_id: meetingId,
        video_provider: provider,
      })
      .eq("id", sessionId);

    console.log("Meeting created successfully:", meetingUrl);

    return new Response(
      JSON.stringify({ meetingUrl, meetingId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in video-create-meeting:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
