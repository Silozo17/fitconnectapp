import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
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
    console.log("Starting calendar OAuth for provider:", provider);

    const redirectUri = `${SUPABASE_URL}/functions/v1/calendar-oauth-callback`;
    const state = btoa(JSON.stringify({ userId: user.id, provider }));

    let authUrl: string;

    switch (provider) {
      case "google_calendar":
        if (!GOOGLE_CLIENT_ID) {
          throw new Error("Google OAuth not configured. Please add GOOGLE_CLIENT_ID secret.");
        }
        const calendarScopes = [
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar.readonly",
        ].join(" ");
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(calendarScopes)}&state=${state}&access_type=offline&prompt=consent`;
        break;

      case "apple_calendar":
        throw new Error("Apple Calendar integration requires CalDAV setup - coming soon");

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log("Generated auth URL for calendar provider:", provider);

    return new Response(
      JSON.stringify({ authUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in calendar-oauth-start:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
