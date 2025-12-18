import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Parse iCalendar VEVENT into structured data
function parseVEvent(veventBlock: string): {
  uid: string;
  summary: string;
  dtstart: Date | null;
  dtend: Date | null;
  isAllDay: boolean;
} | null {
  const getProperty = (name: string): string | null => {
    const regex = new RegExp(`^${name}[;:](.*)$`, 'im');
    const match = veventBlock.match(regex);
    return match ? match[1].trim() : null;
  };

  const uid = getProperty('UID');
  const summary = getProperty('SUMMARY') || 'Busy';
  
  if (!uid) return null;

  // Parse date/time (handles both DATE and DATE-TIME formats)
  const parseDT = (propName: string): { date: Date | null; isAllDay: boolean } => {
    const regex = new RegExp(`^${propName}[;:](.*)$`, 'im');
    const match = veventBlock.match(regex);
    if (!match) return { date: null, isAllDay: false };
    
    const value = match[1];
    const hasValueDate = value.includes('VALUE=DATE');
    const hasNoTimeComponent = !value.includes('T') && /\d{8}/.test(value);
    const isAllDay = hasValueDate || hasNoTimeComponent;
    
    // Extract the actual date string
    const dateMatch = value.match(/(\d{8}(T\d{6}Z?)?)/);
    if (!dateMatch) return { date: null, isAllDay: isAllDay };
    
    const dateStr = dateMatch[1];
    
    try {
      if (isAllDay || dateStr.length === 8) {
        // All-day event: YYYYMMDD
        const year = parseInt(dateStr.slice(0, 4));
        const month = parseInt(dateStr.slice(4, 6)) - 1;
        const day = parseInt(dateStr.slice(6, 8));
        return { date: new Date(Date.UTC(year, month, day)), isAllDay: true };
      } else {
        // Date-time: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
        const year = parseInt(dateStr.slice(0, 4));
        const month = parseInt(dateStr.slice(4, 6)) - 1;
        const day = parseInt(dateStr.slice(6, 8));
        const hour = parseInt(dateStr.slice(9, 11));
        const minute = parseInt(dateStr.slice(11, 13));
        const second = parseInt(dateStr.slice(13, 15));
        return { date: new Date(Date.UTC(year, month, day, hour, minute, second)), isAllDay: false };
      }
    } catch {
      return { date: null, isAllDay: false };
    }
  };

  const start = parseDT('DTSTART');
  const end = parseDT('DTEND');

  if (!start.date) return null;

  // If no end time, assume 1 hour for timed events or 1 day for all-day
  let endDate = end.date;
  if (!endDate) {
    if (start.isAllDay) {
      endDate = new Date(start.date.getTime() + 24 * 60 * 60 * 1000);
    } else {
      endDate = new Date(start.date.getTime() + 60 * 60 * 1000);
    }
  }

  return {
    uid,
    summary,
    dtstart: start.date,
    dtend: endDate,
    isAllDay: start.isAllDay,
  };
}

// Parse full iCalendar response
function parseICalendar(icalData: string): Array<{
  uid: string;
  summary: string;
  dtstart: Date;
  dtend: Date;
  isAllDay: boolean;
}> {
  const events: Array<{
    uid: string;
    summary: string;
    dtstart: Date;
    dtend: Date;
    isAllDay: boolean;
  }> = [];

  // Split by VEVENT blocks
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match;
  
  while ((match = veventRegex.exec(icalData)) !== null) {
    const parsed = parseVEvent(match[1]);
    if (parsed && parsed.dtstart && parsed.dtend) {
      events.push({
        uid: parsed.uid,
        summary: parsed.summary,
        dtstart: parsed.dtstart,
        dtend: parsed.dtend,
        isAllDay: parsed.isAllDay,
      });
    }
  }

  return events;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let userId: string | null = null;

    // If called with auth header, use that user. Otherwise, process all connections (cron job)
    if (authHeader) {
      const supabaseUser = createClient(
        SUPABASE_URL,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) throw new Error("Unauthorized");
      userId = user.id;
    }

    const body = await req.json().catch(() => ({}));
    const { connectionId } = body;

    // Build query for calendar connections
    let connectionsQuery = supabaseAdmin
      .from("calendar_connections")
      .select("*")
      .eq("provider", "apple_calendar")
      .eq("connection_type", "caldav")
      .eq("sync_enabled", true);

    if (userId) {
      connectionsQuery = connectionsQuery.eq("user_id", userId);
    }
    if (connectionId) {
      connectionsQuery = connectionsQuery.eq("id", connectionId);
    }

    const { data: connections, error: connError } = await connectionsQuery;

    if (connError) throw connError;
    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No connections to sync", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${connections.length} CalDAV connections for inbound sync`);

    let totalEvents = 0;

    for (const connection of connections) {
      try {
        // Decrypt credentials
        const credentials = JSON.parse(atob(connection.access_token));
        const authString = btoa(`${credentials.email}:${credentials.password}`);

        // Calculate date range (past week to 3 months ahead)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        // Build the calendar path
        const caldavUrl = connection.caldav_server_url || "https://caldav.icloud.com";
        const calendarPath = `${caldavUrl}/${credentials.email.split('@')[0]}/calendars/home/`;

        // Fetch events using REPORT method with CalDAV query
        const reportBody = `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${formatDate(startDate)}" end="${formatDate(endDate)}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

        const reportResponse = await fetch(calendarPath, {
          method: "REPORT",
          headers: {
            "Authorization": `Basic ${authString}`,
            "Content-Type": "application/xml",
            "Depth": "1",
          },
          body: reportBody,
        });

        if (!reportResponse.ok && reportResponse.status !== 207) {
          console.error(`CalDAV REPORT failed for connection ${connection.id}: ${reportResponse.status}`);
          continue;
        }

        const responseText = await reportResponse.text();
        const events = parseICalendar(responseText);

        console.log(`Found ${events.length} events for connection ${connection.id}`);

        // Filter out FitConnect-created events
        const externalEvents = events.filter(e => !e.uid.includes('fitconnect-'));

        // Upsert events to database
        for (const event of externalEvents) {
          const { error: upsertError } = await supabaseAdmin
            .from("external_calendar_events")
            .upsert({
              user_id: connection.user_id,
              calendar_connection_id: connection.id,
              external_event_id: event.uid,
              title: event.summary,
              start_time: event.dtstart.toISOString(),
              end_time: event.dtend.toISOString(),
              is_all_day: event.isAllDay,
              source: "apple_calendar",
              last_synced_at: new Date().toISOString(),
            }, { onConflict: "calendar_connection_id,external_event_id" });

          if (upsertError) {
            console.error(`Error upserting event ${event.uid}:`, upsertError);
          } else {
            totalEvents++;
          }
        }

        // Update last inbound sync time
        await supabaseAdmin
          .from("calendar_connections")
          .update({ last_inbound_sync_at: new Date().toISOString() })
          .eq("id", connection.id);

      } catch (err) {
        console.error(`Error processing connection ${connection.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${totalEvents} external events from ${connections.length} connection(s)`,
        synced: totalEvents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in calendar-caldav-fetch-events:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
