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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    console.log("Syncing existing sessions to calendar for user:", userId);

    // Get user's calendar connection
    const { data: calendarConnection, error: calError } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("sync_enabled", true)
      .single();

    if (calError || !calendarConnection) {
      console.log("No active calendar connection found for user:", userId);
      return new Response(
        JSON.stringify({ success: true, message: "No active calendar connection", syncedCount: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found calendar connection:", calendarConnection.provider);

    // Get all future sessions for this user (as coach or client)
    const now = new Date().toISOString();

    // First check if user is a coach
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id, display_name")
      .eq("user_id", userId)
      .single();

    // Also check if user is a client
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id, first_name, last_name")
      .eq("user_id", userId)
      .single();

    const sessions: any[] = [];

    // Get sessions where user is coach
    if (coachProfile) {
      const { data: coachSessions } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          client:client_profiles!coaching_sessions_client_id_fkey(id, first_name, last_name, user_id)
        `)
        .eq("coach_id", coachProfile.id)
        .gte("scheduled_at", now)
        .in("status", ["scheduled", "confirmed"])
        .order("scheduled_at", { ascending: true });

      if (coachSessions) {
        sessions.push(...coachSessions.map(s => ({ 
          ...s, 
          role: "coach",
          title: `Session with ${s.client?.first_name || 'Client'} ${s.client?.last_name || ''}`
        })));
      }
    }

    // Get sessions where user is client
    if (clientProfile) {
      const { data: clientSessions } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          coach:coach_profiles!coaching_sessions_coach_id_fkey(id, display_name, user_id)
        `)
        .eq("client_id", clientProfile.id)
        .gte("scheduled_at", now)
        .in("status", ["scheduled", "confirmed"])
        .order("scheduled_at", { ascending: true });

      if (clientSessions) {
        sessions.push(...clientSessions.map(s => ({ 
          ...s, 
          role: "client",
          title: `Coaching Session with ${s.coach?.display_name || 'Coach'}`
        })));
      }
    }

    console.log(`Found ${sessions.length} future sessions to sync`);

    if (sessions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No future sessions to sync", syncedCount: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync each session
    const results = [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const session of sessions) {
      try {
        const result = await createCalendarEvent(calendarConnection, session, session.title);
        results.push({ sessionId: session.id, ...result });
        
        if (result.success) {
          syncedCount++;
          // Update session with external calendar event ID
          if (result.eventId) {
            await supabase
              .from("coaching_sessions")
              .update({ external_calendar_event_id: result.eventId })
              .eq("id", session.id);
          }
        } else {
          failedCount++;
        }
      } catch (err: any) {
        console.error(`Failed to sync session ${session.id}:`, err);
        results.push({ sessionId: session.id, success: false, error: err?.message });
        failedCount++;
      }
    }

    console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        syncedCount, 
        failedCount,
        totalSessions: sessions.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in calendar-sync-existing-sessions:", error);
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

      case "apple_calendar":
        return await createCalDAVEvent(calendarConnection, session, title, sessionDate, endDate);

      default:
        return { success: false, error: "Unsupported calendar provider" };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" };
  }
}

async function createCalDAVEvent(
  connection: any,
  session: any,
  title: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const credentials = JSON.parse(atob(connection.access_token));
    const authString = btoa(`${credentials.email}:${credentials.password}`);

    const eventUid = `fitconnect-${session.id}@getfitconnect.co.uk`;
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const icalEvent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FitConnect//Coaching Session//EN
BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${session.session_type || 'Coaching'} session${session.is_online ? " (Online)" : ""}${session.notes ? `\\nNotes: ${session.notes}` : ""}
LOCATION:${session.is_online ? (session.video_meeting_url || "Online") : (session.location || "TBD")}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const caldavUrl = connection.caldav_server_url || "https://caldav.icloud.com";
    const calendarPath = `${caldavUrl}/${credentials.email.split('@')[0]}/calendars/home/`;
    const eventPath = `${calendarPath}${eventUid}.ics`;

    const putResponse = await fetch(eventPath, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "text/calendar; charset=utf-8",
      },
      body: icalEvent,
    });

    console.log(`CalDAV PUT response for session ${session.id}: ${putResponse.status}`);

    if (!putResponse.ok && putResponse.status !== 201 && putResponse.status !== 204) {
      const errorText = await putResponse.text();
      console.error("CalDAV PUT error:", errorText);
      return { success: false, error: `Failed to sync event: ${putResponse.statusText}` };
    }

    return { success: true, eventId: eventUid };
  } catch (error: any) {
    console.error("CalDAV event creation error:", error);
    return { success: false, error: error?.message || "CalDAV sync failed" };
  }
}
