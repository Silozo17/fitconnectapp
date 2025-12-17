import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Apple iCloud CalDAV endpoint
const APPLE_CALDAV_URL = "https://caldav.icloud.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create client with user's auth
    const supabaseUser = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { email, appSpecificPassword, provider } = await req.json();
    
    console.log(`CalDAV connect attempt for provider: ${provider}, user: ${user.id}`);

    if (!email || !appSpecificPassword) {
      throw new Error("Email and app-specific password are required");
    }

    if (provider !== "apple_calendar") {
      throw new Error("Only Apple Calendar (iCloud) is supported for CalDAV");
    }

    // Validate CalDAV credentials by making a PROPFIND request to iCloud
    const credentials = btoa(`${email}:${appSpecificPassword}`);
    
    const caldavResponse = await fetch(`${APPLE_CALDAV_URL}/`, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/xml",
        "Depth": "0",
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <d:propfind xmlns:d="DAV:">
          <d:prop>
            <d:current-user-principal/>
          </d:prop>
        </d:propfind>`,
    });

    console.log(`CalDAV validation response status: ${caldavResponse.status}`);

    if (caldavResponse.status === 401) {
      throw new Error("Invalid credentials. Please check your iCloud email and app-specific password.");
    }

    if (!caldavResponse.ok && caldavResponse.status !== 207) {
      throw new Error(`CalDAV connection failed: ${caldavResponse.statusText}`);
    }

    // Use service role to store the connection securely
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if connection already exists
    const { data: existing } = await supabaseAdmin
      .from("calendar_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "apple_calendar")
      .single();

    // Encrypt credentials (in production, use proper encryption)
    // For now, we store as base64 - you should implement proper encryption with vault
    const encryptedCredentials = btoa(JSON.stringify({ email, password: appSpecificPassword }));

    if (existing) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from("calendar_connections")
        .update({
          access_token: encryptedCredentials,
          connection_type: "caldav",
          caldav_server_url: APPLE_CALDAV_URL,
          sync_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;
      console.log(`Updated existing CalDAV connection for user: ${user.id}`);
    } else {
      // Create new connection
      const { error: insertError } = await supabaseAdmin
        .from("calendar_connections")
        .insert({
          user_id: user.id,
          provider: "apple_calendar",
          access_token: encryptedCredentials,
          connection_type: "caldav",
          caldav_server_url: APPLE_CALDAV_URL,
          sync_enabled: true,
        });

      if (insertError) throw insertError;
      console.log(`Created new CalDAV connection for user: ${user.id}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Apple Calendar connected successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in calendar-caldav-connect:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
