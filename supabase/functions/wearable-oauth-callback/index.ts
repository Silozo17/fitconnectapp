import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const FITBIT_CLIENT_ID = Deno.env.get("FITBIT_CLIENT_ID");
const FITBIT_CLIENT_SECRET = Deno.env.get("FITBIT_CLIENT_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle OAuth callback as GET request
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return new Response(`OAuth error: ${error}`, { status: 400 });
  }

  if (!code || !state) {
    return new Response("Missing code or state", { status: 400 });
  }

  try {
    const { userId, provider } = JSON.parse(atob(state));
    console.log("Processing OAuth callback for:", provider, userId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const redirectUri = `${SUPABASE_URL}/functions/v1/wearable-oauth-callback`;

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

    // Redirect back to integrations page
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard/client/integrations?connected=" + provider,
      },
    });
  } catch (error: any) {
    console.error("Error in wearable-oauth-callback:", error);
    return new Response(`Error: ${error?.message || "Unknown error"}`, { status: 500 });
  }
});
