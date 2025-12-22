import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting automatic wearable sync for all active connections...");

    // Fetch all active wearable connections
    const { data: connections, error: fetchError } = await supabase
      .from("wearable_connections")
      .select("id, client_id, provider, access_token, refresh_token, token_expires_at, last_synced_at")
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching connections:", fetchError);
      throw fetchError;
    }

    if (!connections || connections.length === 0) {
      console.log("No active wearable connections to sync");
      return new Response(
        JSON.stringify({ success: true, message: "No active connections", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${connections.length} active connections to sync`);

    let successCount = 0;
    let errorCount = 0;
    const results: { connectionId: string; provider: string; success: boolean; error?: string }[] = [];

    for (const connection of connections) {
      try {
        console.log(`Syncing connection ${connection.id} (${connection.provider})...`);

        // Skip health_connect - data is pushed from native app
        if (connection.provider === "health_connect") {
          console.log("Skipping health_connect - data is pushed from native app");
          results.push({ connectionId: connection.id, provider: connection.provider, success: true });
          successCount++;
          continue;
        }

        // Check if token needs refresh
        let accessToken = connection.access_token;
        const tokenExpires = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
        
        if (tokenExpires && tokenExpires < new Date() && connection.refresh_token) {
          console.log(`Token expired for ${connection.id}, refreshing...`);
          accessToken = await refreshToken(connection, supabase);
        }

        // Sync data based on provider
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        let healthData: any[] = [];
        
        if (connection.provider === "fitbit") {
          healthData = await syncFitbit(accessToken, startDate, endDate);
        }

        // Upsert health data
        if (healthData.length > 0) {
          const dataToUpsert = healthData.map((item) => ({
            client_id: connection.client_id,
            wearable_connection_id: connection.id,
            data_type: item.data_type,
            value: item.value,
            recorded_at: item.recorded_date,
            source: item.source,
            unit: getUnitForDataType(item.data_type),
          }));

          for (const dataPoint of dataToUpsert) {
            const { error: upsertError } = await supabase
              .from("health_data_sync")
              .upsert(dataPoint, { 
                onConflict: "client_id,data_type,recorded_at,source",
                ignoreDuplicates: false 
              });

            if (upsertError) {
              console.error(`Error upserting health data for ${connection.id}:`, upsertError);
            }
          }
        }

        // Update last_synced_at
        await supabase
          .from("wearable_connections")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", connection.id);

        console.log(`Successfully synced ${healthData.length} data points for ${connection.id}`);
        successCount++;
        results.push({ connectionId: connection.id, provider: connection.provider, success: true });
      } catch (connError: unknown) {
        const errorMessage = connError instanceof Error ? connError.message : "Unknown error";
        console.error(`Error syncing connection ${connection.id}:`, connError);
        errorCount++;
        results.push({ 
          connectionId: connection.id, 
          provider: connection.provider, 
          success: false, 
          error: errorMessage 
        });
      }
    }

    console.log(`Sync complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: successCount, 
        errors: errorCount,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Wearable sync-all error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function refreshToken(connection: any, supabase: any): Promise<string> {
  let tokenUrl: string;
  let body: string;
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (connection.provider === "fitbit") {
    const clientId = Deno.env.get("FITBIT_CLIENT_ID")!;
    const clientSecret = Deno.env.get("FITBIT_CLIENT_SECRET")!;
    tokenUrl = "https://api.fitbit.com/oauth2/token";
    headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    body = new URLSearchParams({
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }).toString();
  } else {
    throw new Error(`Unknown provider: ${connection.provider}`);
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token refresh failed for ${connection.provider}:`, errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const tokens = await response.json();

  // Update tokens in database
  await supabase
    .from("wearable_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || connection.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq("id", connection.id);

  return tokens.access_token;
}

function getUnitForDataType(dataType: string): string {
  const units: Record<string, string> = {
    steps: "count",
    heart_rate: "bpm",
    calories: "kcal",
    active_minutes: "minutes",
    sleep: "minutes",
    sleep_minutes: "minutes",
    distance: "meters",
  };
  return units[dataType] || "count";
}

async function syncFitbit(accessToken: string, startDate: Date, endDate: Date): Promise<any[]> {
  const results: any[] = [];
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Fetch activities (steps, calories)
  try {
    const activitiesUrl = `https://api.fitbit.com/1/user/-/activities/date/${formatDate(endDate)}.json`;
    const response = await fetch(activitiesUrl, { headers });
    
    if (response.ok) {
      const data = await response.json();
      const summary = data.summary;
      const date = formatDate(endDate);
      
      if (summary?.steps) {
        results.push({ data_type: "steps", value: summary.steps, recorded_date: date, source: "fitbit" });
      }
      if (summary?.caloriesOut) {
        results.push({ data_type: "calories", value: summary.caloriesOut, recorded_date: date, source: "fitbit" });
      }
      if (summary?.veryActiveMinutes !== undefined) {
        results.push({ data_type: "active_minutes", value: summary.veryActiveMinutes + (summary.fairlyActiveMinutes || 0), recorded_date: date, source: "fitbit" });
      }
    }
  } catch (error) {
    console.error("Error fetching Fitbit activities:", error);
  }

  // Fetch heart rate
  try {
    const heartUrl = `https://api.fitbit.com/1/user/-/activities/heart/date/${formatDate(endDate)}/1d.json`;
    const response = await fetch(heartUrl, { headers });
    
    if (response.ok) {
      const data = await response.json();
      const restingHr = data["activities-heart"]?.[0]?.value?.restingHeartRate;
      if (restingHr) {
        results.push({ data_type: "heart_rate", value: restingHr, recorded_date: formatDate(endDate), source: "fitbit" });
      }
    }
  } catch (error) {
    console.error("Error fetching Fitbit heart rate:", error);
  }

  // Fetch sleep
  try {
    const sleepUrl = `https://api.fitbit.com/1.2/user/-/sleep/date/${formatDate(endDate)}.json`;
    const response = await fetch(sleepUrl, { headers });
    
    if (response.ok) {
      const data = await response.json();
      const totalMinutes = data.summary?.totalMinutesAsleep;
      if (totalMinutes) {
        results.push({ data_type: "sleep_minutes", value: totalMinutes, recorded_date: formatDate(endDate), source: "fitbit" });
      }
    }
  } catch (error) {
    console.error("Error fetching Fitbit sleep:", error);
  }

  return results;
}
