import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format, subDays } from "https://esm.sh/date-fns@3";
import {
  generateNonce,
  generateTimestamp,
  generateSignatureBaseString,
  generateHmacSha1Signature,
  generateAuthorizationHeader,
} from "../_shared/oauth1.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GARMIN_CONSUMER_KEY = Deno.env.get("GARMIN_CONSUMER_KEY");
const GARMIN_CONSUMER_SECRET = Deno.env.get("GARMIN_CONSUMER_SECRET");

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

    const { provider, access_token, token_secret, client_id } = connection;
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
      case "garmin":
        healthData = await syncGarmin(access_token, token_secret, weekAgo, today);
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

    console.log(`Synced ${healthData.length} data points for ${provider}`);

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

async function syncGarmin(
  accessToken: string,
  tokenSecret: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  const healthData: any[] = [];
  const GARMIN_API_BASE = "https://apis.garmin.com/wellness-api/rest";

  if (!GARMIN_CONSUMER_KEY || !GARMIN_CONSUMER_SECRET || !tokenSecret) {
    console.error("Garmin credentials or token secret missing");
    return healthData;
  }

  // Helper to make signed Garmin API requests
  async function garminApiRequest(endpoint: string, queryParams: Record<string, string> = {}) {
    const baseUrl = `${GARMIN_API_BASE}${endpoint}`;
    const oauthNonce = generateNonce();
    const oauthTimestamp = generateTimestamp();

    // Combine OAuth and query params for signature
    const allParams: Record<string, string> = {
      oauth_consumer_key: GARMIN_CONSUMER_KEY!,
      oauth_nonce: oauthNonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: oauthTimestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
      ...queryParams,
    };

    const baseString = generateSignatureBaseString("GET", baseUrl, allParams);
    const signature = await generateHmacSha1Signature(baseString, GARMIN_CONSUMER_SECRET!, tokenSecret);
    
    // Only OAuth params go in Authorization header
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: GARMIN_CONSUMER_KEY!,
      oauth_nonce: oauthNonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: oauthTimestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
      oauth_signature: signature,
    };

    const authHeader = generateAuthorizationHeader(oauthParams);
    
    // Query params go in URL
    const queryString = Object.keys(queryParams).length > 0 
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";

    console.log(`Fetching Garmin ${endpoint}...`);
    
    const response = await fetch(`${baseUrl}${queryString}`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Garmin API error for ${endpoint}:`, response.status, errorText);
      return null;
    }

    return response.json();
  }

  try {
    const startTimestamp = Math.floor(startDate.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endDate.getTime() / 1000).toString();

    // Fetch daily summaries (steps, calories, heart rate, etc.)
    const dailies = await garminApiRequest("/dailies", {
      uploadStartTimeInSeconds: startTimestamp,
      uploadEndTimeInSeconds: endTimestamp,
    });

    if (dailies && Array.isArray(dailies)) {
      console.log(`Processing ${dailies.length} Garmin daily records`);
      
      for (const daily of dailies) {
        const date = daily.calendarDate || format(new Date(daily.startTimeInSeconds * 1000), "yyyy-MM-dd");
        
        if (daily.steps) {
          healthData.push({ type: "steps", date, value: daily.steps, unit: "steps", raw: daily });
        }
        if (daily.activeKilocalories) {
          healthData.push({ type: "calories", date, value: daily.activeKilocalories, unit: "kcal", raw: daily });
        }
        if (daily.restingHeartRateInBeatsPerMinute) {
          healthData.push({ type: "heart_rate", date, value: daily.restingHeartRateInBeatsPerMinute, unit: "bpm", raw: daily });
        }
        if (daily.moderateIntensityDurationInSeconds || daily.vigorousIntensityDurationInSeconds) {
          const activeMinutes = Math.round(
            ((daily.moderateIntensityDurationInSeconds || 0) + (daily.vigorousIntensityDurationInSeconds || 0)) / 60
          );
          healthData.push({ type: "active_minutes", date, value: activeMinutes, unit: "minutes", raw: daily });
        }
        if (daily.stressQualifier) {
          // Map stress qualifier to a numeric value
          const stressMap: Record<string, number> = {
            calm: 1,
            balanced: 2,
            stressful: 3,
            very_stressful: 4,
            unknown: 0,
          };
          healthData.push({ 
            type: "stress", 
            date, 
            value: stressMap[daily.stressQualifier] || daily.averageStressLevel || 0, 
            unit: "level", 
            raw: daily 
          });
        }
      }
    }

    // Fetch sleep data
    const sleeps = await garminApiRequest("/sleeps", {
      uploadStartTimeInSeconds: startTimestamp,
      uploadEndTimeInSeconds: endTimestamp,
    });

    if (sleeps && Array.isArray(sleeps)) {
      console.log(`Processing ${sleeps.length} Garmin sleep records`);
      
      for (const sleep of sleeps) {
        const date = sleep.calendarDate || format(new Date(sleep.startTimeInSeconds * 1000), "yyyy-MM-dd");
        if (sleep.durationInSeconds) {
          healthData.push({
            type: "sleep",
            date,
            value: Math.round(sleep.durationInSeconds / 60),
            unit: "minutes",
            raw: sleep,
          });
        }
      }
    }

    // Fetch activities/workouts
    const activities = await garminApiRequest("/activities", {
      uploadStartTimeInSeconds: startTimestamp,
      uploadEndTimeInSeconds: endTimestamp,
    });

    if (activities && Array.isArray(activities)) {
      console.log(`Processing ${activities.length} Garmin activity records`);
      
      for (const activity of activities) {
        const date = format(new Date(activity.startTimeInSeconds * 1000), "yyyy-MM-dd");
        healthData.push({
          type: "workout",
          date,
          value: Math.round((activity.durationInSeconds || 0) / 60),
          unit: "minutes",
          raw: activity,
        });
      }
    }

  } catch (error) {
    console.error("Error fetching Garmin data:", error);
  }

  return healthData;
}
