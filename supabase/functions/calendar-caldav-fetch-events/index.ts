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

// Parse a VEVENT block from iCalendar data
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

function parseICalendar(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = veventRegex.exec(icalData)) !== null) {
    const event = parseVEvent(match[1]);
    if (event) {
      events.push(event);
    }
  }

  return events;
}

function decodeCredentials(accessToken: string): { email: string; password: string } | null {
  try {
    const decoded = atob(accessToken);
    // Handle both JSON format and colon-separated format
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

// Discover calendar home via PROPFIND
async function discoverCalendarHome(caldavUrl: string, authString: string): Promise<string | null> {
  console.log("Discovering calendar home URL...");
  
  const principalPropfind = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:">
  <D:prop>
    <D:current-user-principal/>
  </D:prop>
</D:propfind>`;

  try {
    const principalResponse = await fetch(caldavUrl, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/xml; charset=utf-8",
        "Depth": "0",
      },
      body: principalPropfind,
    });

    console.log("Principal discovery response status:", principalResponse.status);
    
    if (!principalResponse.ok && principalResponse.status !== 207) {
      console.error("Failed to discover principal:", principalResponse.status);
      return null;
    }

    const principalXml = await principalResponse.text();
    console.log("Principal response (first 500 chars):", principalXml.substring(0, 500));
    
    // Extract principal URL
    const principalMatch = principalXml.match(/<[^>]*href[^>]*>([^<]*\/principal[^<]*)<\/[^>]*href>/i);
    if (principalMatch) {
      console.log("Found principal URL:", principalMatch[1]);
      return await getCalendarHomeFromPrincipal(caldavUrl, principalMatch[1], authString);
    }

    // Try to find calendar-home-set directly
    const homeMatch = principalXml.match(/<[^>]*href[^>]*>([^<]*calendars[^<]*)<\/[^>]*href>/i);
    if (homeMatch) {
      console.log("Found calendar home directly:", homeMatch[1]);
      return homeMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Error discovering calendar home:", error);
    return null;
  }
}

async function getCalendarHomeFromPrincipal(baseUrl: string, principalPath: string, authString: string): Promise<string | null> {
  const homeSetPropfind = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <C:calendar-home-set/>
  </D:prop>
</D:propfind>`;

  let fullPrincipalUrl: string;
  if (principalPath.startsWith("http")) {
    fullPrincipalUrl = principalPath;
  } else {
    const url = new URL(baseUrl);
    fullPrincipalUrl = `${url.protocol}//${url.host}${principalPath}`;
  }

  console.log("Fetching calendar-home-set from:", fullPrincipalUrl);

  try {
    const homeResponse = await fetch(fullPrincipalUrl, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/xml; charset=utf-8",
        "Depth": "0",
      },
      body: homeSetPropfind,
    });

    console.log("Calendar home response status:", homeResponse.status);

    if (!homeResponse.ok && homeResponse.status !== 207) {
      return null;
    }

    const homeXml = await homeResponse.text();
    console.log("Calendar home response (first 500 chars):", homeXml.substring(0, 500));

    const homeMatch = homeXml.match(/<[^>]*href[^>]*>([^<]*calendars[^<]*)<\/[^>]*href>/i);
    if (homeMatch) {
      console.log("Found calendar home:", homeMatch[1]);
      return homeMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error("Error getting calendar home:", error);
    return null;
  }
}

async function fetchCalendarEvents(
  calendarUrl: string,
  authString: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const startStr = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endStr = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const reportBody = `<?xml version="1.0" encoding="utf-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${startStr}" end="${endStr}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

  console.log("Fetching events from:", calendarUrl);

  const response = await fetch(calendarUrl, {
    method: "REPORT",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "1",
    },
    body: reportBody,
  });

  console.log("REPORT response status:", response.status);

  if (!response.ok && response.status !== 207) {
    const text = await response.text();
    console.error("REPORT failed:", response.status, text.substring(0, 500));
    return [];
  }

  const xml = await response.text();
  console.log("REPORT response length:", xml.length);
  
  return parseICalendar(xml);
}

async function listCalendars(calendarHomeUrl: string, baseUrl: string, authString: string): Promise<string[]> {
  let fullUrl: string;
  if (calendarHomeUrl.startsWith("http")) {
    fullUrl = calendarHomeUrl;
  } else {
    const url = new URL(baseUrl);
    fullUrl = `${url.protocol}//${url.host}${calendarHomeUrl}`;
  }

  console.log("Listing calendars at:", fullUrl);

  const propfind = `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:resourcetype/>
    <D:displayname/>
  </D:prop>
</D:propfind>`;

  try {
    const response = await fetch(fullUrl, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/xml; charset=utf-8",
        "Depth": "1",
      },
      body: propfind,
    });

    console.log("List calendars response status:", response.status);

    if (!response.ok && response.status !== 207) {
      return [fullUrl];
    }

    const xml = await response.text();
    console.log("Calendars list response (first 1000 chars):", xml.substring(0, 1000));

    const calendars: string[] = [];
    const hrefMatches = xml.matchAll(/<[^>]*href[^>]*>([^<]+)<\/[^>]*href[^>]*>/gi);
    
    for (const match of hrefMatches) {
      const href = match[1];
      if (href && href !== calendarHomeUrl && !href.includes("inbox") && !href.includes("outbox") && !href.includes("notification")) {
        const calUrl = href.startsWith("http") ? href : `${new URL(baseUrl).origin}${href}`;
        if (!calendars.includes(calUrl)) {
          calendars.push(calUrl);
        }
      }
    }

    if (calendars.length > 0) {
      console.log("Found calendars:", calendars);
      return calendars;
    }

    return [fullUrl];
  } catch (error) {
    console.error("Error listing calendars:", error);
    return [fullUrl];
  }
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

    console.log("Starting CalDAV sync for user:", userId, "connection:", specificConnectionId);

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
        const caldavUrl = connection.caldav_server_url || "https://caldav.icloud.com";
        const credentials = decodeCredentials(connection.access_token);

        if (!credentials) {
          console.error("Failed to decode credentials for connection:", connection.id);
          results.push({ connectionId: connection.id, eventsCount: 0, error: "Invalid credentials" });
          continue;
        }

        const authString = btoa(`${credentials.email}:${credentials.password}`);

        // Try to discover calendar home
        let calendarHomeUrl = await discoverCalendarHome(caldavUrl, authString);
        
        if (!calendarHomeUrl) {
          console.log("Discovery failed, trying fallback paths...");
          
          if (connection.calendar_id) {
            calendarHomeUrl = connection.calendar_id;
          } else {
            const fallbackPaths = [
              `${caldavUrl}/${encodeURIComponent(credentials.email)}/calendars/`,
              `${caldavUrl}/calendars/`,
            ];
            
            for (const path of fallbackPaths) {
              console.log("Trying fallback path:", path);
              try {
                const testResponse = await fetch(path, {
                  method: "PROPFIND",
                  headers: {
                    "Authorization": `Basic ${authString}`,
                    "Depth": "0",
                  },
                });
                if (testResponse.ok || testResponse.status === 207) {
                  calendarHomeUrl = path;
                  console.log("Fallback path works:", path);
                  break;
                }
              } catch {
                continue;
              }
            }
          }
        }

        if (!calendarHomeUrl) {
          console.error("Could not find calendar home for connection:", connection.id);
          results.push({ connectionId: connection.id, eventsCount: 0, error: "Calendar discovery failed" });
          continue;
        }

        const calendarUrls = await listCalendars(calendarHomeUrl, caldavUrl, authString);

        // Date range: 3 months back, 6 months forward
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        const allEvents: CalendarEvent[] = [];

        for (const calUrl of calendarUrls) {
          const events = await fetchCalendarEvents(calUrl, authString, startDate, endDate);
          console.log(`Fetched ${events.length} events from ${calUrl}`);
          allEvents.push(...events);
        }

        console.log(`Total events fetched: ${allEvents.length}`);

        const externalEvents = allEvents.filter(e => !e.uid.startsWith("fitlink-") && !e.uid.includes("fitconnect-"));

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

        await supabase
          .from("calendar_connections")
          .update({ last_inbound_sync_at: new Date().toISOString() })
          .eq("id", connection.id);

        results.push({ connectionId: connection.id, eventsCount: externalEvents.length });
        console.log(`Synced ${externalEvents.length} events for connection ${connection.id}`);
      } catch (error) {
        console.error(`Error processing connection ${connection.id}:`, error);
        results.push({ connectionId: connection.id, eventsCount: 0, error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CalDAV sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
