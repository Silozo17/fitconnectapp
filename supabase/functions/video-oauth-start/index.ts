import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const ZOOM_CLIENT_ID = Deno.env.get("ZOOM_CLIENT_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { provider } = await req.json();
    console.log("Starting video OAuth for provider:", provider);

    const redirectUri = `${SUPABASE_URL}/functions/v1/video-oauth-callback`;
    const state = btoa(JSON.stringify({ userId: user.id, provider }));

    let authUrl: string;

    switch (provider) {
      case "zoom":
        if (!ZOOM_CLIENT_ID) {
          throw new Error("Zoom OAuth not configured. Please add ZOOM_CLIENT_ID secret.");
        }
        authUrl = `https://zoom.us/oauth/authorize?client_id=${ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        break;

      case "google_meet":
        if (!GOOGLE_CLIENT_ID) {
          throw new Error("Google OAuth not configured. Please add GOOGLE_CLIENT_ID secret.");
        }
        const meetScopes = [
          "https://www.googleapis.com/auth/calendar.events",
        ].join(" ");
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(meetScopes)}&state=${state}&access_type=offline&prompt=consent`;
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log("Generated auth URL for video provider:", provider);

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in video-oauth-start:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
