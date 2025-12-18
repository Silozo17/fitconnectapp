import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!googleClientId || !googleClientSecret) {
      console.error("Google OAuth credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Google OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header if present
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let specificConnectionId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    // Check for specific connection ID in request body
    try {
      const body = await req.json();
      specificConnectionId = body?.connectionId || null;
    } catch {
      // No body or invalid JSON
    }

    console.log("Starting Google Calendar sync for user:", userId, "connection:", specificConnectionId);

    // Query for Google Calendar connections
    let query = supabase
      .from("calendar_connections")
      .select("*")
      .eq("provider", "google_calendar")
      .eq("sync_enabled", true);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (specificConnectionId) {
      query = query.eq("id", specificConnectionId);
    }

    const { data: connections, error: connError } = await query;

    if (connError) {
      console.error("Error fetching connections:", connError);
      throw connError;
    }

    console.log("Found", connections?.length || 0, "Google Calendar connections to sync");

    const results: { connectionId: string; eventsCount: number; error?: string }[] = [];

    for (const connection of connections || []) {
      console.log(`\n--- Processing Google connection ${connection.id} ---`);
      
      try {
        let accessToken = connection.access_token;
        const tokenExpiry = connection.token_expires_at ? new Date(connection.token_expires_at) : null;

        // Check if token is expired and refresh if needed
        if (tokenExpiry && tokenExpiry < new Date()) {
          console.log("Token expired, refreshing...");
          
          if (!connection.refresh_token) {
            console.error("No refresh token available for connection:", connection.id);
            results.push({ connectionId: connection.id, eventsCount: 0, error: "No refresh token" });
            continue;
          }

          const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: googleClientId,
              client_secret: googleClientSecret,
              refresh_token: connection.refresh_token,
              grant_type: "refresh_token",
            }),
          });

          if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            console.error("Token refresh failed:", refreshResponse.status, errorText);
            results.push({ connectionId: connection.id, eventsCount: 0, error: "Token refresh failed" });
            continue;
          }

          const tokenData = await refreshResponse.json();
          accessToken = tokenData.access_token;
          const newExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));

          // Update the token in database
          const { error: updateError } = await supabase
            .from("calendar_connections")
            .update({
              access_token: accessToken,
              token_expires_at: newExpiry.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

          if (updateError) {
            console.error("Failed to update token:", updateError);
          } else {
            console.log("Token refreshed successfully");
          }
        }

        // Date range: 3 months back, 6 months forward
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        // Fetch events from Google Calendar API
        const calendarId = connection.calendar_id || "primary";
        const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        eventsUrl.searchParams.set("timeMin", startDate.toISOString());
        eventsUrl.searchParams.set("timeMax", endDate.toISOString());
        eventsUrl.searchParams.set("singleEvents", "true");
        eventsUrl.searchParams.set("orderBy", "startTime");
        eventsUrl.searchParams.set("maxResults", "500");

        console.log("Fetching events from:", eventsUrl.toString());

        const eventsResponse = await fetch(eventsUrl.toString(), {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!eventsResponse.ok) {
          const errorText = await eventsResponse.text();
          console.error("Failed to fetch events:", eventsResponse.status, errorText);
          results.push({ connectionId: connection.id, eventsCount: 0, error: `API error: ${eventsResponse.status}` });
          continue;
        }

        const eventsData = await eventsResponse.json();
        const events: GoogleEvent[] = eventsData.items || [];

        console.log(`Fetched ${events.length} events from Google Calendar`);

        // Filter out events created by our app
        const externalEvents = events.filter(e => 
          !e.id.includes("fitlink") && 
          !e.summary?.toLowerCase().includes("[fitlink]")
        );

        // Upsert events to database
        for (const event of externalEvents) {
          const isAllDay = !event.start.dateTime;
          const startTime = event.start.dateTime || (event.start.date ? `${event.start.date}T00:00:00Z` : null);
          const endTime = event.end.dateTime || (event.end.date ? `${event.end.date}T23:59:59Z` : null);

          if (!startTime || !endTime) {
            console.log("Skipping event without valid times:", event.id);
            continue;
          }

          const { error: upsertError } = await supabase
            .from("external_calendar_events")
            .upsert(
              {
                user_id: connection.user_id,
                calendar_connection_id: connection.id,
                external_event_id: event.id,
                title: event.summary || null,
                start_time: startTime,
                end_time: endTime,
                is_all_day: isAllDay,
                source: "google_calendar",
                last_synced_at: new Date().toISOString(),
              },
              { onConflict: "calendar_connection_id,external_event_id" }
            );

          if (upsertError) {
            console.error("Error upserting event:", upsertError);
          }
        }

        // Update last sync time
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
    console.error("Google Calendar sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
