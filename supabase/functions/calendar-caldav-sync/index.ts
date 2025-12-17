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
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUser = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { sessionId, action = "create" } = await req.json();
    
    console.log(`CalDAV sync for session: ${sessionId}, action: ${action}, user: ${user.id}`);

    // Get user's Apple Calendar connection
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: connection, error: connError } = await supabaseAdmin
      .from("calendar_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "apple_calendar")
      .eq("connection_type", "caldav")
      .single();

    if (connError || !connection) {
      throw new Error("No Apple Calendar connection found");
    }

    if (!connection.sync_enabled) {
      throw new Error("Calendar sync is disabled");
    }

    // Get session details
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("coaching_sessions")
      .select(`
        *,
        coach:coach_profiles!coaching_sessions_coach_id_fkey(display_name),
        client:client_profiles!coaching_sessions_client_id_fkey(first_name, last_name)
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Decrypt credentials
    const credentials = JSON.parse(atob(connection.access_token));
    const authString = btoa(`${credentials.email}:${credentials.password}`);

    // Create iCalendar event
    const eventUid = `fitconnect-${sessionId}@getfitconnect.co.uk`;
    const startDate = new Date(session.scheduled_at);
    const endDate = new Date(startDate.getTime() + session.duration_minutes * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const coachName = session.coach?.display_name || "Your Coach";
    const clientName = session.client ? `${session.client.first_name} ${session.client.last_name}` : "Client";
    
    const icalEvent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FitConnect//Coaching Session//EN
BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Coaching Session with ${coachName}
DESCRIPTION:${session.session_type} session${session.is_online ? " (Online)" : ""}${session.notes ? `\\nNotes: ${session.notes}` : ""}
LOCATION:${session.is_online ? (session.video_meeting_url || "Online") : (session.location || "TBD")}
STATUS:${session.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}
END:VEVENT
END:VCALENDAR`;

    // Find user's calendar URL
    const caldavUrl = connection.caldav_server_url || "https://caldav.icloud.com";
    
    // First, discover the calendar home
    const propfindResponse = await fetch(`${caldavUrl}/`, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/xml",
        "Depth": "0",
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
          <d:prop>
            <d:current-user-principal/>
          </d:prop>
        </d:propfind>`,
    });

    if (!propfindResponse.ok && propfindResponse.status !== 207) {
      console.error("Failed to discover calendar:", propfindResponse.status);
      throw new Error("Failed to connect to iCloud Calendar");
    }

    // For simplicity, use the default calendar path pattern for iCloud
    // In production, you'd parse the PROPFIND response to get the actual calendar URL
    const calendarPath = `${caldavUrl}/${credentials.email.split('@')[0]}/calendars/home/`;
    const eventPath = `${calendarPath}${eventUid}.ics`;

    if (action === "delete") {
      // Delete the event
      const deleteResponse = await fetch(eventPath, {
        method: "DELETE",
        headers: {
          "Authorization": `Basic ${authString}`,
        },
      });

      console.log(`CalDAV delete response: ${deleteResponse.status}`);
    } else {
      // Create or update the event using PUT
      const putResponse = await fetch(eventPath, {
        method: "PUT",
        headers: {
          "Authorization": `Basic ${authString}`,
          "Content-Type": "text/calendar; charset=utf-8",
          "If-None-Match": action === "create" ? "*" : undefined,
        } as HeadersInit,
        body: icalEvent,
      });

      console.log(`CalDAV PUT response: ${putResponse.status}`);

      if (!putResponse.ok && putResponse.status !== 201 && putResponse.status !== 204) {
        const errorText = await putResponse.text();
        console.error("CalDAV PUT error:", errorText);
        throw new Error(`Failed to sync event: ${putResponse.statusText}`);
      }
    }

    // Update session with external calendar event ID
    await supabaseAdmin
      .from("coaching_sessions")
      .update({ external_calendar_event_id: eventUid })
      .eq("id", sessionId);

    return new Response(
      JSON.stringify({ success: true, message: `Event ${action}d in Apple Calendar` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in calendar-caldav-sync:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
