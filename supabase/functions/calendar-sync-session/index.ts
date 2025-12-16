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

    const { sessionId } = await req.json();
    console.log("Syncing session to calendar:", sessionId);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles!coaching_sessions_coach_id_fkey(id, display_name, user_id),
        client:client_profiles!coaching_sessions_client_id_fkey(id, first_name, last_name, user_id)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) throw new Error("Session not found");

    // Try to sync to both coach and client calendars
    const results = [];

    // Sync to coach's calendar
    const { data: coachCalendar } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", session.coach.user_id)
      .eq("sync_enabled", true)
      .single();

    if (coachCalendar) {
      const result = await createCalendarEvent(
        coachCalendar,
        session,
        `Session with ${session.client.first_name} ${session.client.last_name}`
      );
      results.push({ role: "coach", ...result });
    }

    // Sync to client's calendar
    const { data: clientCalendar } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", session.client.user_id)
      .eq("sync_enabled", true)
      .single();

    if (clientCalendar) {
      const result = await createCalendarEvent(
        clientCalendar,
        session,
        `Coaching Session with ${session.coach.display_name}`
      );
      results.push({ role: "client", ...result });
    }

    // Store the external calendar event ID if we got one
    if (results.length > 0 && results[0].eventId) {
      await supabase
        .from("coaching_sessions")
        .update({ external_calendar_event_id: results[0].eventId })
        .eq("id", sessionId);
    }

    console.log("Calendar sync results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in calendar-sync-session:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createCalendarEvent(
  calendarConnection: any,
  session: any,
  title: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const sessionDate = new Date(session.scheduled_at);
    const endDate = new Date(sessionDate.getTime() + session.duration_minutes * 60000);

    switch (calendarConnection.provider) {
      case "google_calendar":
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarConnection.calendar_id}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${calendarConnection.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: title,
              description: session.notes || "Coaching session",
              start: {
                dateTime: sessionDate.toISOString(),
                timeZone: "UTC",
              },
              end: {
                dateTime: endDate.toISOString(),
                timeZone: "UTC",
              },
              location: session.is_online
                ? session.video_meeting_url || "Online"
                : session.location,
              reminders: {
                useDefault: false,
                overrides: [
                  { method: "popup", minutes: 30 },
                  { method: "email", minutes: 60 },
                ],
              },
            }),
          }
        );

        const data = await response.json();
        if (data.error) {
          return { success: false, error: data.error.message };
        }
        return { success: true, eventId: data.id };

      default:
        return { success: false, error: "Unsupported calendar provider" };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" };
  }
}
