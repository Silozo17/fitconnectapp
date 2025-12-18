import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting combined calendar sync...");

    // Get user from auth header if present (for manual triggers)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader && !authHeader.includes("service_role")) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const results = {
      apple: { synced: 0, errors: 0 },
      google: { synced: 0, errors: 0 },
    };

    // Fetch Apple Calendar connections
    let appleQuery = supabase
      .from("calendar_connections")
      .select("id, user_id")
      .eq("provider", "apple_calendar")
      .eq("sync_enabled", true);

    if (userId) {
      appleQuery = appleQuery.eq("user_id", userId);
    }

    const { data: appleConnections } = await appleQuery;

    // Fetch Google Calendar connections
    let googleQuery = supabase
      .from("calendar_connections")
      .select("id, user_id")
      .eq("provider", "google_calendar")
      .eq("sync_enabled", true);

    if (userId) {
      googleQuery = googleQuery.eq("user_id", userId);
    }

    const { data: googleConnections } = await googleQuery;

    console.log(`Found ${appleConnections?.length || 0} Apple and ${googleConnections?.length || 0} Google connections`);

    // Process Apple Calendar connections
    for (const conn of appleConnections || []) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-caldav-fetch-events`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ connectionId: conn.id }),
        });

        if (response.ok) {
          results.apple.synced++;
          console.log(`Apple sync succeeded for connection ${conn.id}`);
        } else {
          results.apple.errors++;
          console.error(`Apple sync failed for connection ${conn.id}:`, response.status);
        }
      } catch (error) {
        results.apple.errors++;
        console.error(`Apple sync error for connection ${conn.id}:`, error);
      }
    }

    // Process Google Calendar connections
    for (const conn of googleConnections || []) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-google-fetch-events`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ connectionId: conn.id }),
        });

        if (response.ok) {
          results.google.synced++;
          console.log(`Google sync succeeded for connection ${conn.id}`);
        } else {
          results.google.errors++;
          console.error(`Google sync failed for connection ${conn.id}:`, response.status);
        }
      } catch (error) {
        results.google.errors++;
        console.error(`Google sync error for connection ${conn.id}:`, error);
      }
    }

    console.log("Combined sync complete:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Synced ${results.apple.synced + results.google.synced} calendars with ${results.apple.errors + results.google.errors} errors`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Combined sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
