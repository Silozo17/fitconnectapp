import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
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
    console.log("Processing calendar OAuth callback for:", provider, userId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const redirectUri = `${SUPABASE_URL}/functions/v1/calendar-oauth-callback`;

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresIn: number | undefined;
    let calendarId: string | undefined;

    switch (provider) {
      case "google_calendar":
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
        calendarId = "primary"; // Use primary calendar by default
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    await supabase.from("calendar_connections").upsert({
      user_id: userId,
      provider,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      calendar_id: calendarId,
      sync_enabled: true,
    }, { onConflict: "user_id,provider" });

    console.log("Calendar connection saved successfully");

    // Get the app URL
    const appUrl = Deno.env.get("APP_URL") || "https://9eda5b28-1d63-4ce1-a014-082ad965f0d2.lovableproject.com";

    // Determine redirect based on user role
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const redirectPath = coachProfile
      ? "/dashboard/coach/integrations"
      : "/dashboard/client/integrations";

    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}${redirectPath}?connected=${provider}` },
    });
  } catch (error: any) {
    console.error("Error in calendar-oauth-callback:", error);
    return new Response(`Error: ${error?.message || "Unknown error"}`, { status: 500 });
  }
});
