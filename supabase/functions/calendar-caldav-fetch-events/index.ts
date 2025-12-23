import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  // Handle date-only format (8 digits)
  if (clean.length >= 8) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return `${year}-${month}-${day}T00:00:00Z`;
  }
  return new Date().toISOString();
}

function parseVEvent(veventBlock: string): CalendarEvent | null {
  const lines = veventBlock.split(/\r?\n/);
  let uid = "";
  let summary: string | null = null;
  let dtstart = "";
  let dtend = "";
  let isAllDay = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Handle line continuations
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

function parseICSToEvents(icsData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;
  
  while ((match = veventRegex.exec(icsData)) !== null) {
    const event = parseVEvent(match[1]);
    if (event) {
      events.push(event);
    }
  }
  
  return events;
}

async function fetchCalendarEvents(
  email: string,
  password: string,
  calendarUrls: string[],
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const authString = btoa(`${email}:${password}`);
  const allEvents: CalendarEvent[] = [];
  
  // Format dates for CalDAV REPORT
  const formatCalDAVDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startStr = formatCalDAVDate(startDate);
  const endStr = formatCalDAVDate(endDate);

  for (const calendarUrl of calendarUrls) {
    console.log(`Fetching events from calendar: ${calendarUrl}`);
    
    try {
      // Use REPORT with calendar-query to get events in time range
      const reportBody = `<?xml version="1.0" encoding="utf-8"?>
        <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
          <d:prop>
            <d:getetag/>
            <c:calendar-data/>
          </d:prop>
          <c:filter>
            <c:comp-filter name="VCALENDAR">
              <c:comp-filter name="VEVENT">
                <c:time-range start="${startStr}" end="${endStr}"/>
              </c:comp-filter>
            </c:comp-filter>
          </c:filter>
        </c:calendar-query>`;

      const fullUrl = calendarUrl.startsWith("http") 
        ? calendarUrl 
        : `https://caldav.icloud.com${calendarUrl}`;

      const response = await fetch(fullUrl, {
        method: "REPORT",
        headers: {
          "Authorization": `Basic ${authString}`,
          "Content-Type": "application/xml; charset=utf-8",
          "Depth": "1",
        },
        body: reportBody,
      });

      console.log(`Calendar ${calendarUrl} response status:`, response.status);

      if (response.ok || response.status === 207) {
        const xmlData = await response.text();
        
        // Extract calendar-data (ICS content) from each response
        const calDataRegex = /<c:calendar-data[^>]*>([\s\S]*?)<\/c:calendar-data>/gi;
        let dataMatch;
        
        while ((dataMatch = calDataRegex.exec(xmlData)) !== null) {
          let icsData = dataMatch[1];
          // Decode HTML entities if present
          icsData = icsData
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
          
          const events = parseICSToEvents(icsData);
          allEvents.push(...events);
        }
        
        console.log(`Found ${allEvents.length} events so far`);
      } else {
        const errorText = await response.text();
        console.error(`Failed to fetch calendar ${calendarUrl}:`, errorText.substring(0, 500));
      }
    } catch (calError) {
      console.error(`Error fetching calendar ${calendarUrl}:`, calError);
    }
  }

  return allEvents;
}

async function discoverAndFetchEvents(
  email: string,
  password: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const authString = btoa(`${email}:${password}`);
  const calendarUrls: string[] = [];
  
  console.log("Step 1: Discovering user principal...");
  
  // Discover user principal
  const principalResponse = await fetch("https://caldav.icloud.com/", {
    method: "PROPFIND",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "0",
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:current-user-principal/>
        </d:prop>
      </d:propfind>`,
  });

  if (principalResponse.status === 401) {
    throw new Error("Invalid credentials");
  }

  const principalXml = await principalResponse.text();
  const principalMatch = principalXml.match(/<d:current-user-principal[^>]*>[\s\S]*?<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                         principalXml.match(/<D:current-user-principal[^>]*>[\s\S]*?<D:href[^>]*>([^<]+)<\/D:href>/i);
  
  let principalUrl = principalMatch ? principalMatch[1] : `/${email.split('@')[0]}/principal/`;
  
  console.log("Principal URL:", principalUrl);

  // Get calendar home
  const homeSetResponse = await fetch(`https://caldav.icloud.com${principalUrl}`, {
    method: "PROPFIND",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "0",
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
      <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <c:calendar-home-set/>
        </d:prop>
      </d:propfind>`,
  });

  let calendarHomeUrl = `/${email.split('@')[0]}/calendars/`;
  
  if (homeSetResponse.ok || homeSetResponse.status === 207) {
    const homeSetXml = await homeSetResponse.text();
    const homeMatch = homeSetXml.match(/<c:calendar-home-set[^>]*>[\s\S]*?<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                      homeSetXml.match(/<calendar-home-set[^>]*>[\s\S]*?<href[^>]*>([^<]+)<\/href>/i);
    if (homeMatch) {
      calendarHomeUrl = homeMatch[1];
    }
  }
  
  console.log("Calendar home URL:", calendarHomeUrl);

  // List calendars
  const calendarsResponse = await fetch(`https://caldav.icloud.com${calendarHomeUrl}`, {
    method: "PROPFIND",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "1",
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
      <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <d:displayname/>
          <d:resourcetype/>
        </d:prop>
      </d:propfind>`,
  });

  if (calendarsResponse.ok || calendarsResponse.status === 207) {
    const calendarsXml = await calendarsResponse.text();
    const responseBlocks = calendarsXml.split(/<d:response[^>]*>/i).slice(1);
    
    for (const block of responseBlocks) {
      if (block.includes("<c:calendar") || block.includes("<cal:calendar") || block.includes(":calendar/>")) {
        const hrefMatch = block.match(/<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                         block.match(/<D:href[^>]*>([^<]+)<\/D:href>/i);
        if (hrefMatch) {
          calendarUrls.push(hrefMatch[1]);
        }
      }
    }
  }

  if (calendarUrls.length === 0) {
    console.log("No calendars discovered, using default");
    calendarUrls.push(`${calendarHomeUrl}home/`);
  }

  console.log(`Found ${calendarUrls.length} calendars to fetch`);
  
  return await fetchCalendarEvents(email, password, calendarUrls, startDate, endDate);
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

    console.log("=== Starting iCloud CalDAV fetch ===");
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

        // Use stored calendar URLs if available, otherwise discover
        let calendarUrls: string[] = [];
        if (connection.calendar_id) {
          calendarUrls = connection.calendar_id.split(",").filter((u: string) => u.trim());
        }

        let allEvents: CalendarEvent[];
        
        if (calendarUrls.length > 0) {
          console.log("Using stored calendar URLs:", calendarUrls);
          allEvents = await fetchCalendarEvents(
            credentials.email,
            credentials.password,
            calendarUrls,
            startDate,
            endDate
          );
        } else {
          console.log("No stored URLs, discovering calendars...");
          allEvents = await discoverAndFetchEvents(
            credentials.email,
            credentials.password,
            startDate,
            endDate
          );
        }

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

    console.log("\n=== CalDAV fetch complete ===");
    console.log("Results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("CalDAV fetch error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
