import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for session tokens (we don't store actual tokens)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Parse user agent to get device info (case-insensitive)
function parseUserAgent(ua: string): { deviceInfo: string; platform: string } {
  let deviceInfo = "Unknown device";
  let platform = "web";

  // Convert to lowercase for case-insensitive matching
  const uaLower = ua.toLowerCase();

  // Check for Despia native app FIRST (highest priority)
  const isDespia = uaLower.includes("despia");

  // Check for mobile devices
  if (uaLower.includes("iphone")) {
    deviceInfo = "iPhone";
    platform = "ios";
  } else if (uaLower.includes("ipad")) {
    deviceInfo = "iPad";
    platform = "ios";
  } else if (uaLower.includes("android")) {
    if (uaLower.includes("mobile")) {
      deviceInfo = "Android Phone";
    } else {
      deviceInfo = "Android Tablet";
    }
    platform = "android";
  } else if (uaLower.includes("windows")) {
    deviceInfo = "Windows PC";
    platform = "web";
  } else if (uaLower.includes("macintosh") || uaLower.includes("mac os")) {
    deviceInfo = "Mac";
    platform = "web";
  } else if (uaLower.includes("linux")) {
    deviceInfo = "Linux PC";
    platform = "web";
  }

  // Add browser info ONLY for non-native (web) sessions
  if (!isDespia) {
    if (uaLower.includes("chrome") && !uaLower.includes("edg")) {
      deviceInfo += " • Chrome";
    } else if (uaLower.includes("firefox")) {
      deviceInfo += " • Firefox";
    } else if (uaLower.includes("safari") && !uaLower.includes("chrome")) {
      deviceInfo += " • Safari";
    } else if (uaLower.includes("edg")) {
      deviceInfo += " • Edge";
    }
  }

  // Mark as native FitConnect app if in Despia environment
  if (isDespia) {
    deviceInfo += " • FitConnect App";
  }

  return { deviceInfo, platform };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract token from header
    const token = authHeader.replace("Bearer ", "");

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for authentication
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for database operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user (use user client for auth)
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userAgent, isUpdate = false } = await req.json().catch(() => ({}));

    // Hash the token
    const tokenHash = await hashToken(token);

    // Parse user agent
    const ua = userAgent || req.headers.get("user-agent") || "";
    const { deviceInfo, platform } = parseUserAgent(ua);

    // Get IP-based location (country only - no precise location)
    let ipCountry = null;
    let ipRegion = null;

    try {
      // Get client IP
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

      if (clientIp && clientIp !== "unknown" && clientIp !== "127.0.0.1") {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          ipCountry = geoData.country_name || null;
          ipRegion = geoData.region || null;
        }
      }
    } catch (geoError) {
      console.error("[track-session] Geo lookup error:", geoError);
    }

    console.log(`[track-session] ${isUpdate ? "Updating" : "Creating"} session for user: ${user.id}`);

    if (isUpdate) {
      // Just update last_seen_at
      const { error } = await supabase
        .from("user_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("session_token_hash", tokenHash);

      if (error) {
        console.error("[track-session] Update error:", error);
      }
    } else {
      // Mark all other sessions as not current
      await supabase
        .from("user_sessions")
        .update({ is_current: false })
        .eq("user_id", user.id);

      // Upsert the session
      const { error } = await supabase
        .from("user_sessions")
        .upsert(
          {
            user_id: user.id,
            session_token_hash: tokenHash,
            device_info: deviceInfo,
            platform,
            ip_country: ipCountry,
            ip_region: ipRegion,
            last_seen_at: new Date().toISOString(),
            is_current: true,
            is_active: true,
          },
          { onConflict: "session_token_hash" }
        );

      if (error) {
        console.error("[track-session] Upsert error:", error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[track-session] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
