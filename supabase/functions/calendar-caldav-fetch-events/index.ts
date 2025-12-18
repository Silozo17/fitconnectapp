import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DAVClient } from "https://esm.sh/tsdav@2.1.1";
import ICAL from "https://esm.sh/ical.js@2.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  uid: string;
  summary: string | null;
  dtstart: string;
  dtend: string;
  isAllDay: boolean;
}

function decodeCredentials(accessToken: string): { email: string; password: string } | null {
  try {
    const decoded = atob(accessToken);
    if (decoded.startsWith("{")) {
      const parsed = JSON.parse(decoded);
      return { email: parsed.email, password: parsed.password };
    }
    const [email, password] = decoded.split(":");
    if (email && password) {
      return { email, password };
    }
    return null;
  } catch {
    return null;
  }
}

function parseICSToEvents(icsData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  try {
    const jcalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent);
        const uid = event.uid || `generated-${Date.now()}-${Math.random()}`;
        const summary = event.summary || null;
        
        let dtstart: string;
        let dtend: string;
        let isAllDay = false;

        if (event.startDate) {
          isAllDay = event.startDate.isDate;
          dtstart = event.startDate.toJSDate().toISOString();
        } else {
          continue;
        }

        if (event.endDate) {
          dtend = event.endDate.toJSDate().toISOString();
        } else {
          const endDate = new Date(dtstart);
          if (isAllDay) {
            endDate.setDate(endDate.getDate() + 1);
          } else {
            endDate.setHours(endDate.getHours() + 1);
          }
          dtend = endDate.toISOString();
        }

        events.push({ uid, summary, dtstart, dtend, isAllDay });
      } catch (e) {
        console.log("Error parsing individual event:", e);
      }
    }
  } catch (e) {
    console.log("ICAL.js parse failed, trying regex fallback:", e);
    // Fallback to regex parsing
    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;
    while ((match = veventRegex.exec(icsData)) !== null) {
      const event = parseVEventFallback(match[1]);
      if (event) events.push(event);
    }
  }

  return events;
}

function parseVEventFallback(veventBlock: string): CalendarEvent | null {
  const lines = veventBlock.split(/\r?\n/);
  let uid = "";
  let summary: string | null = null;
  let dtstart = "";
  let dtend = "";
  let isAllDay = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      line += lines[i + 1].substring(1);
      i++;
    }

    if (line.startsWith("UID:")) {
      uid = line.substring(4).trim();
    } else if (line.startsWith("SUMMARY:")) {
      summary = line.substring(8).trim();
    } else if (line.startsWith("DTSTART")) {
      const match = line.match(/DTSTART[^:]*:(.*)/);
      if (match) {
        const value = match[1].trim();
        if (line.includes("VALUE=DATE") || /^\d{8}$/.test(value)) {
          isAllDay = true;
          dtstart = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}T00:00:00Z`;
        } else {
          dtstart = parseICalDateTime(value);
        }
      }
    } else if (line.startsWith("DTEND")) {
      const match = line.match(/DTEND[^:]*:(.*)/);
      if (match) {
        const value = match[1].trim();
        if (line.includes("VALUE=DATE") || /^\d{8}$/.test(value)) {
          dtend = `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}T23:59:59Z`;
        } else {
          dtend = parseICalDateTime(value);
        }
      }
    }
  }

  if (!uid || !dtstart) return null;
  if (!dtend) {
    if (isAllDay) {
      dtend = dtstart.replace("T00:00:00Z", "T23:59:59Z");
    } else {
      const startDate = new Date(dtstart);
      startDate.setHours(startDate.getHours() + 1);
      dtend = startDate.toISOString();
    }
  }

  return { uid, summary, dtstart, dtend, isAllDay };
}

function parseICalDateTime(icalDate: string): string {
  const clean = icalDate.replace(/[^0-9TZ]/g, "");
  if (clean.length >= 15) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    const hour = clean.substring(9, 11);
    const minute = clean.substring(11, 13);
    const second = clean.substring(13, 15);
    const tz = clean.endsWith("Z") ? "Z" : "";
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${tz || "Z"}`;
  }
  return new Date().toISOString();
}

async function syncWithTsdav(
  email: string,
  password: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  console.log("Step 1: Creating DAVClient for iCloud...");
  
  const client = new DAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: {
      username: email,
      password: password,
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  console.log("Step 2: Logging in to iCloud CalDAV...");
  await client.login();
  console.log("Login successful!");
  console.log("Account info:", {
    serverUrl: client.serverUrl,
    accountType: client.accountType,
  });

  console.log("Step 3: Fetching calendars...");
  const calendars = await client.fetchCalendars();
  console.log(`Found ${calendars.length} calendars:`, calendars.map(c => ({
    displayName: c.displayName,
    url: c.url,
  })));

  const allEvents: CalendarEvent[] = [];

  for (const calendar of calendars) {
    console.log(`Step 4: Fetching events from "${calendar.displayName || 'Unnamed'}"...`);
    
    try {
      const calendarObjects = await client.fetchCalendarObjects({
        calendar,
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      console.log(`Found ${calendarObjects.length} events in "${calendar.displayName || 'Unnamed'}"`);

      for (const obj of calendarObjects) {
        if (obj.data) {
          const events = parseICSToEvents(obj.data);
          allEvents.push(...events);
        }
      }
    } catch (calError) {
      console.error(`Error fetching events from ${calendar.displayName}:`, calError);
    }
  }

  return allEvents;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let specificConnectionId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    try {
      const body = await req.json();
      specificConnectionId = body?.connectionId || null;
    } catch {
      // No body
    }

    console.log("=== Starting iCloud CalDAV sync ===");
    console.log("User:", userId, "Connection:", specificConnectionId);

    let query = supabase
      .from("calendar_connections")
      .select("*")
      .eq("provider", "apple_calendar")
      .eq("sync_enabled", true);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (specificConnectionId) {
      query = query.eq("id", specificConnectionId);
    }

    const { data: connections, error: connError } = await query;

    if (connError) throw connError;

    console.log("Found", connections?.length || 0, "Apple Calendar connections to sync");

    const results: { connectionId: string; eventsCount: number; error?: string }[] = [];

    for (const connection of connections || []) {
      console.log(`\n--- Processing connection ${connection.id} ---`);
      
      try {
        const credentials = decodeCredentials(connection.access_token);

        if (!credentials) {
          console.error("Failed to decode credentials for connection:", connection.id);
          results.push({ connectionId: connection.id, eventsCount: 0, error: "Invalid credentials" });
          continue;
        }

        // Date range: 3 months back, 6 months forward
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        console.log("Syncing date range:", startDate.toISOString(), "to", endDate.toISOString());

        const allEvents = await syncWithTsdav(
          credentials.email,
          credentials.password,
          startDate,
          endDate
        );

        console.log(`Total events fetched: ${allEvents.length}`);

        // Filter out internal events
        const externalEvents = allEvents.filter(
          e => !e.uid.startsWith("fitlink-") && !e.uid.includes("fitconnect-")
        );

        console.log(`External events to store: ${externalEvents.length}`);

        // Upsert events to database
        for (const event of externalEvents) {
          const { error: upsertError } = await supabase
            .from("external_calendar_events")
            .upsert(
              {
                user_id: connection.user_id,
                calendar_connection_id: connection.id,
                external_event_id: event.uid,
                title: event.summary,
                start_time: event.dtstart,
                end_time: event.dtend,
                is_all_day: event.isAllDay,
                source: "apple_calendar",
                last_synced_at: new Date().toISOString(),
              },
              { onConflict: "calendar_connection_id,external_event_id" }
            );

          if (upsertError) {
            console.error("Error upserting event:", upsertError);
          }
        }

        // Update last sync timestamp
        await supabase
          .from("calendar_connections")
          .update({ last_inbound_sync_at: new Date().toISOString() })
          .eq("id", connection.id);

        results.push({ connectionId: connection.id, eventsCount: externalEvents.length });
        console.log(`Successfully synced ${externalEvents.length} events for connection ${connection.id}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error syncing connection ${connection.id}:`, errorMessage);
        results.push({ connectionId: connection.id, eventsCount: 0, error: errorMessage });
      }
    }

    console.log("\n=== CalDAV sync complete ===");
    console.log("Results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("CalDAV sync error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
