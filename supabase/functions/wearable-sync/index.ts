import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format, subDays } from "https://esm.sh/date-fns@3";

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

    const { connectionId } = await req.json();
    console.log("Syncing wearable connection:", connectionId);

    // Get connection details
    const { data: connection, error: connError } = await supabase
      .from("wearable_connections")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (connError || !connection) throw new Error("Connection not found");

    const { provider, access_token, client_id } = connection;
    const today = new Date();
    const weekAgo = subDays(today, 7);

    let healthData: any[] = [];

    switch (provider) {
      case "google_fit":
        healthData = await syncGoogleFit(access_token, weekAgo, today);
        break;
      case "fitbit":
        healthData = await syncFitbit(access_token, weekAgo, today);
        break;
      default:
        console.log("Provider not fully implemented:", provider);
    }

    // Insert health data
    if (healthData.length > 0) {
      const dataToInsert = healthData.map((d) => ({
        client_id,
        wearable_connection_id: connectionId,
        data_type: d.type,
        recorded_at: d.date,
        value: d.value,
        unit: d.unit,
        source: provider,
        raw_data: d.raw,
      }));

      const { error: insertError } = await supabase
        .from("health_data_sync")
        .upsert(dataToInsert, { onConflict: "client_id,data_type,recorded_at,source" });

      if (insertError) {
        console.error("Error inserting health data:", insertError);
      }
    }

    // Update last synced timestamp
    await supabase
      .from("wearable_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", connectionId);

    console.log(`Synced ${healthData.length} data points`);

    return new Response(
      JSON.stringify({ success: true, dataPoints: healthData.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in wearable-sync:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function syncGoogleFit(accessToken: string, startDate: Date, endDate: Date) {
  const healthData: any[] = [];
  const startTimeMillis = startDate.getTime();
  const endTimeMillis = endDate.getTime();

  try {
    // Fetch steps
    const stepsResponse = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    const stepsData = await stepsResponse.json();
    if (stepsData.bucket) {
      for (const bucket of stepsData.bucket) {
        const date = format(new Date(parseInt(bucket.startTimeMillis)), "yyyy-MM-dd");
        const value = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
        if (value > 0) {
          healthData.push({ type: "steps", date, value, unit: "steps", raw: bucket });
        }
      }
    }

    // Fetch heart rate
    const hrResponse = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.heart_rate.bpm" }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    const hrData = await hrResponse.json();
    if (hrData.bucket) {
      for (const bucket of hrData.bucket) {
        const date = format(new Date(parseInt(bucket.startTimeMillis)), "yyyy-MM-dd");
        const point = bucket.dataset?.[0]?.point?.[0];
        if (point) {
          const avgHr = point.value?.[0]?.fpVal || 0;
          if (avgHr > 0) {
            healthData.push({ type: "heart_rate", date, value: avgHr, unit: "bpm", raw: bucket });
          }
        }
      }
    }

    // Fetch calories
    const caloriesResponse = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{ dataTypeName: "com.google.calories.expended" }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis,
          endTimeMillis,
        }),
      }
    );

    const caloriesData = await caloriesResponse.json();
    if (caloriesData.bucket) {
      for (const bucket of caloriesData.bucket) {
        const date = format(new Date(parseInt(bucket.startTimeMillis)), "yyyy-MM-dd");
        const value = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0;
        if (value > 0) {
          healthData.push({ type: "calories", date, value: Math.round(value), unit: "kcal", raw: bucket });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching Google Fit data:", error);
  }

  return healthData;
}

async function syncFitbit(accessToken: string, startDate: Date, endDate: Date) {
  const healthData: any[] = [];
  const startStr = format(startDate, "yyyy-MM-dd");
  const endStr = format(endDate, "yyyy-MM-dd");

  try {
    // Fetch activities (steps, calories, distance)
    const activitiesResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${endStr}.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const activitiesData = await activitiesResponse.json();
    if (activitiesData.summary) {
      const summary = activitiesData.summary;
      healthData.push({
        type: "steps",
        date: endStr,
        value: summary.steps || 0,
        unit: "steps",
        raw: summary,
      });
      healthData.push({
        type: "calories",
        date: endStr,
        value: summary.caloriesOut || 0,
        unit: "kcal",
        raw: summary,
      });
      healthData.push({
        type: "active_minutes",
        date: endStr,
        value: (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0),
        unit: "minutes",
        raw: summary,
      });
    }

    // Fetch heart rate
    const hrResponse = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${endStr}/1d.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const hrData = await hrResponse.json();
    if (hrData["activities-heart"]?.[0]) {
      const heartData = hrData["activities-heart"][0];
      const restingHr = heartData.value?.restingHeartRate;
      if (restingHr) {
        healthData.push({
          type: "heart_rate",
          date: endStr,
          value: restingHr,
          unit: "bpm",
          raw: heartData,
        });
      }
    }

    // Fetch sleep
    const sleepResponse = await fetch(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${endStr}.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const sleepData = await sleepResponse.json();
    if (sleepData.summary) {
      healthData.push({
        type: "sleep",
        date: endStr,
        value: sleepData.summary.totalMinutesAsleep || 0,
        unit: "minutes",
        raw: sleepData.summary,
      });
    }
  } catch (error) {
    console.error("Error fetching Fitbit data:", error);
  }

  return healthData;
}
