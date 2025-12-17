import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID");
const GARMIN_CONSUMER_KEY = Deno.env.get("GARMIN_CONSUMER_KEY");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { provider } = await req.json();
    console.log("Starting OAuth for provider:", provider);

    // Get the redirect URL base from the request origin or use a default
    const origin = req.headers.get("origin") || "https://lovable.dev";
    const redirectUri = `${SUPABASE_URL}/functions/v1/wearable-oauth-callback`;

    let authUrl: string;
    const state = btoa(JSON.stringify({ userId: user.id, provider }));

    switch (provider) {
      case "google_fit":
        if (!GOOGLE_CLIENT_ID) {
          throw new Error("Google OAuth not configured. Please add GOOGLE_CLIENT_ID secret.");
        }
        const googleScopes = [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
          "https://www.googleapis.com/auth/fitness.sleep.read",
          "https://www.googleapis.com/auth/fitness.body.read",
        ].join(" ");
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(googleScopes)}&state=${state}&access_type=offline&prompt=consent`;
        break;

      case "fitbit":
        if (!FITBIT_CLIENT_ID) {
          throw new Error("Fitbit OAuth not configured. Please add FITBIT_CLIENT_ID secret.");
        }
        const fitbitScopes = "activity heartrate sleep profile weight";
        authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(fitbitScopes)}&state=${state}`;
        break;

      case "garmin":
        if (!GARMIN_CONSUMER_KEY) {
          throw new Error("Garmin OAuth not configured. Please add GARMIN_CONSUMER_KEY secret.");
        }
        // Garmin uses OAuth 1.0a which is more complex - simplified here
        authUrl = `https://connect.garmin.com/oauthConfirm?oauth_token=placeholder&oauth_callback=${encodeURIComponent(redirectUri)}&state=${state}`;
        break;

      case "apple_health":
        throw new Error(
          "Apple Health requires a native iOS app to access HealthKit data. " +
          "This feature is coming soon with the FitConnect iOS app. " +
          "In the meantime, you can manually log your health data using the 'Log Data' button."
        );

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log("Generated auth URL for provider:", provider);

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in wearable-oauth-start:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
