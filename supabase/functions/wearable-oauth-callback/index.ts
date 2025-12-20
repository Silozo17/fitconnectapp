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

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID");
const FITBIT_CLIENT_SECRET = Deno.env.get("FITBIT_CLIENT_SECRET");
const GARMIN_CONSUMER_KEY = Deno.env.get("GARMIN_CONSUMER_KEY");
const GARMIN_CONSUMER_SECRET = Deno.env.get("GARMIN_CONSUMER_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GARMIN_ACCESS_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/access_token";

serve(async (req) => {
  const url = new URL(req.url);
  const appUrl = Deno.env.get("APP_URL") || "https://getfitconnect.co.uk";
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const redirectUri = `${SUPABASE_URL}/functions/v1/wearable-oauth-callback`;

  // Check for OAuth 1.0a callback (Garmin) - has oauth_token and oauth_verifier
  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  const isGarminCallback = !!oauthVerifier && !!oauthToken;

  // Check for OAuth 2.0 callback - has code and state
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}/dashboard/client/integrations?error=${error}` },
    });
  }

  try {
    if (isGarminCallback) {
      // =====================================================
      // Garmin OAuth 1.0a Flow
      // =====================================================
      console.log("Processing Garmin OAuth 1.0a callback");

      if (!GARMIN_CONSUMER_KEY || !GARMIN_CONSUMER_SECRET) {
        throw new Error("Garmin OAuth not configured");
      }

      // Retrieve stored temporary token secret
      const { data: tempToken, error: tempError } = await supabase
        .from("oauth_temp_tokens")
        .select("user_id, oauth_token_secret")
        .eq("oauth_token", oauthToken)
        .single();

      if (tempError || !tempToken) {
        console.error("Temp token lookup error:", tempError);
        throw new Error("OAuth session expired. Please try again.");
      }

      const userId = tempToken.user_id;
      const oauthTokenSecret = tempToken.oauth_token_secret;

      console.log("Found temp token for user:", userId);

      // Exchange for access token
      const oauthNonce = generateNonce();
      const oauthTimestamp = generateTimestamp();

      const accessTokenParams: Record<string, string> = {
        oauth_consumer_key: GARMIN_CONSUMER_KEY,
        oauth_nonce: oauthNonce,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: oauthTimestamp,
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
        oauth_version: "1.0",
      };

      const baseString = generateSignatureBaseString("POST", GARMIN_ACCESS_TOKEN_URL, accessTokenParams);
      const signature = await generateHmacSha1Signature(baseString, GARMIN_CONSUMER_SECRET, oauthTokenSecret);
      accessTokenParams.oauth_signature = signature;

      const authHeader = generateAuthorizationHeader(accessTokenParams);
      console.log("Exchanging Garmin tokens...");

      const accessTokenResponse = await fetch(GARMIN_ACCESS_TOKEN_URL, {
        method: "POST",
        headers: { Authorization: authHeader },
      });

      if (!accessTokenResponse.ok) {
        const errorText = await accessTokenResponse.text();
        console.error("Garmin access token error:", errorText);
        throw new Error("Failed to get Garmin access token");
      }

      const responseText = await accessTokenResponse.text();
      console.log("Garmin access token response received");
      
      const tokenParams = new URLSearchParams(responseText);
      const accessToken = tokenParams.get("oauth_token");
      const accessTokenSecret = tokenParams.get("oauth_token_secret");

      if (!accessToken || !accessTokenSecret) {
        throw new Error("Invalid access token response from Garmin");
      }

      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!clientProfile) throw new Error("Client profile not found");

      // Store connection with token secret (OAuth 1.0a tokens don't expire)
      const { error: upsertError } = await supabase
        .from("wearable_connections")
        .upsert({
          client_id: clientProfile.id,
          provider: "garmin",
          access_token: accessToken,
          token_secret: accessTokenSecret,
          refresh_token: null,
          token_expires_at: null,
          is_active: true,
        }, { onConflict: "client_id,provider" });

      if (upsertError) {
        console.error("Error storing Garmin connection:", upsertError);
        throw new Error("Failed to store Garmin connection");
      }

      // Clean up temporary token
      await supabase
        .from("oauth_temp_tokens")
        .delete()
        .eq("oauth_token", oauthToken);

      console.log("Garmin connection saved successfully");

      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/dashboard/client/integrations?connected=garmin` },
      });

    } else if (code && state) {
      // =====================================================
      // OAuth 2.0 Flow (Google Fit, Fitbit)
      // =====================================================
      const { userId, provider } = JSON.parse(atob(state));
      console.log("Processing OAuth 2.0 callback for:", provider, userId);

      let accessToken: string;
      let refreshToken: string | undefined;
      let expiresIn: number | undefined;
      let providerUserId: string | undefined;

      switch (provider) {
        case "google_fit":
          const googleResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: GOOGLE_CLIENT_ID!,
              client_secret: GOOGLE_CLIENT_SECRET!,
              redirect_uri: redirectUri,
              grant_type: "authorization_code",
            }),
          });
          const googleData = await googleResponse.json();
          if (googleData.error) throw new Error(googleData.error_description);
          accessToken = googleData.access_token;
          refreshToken = googleData.refresh_token;
          expiresIn = googleData.expires_in;
          break;

        case "fitbit":
          const fitbitAuth = btoa(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`);
          const fitbitResponse = await fetch("https://api.fitbit.com/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${fitbitAuth}`,
            },
            body: new URLSearchParams({
              code,
              client_id: FITBIT_CLIENT_ID!,
              redirect_uri: redirectUri,
              grant_type: "authorization_code",
            }),
          });
          const fitbitData = await fitbitResponse.json();
          if (fitbitData.errors) throw new Error(fitbitData.errors[0].message);
          accessToken = fitbitData.access_token;
          refreshToken = fitbitData.refresh_token;
          expiresIn = fitbitData.expires_in;
          providerUserId = fitbitData.user_id;
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Get client profile ID
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!clientProfile) throw new Error("Client profile not found");

      // Store connection
      const tokenExpiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null;

      await supabase.from("wearable_connections").upsert({
        client_id: clientProfile.id,
        provider,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        provider_user_id: providerUserId,
        is_active: true,
      }, { onConflict: "client_id,provider" });

      console.log("Wearable connection saved successfully");

      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/dashboard/client/integrations?connected=${provider}` },
      });

    } else {
      throw new Error("Invalid OAuth callback - missing required parameters");
    }

  } catch (error: any) {
    console.error("Error in wearable-oauth-callback:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}/dashboard/client/integrations?error=${encodeURIComponent(error?.message || "Unknown error")}` },
    });
  }
});
