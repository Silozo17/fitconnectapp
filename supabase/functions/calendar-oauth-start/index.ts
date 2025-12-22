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

    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { provider, returnPath } = await req.json();

    console.log("Starting calendar connection for provider:", provider, "returnPath:", returnPath);

    const redirectUri = `${SUPABASE_URL}/functions/v1/calendar-oauth-callback`;
    const state = btoa(JSON.stringify({ userId: user.id, provider, returnPath }));

    // ---- GOOGLE CALENDAR (OAuth) ----
    if (provider === "google_calendar") {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error("Google OAuth not configured. Please add GOOGLE_CLIENT_ID secret.");
      }

      const calendarScopes = [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.readonly",
      ].join(" ");

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(calendarScopes)}` +
        `&state=${state}` +
        `&access_type=offline` +
        `&prompt=consent`;

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- APPLE CALENDAR (CalDAV) ----
    if (provider === "apple_calendar") {
      // Apple uses CalDAV, not OAuth
      // Frontend should open AppleCalendarConnectModal
      return new Response(JSON.stringify({ requiresCalDAV: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error: any) {
    console.error("Error in calendar-oauth-start:", error);

    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
