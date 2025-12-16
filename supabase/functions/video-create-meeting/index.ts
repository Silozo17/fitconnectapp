import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    let meetingUrl: string;
    let meetingId: string;

    const sessionDate = new Date(session.scheduled_at);
    const clientName = `${session.client.first_name} ${session.client.last_name}`;
    const topic = `Coaching Session with ${clientName}`;

    switch (provider) {
      case "zoom":
        const zoomResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${videoSettings.access_token}`,
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
        if (zoomData.code) throw new Error(zoomData.message);
        meetingUrl = zoomData.join_url;
        meetingId = zoomData.id.toString();
        break;

      case "google_meet":
        // Create Google Calendar event with Meet link
        const calendarResponse = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${videoSettings.access_token}`,
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
        if (calendarData.error) throw new Error(calendarData.error.message);
        meetingUrl = calendarData.hangoutLink;
        meetingId = calendarData.conferenceData?.conferenceId || calendarData.id;
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
