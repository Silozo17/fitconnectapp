import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const ZOOM_CLIENT_ID = Deno.env.get("ZOOM_CLIENT_ID");
const ZOOM_CLIENT_SECRET = Deno.env.get("ZOOM_CLIENT_SECRET");

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
    console.log("Processing video OAuth callback for:", provider, userId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const redirectUri = `${SUPABASE_URL}/functions/v1/video-oauth-callback`;

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresIn: number | undefined;
    let providerUserId: string | undefined;

    switch (provider) {
      case "zoom":
        const zoomAuth = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);
        const zoomResponse = await fetch("https://zoom.us/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${zoomAuth}`,
          },
          body: new URLSearchParams({
            code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });
        const zoomData = await zoomResponse.json();
        if (zoomData.error) throw new Error(zoomData.error);
        accessToken = zoomData.access_token;
        refreshToken = zoomData.refresh_token;
        expiresIn = zoomData.expires_in;

        // Get Zoom user ID
        const zoomUserResponse = await fetch("https://api.zoom.us/v2/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const zoomUser = await zoomUserResponse.json();
        providerUserId = zoomUser.id;
        break;

      case "google_meet":
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

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Get coach profile ID
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!coachProfile) throw new Error("Coach profile not found");

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    await supabase.from("video_conference_settings").upsert({
      coach_id: coachProfile.id,
      provider,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      provider_user_id: providerUserId,
      is_active: true,
    }, { onConflict: "coach_id,provider" });

    console.log("Video conference settings saved successfully");

    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard/coach/integrations?connected=" + provider },
    });
  } catch (error: any) {
    console.error("Error in video-oauth-callback:", error);
    return new Response(`Error: ${error?.message || "Unknown error"}`, { status: 500 });
  }
});
