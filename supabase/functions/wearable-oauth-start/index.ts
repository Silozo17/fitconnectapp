import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID");
const GARMIN_CONSUMER_KEY = Deno.env.get("GARMIN_CONSUMER_KEY");
const GARMIN_CONSUMER_SECRET = Deno.env.get("GARMIN_CONSUMER_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GARMIN_REQUEST_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/request_token";
const GARMIN_AUTHORIZE_URL = "https://connect.garmin.com/oauthConfirm";

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

    const redirectUri = `${SUPABASE_URL}/functions/v1/wearable-oauth-callback`;

    let authUrl: string;
    const state = btoa(JSON.stringify({ userId: user.id, provider }));

    switch (provider) {
      case "health_connect":
        throw new Error(
          "Health Connect requires a native Android app to access health data. " +
          "This feature is coming soon with the FitConnect Android app. " +
          "In the meantime, you can manually log your health data using the 'Log Data' button."
        );

      case "fitbit":
        if (!FITBIT_CLIENT_ID) {
          throw new Error("Fitbit OAuth not configured. Please add FITBIT_CLIENT_ID secret.");
        }
        const fitbitScopes = "activity heartrate sleep profile weight";
        authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(fitbitScopes)}&state=${state}`;
        break;

      case "garmin":
        if (!GARMIN_CONSUMER_KEY || !GARMIN_CONSUMER_SECRET) {
          throw new Error("Garmin OAuth not configured. Please add GARMIN_CONSUMER_KEY and GARMIN_CONSUMER_SECRET secrets.");
        }

        // OAuth 1.0a Step 1: Get request token
        const oauthNonce = generateNonce();
        const oauthTimestamp = generateTimestamp();

        const requestTokenParams: Record<string, string> = {
          oauth_callback: redirectUri,
          oauth_consumer_key: GARMIN_CONSUMER_KEY,
          oauth_nonce: oauthNonce,
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: oauthTimestamp,
          oauth_version: "1.0",
        };

        // Generate signature
        const baseString = generateSignatureBaseString("POST", GARMIN_REQUEST_TOKEN_URL, requestTokenParams);
        const signature = await generateHmacSha1Signature(baseString, GARMIN_CONSUMER_SECRET);
        requestTokenParams.oauth_signature = signature;

        // Make request for temporary token
        const authHeaderStr = generateAuthorizationHeader(requestTokenParams);
        console.log("Requesting Garmin request token...");
        
        const requestTokenResponse = await fetch(GARMIN_REQUEST_TOKEN_URL, {
          method: "POST",
          headers: { Authorization: authHeaderStr },
        });

        if (!requestTokenResponse.ok) {
          const errorText = await requestTokenResponse.text();
          console.error("Garmin request token error:", errorText);
          throw new Error("Failed to get Garmin request token: " + errorText);
        }

        const responseText = await requestTokenResponse.text();
        console.log("Garmin request token response:", responseText);
        
        const tokenParams = new URLSearchParams(responseText);
        const oauthToken = tokenParams.get("oauth_token");
        const oauthTokenSecret = tokenParams.get("oauth_token_secret");

        if (!oauthToken || !oauthTokenSecret) {
          throw new Error("Invalid response from Garmin - missing oauth tokens");
        }

        // Store temporary token secret using service role (needed for access token exchange)
        const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { error: upsertError } = await serviceSupabase
          .from("oauth_temp_tokens")
          .upsert({
            user_id: user.id,
            provider: "garmin",
            oauth_token: oauthToken,
            oauth_token_secret: oauthTokenSecret,
          }, { onConflict: "user_id,provider" });

        if (upsertError) {
          console.error("Error storing temp token:", upsertError);
          throw new Error("Failed to store temporary token");
        }

        console.log("Stored Garmin temp token, redirecting to authorization...");
        
        // Build authorization URL
        authUrl = `${GARMIN_AUTHORIZE_URL}?oauth_token=${oauthToken}`;
        break;

      case "apple_health":
        // This should never be reached if platform detection works correctly
        // Log for debugging if it does get hit
        console.error("Apple Health OAuth requested from non-native context!", {
          userAgent: req.headers.get("User-Agent"),
          userId: user.id,
        });
        throw new Error(
          "Apple Health connection failed - platform detection issue. " +
          "This request should use the native HealthKit flow on iOS. " +
          "Please restart the app and try again. " +
          "If the issue persists, ensure you're using the latest version of the app."
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
