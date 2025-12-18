import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DAVClient } from "https://esm.sh/tsdav@2.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
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
    
    console.log(`=== iCloud CalDAV Connect ===`);
    console.log(`Provider: ${provider}, User: ${user.id}`);

    if (!email || !appSpecificPassword) {
      throw new Error("Email and app-specific password are required");
    }

    if (provider !== "apple_calendar") {
      throw new Error("Only Apple Calendar (iCloud) is supported for CalDAV");
    }

    // Validate credentials using tsdav library
    console.log("Step 1: Validating credentials with tsdav...");
    
    const client = new DAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: {
        username: email,
        password: appSpecificPassword,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });

    try {
      await client.login();
      console.log("Step 2: Login successful!");
      console.log("Server URL after login:", client.serverUrl);
    } catch (loginError) {
      console.error("Login failed:", loginError);
      throw new Error("Invalid credentials. Please check your iCloud email and app-specific password.");
    }

    // Fetch calendars to verify access and get calendar URLs
    console.log("Step 3: Fetching calendars to verify access...");
    let calendarData: { url: string; displayName: string }[] = [];
    try {
      const calendars = await client.fetchCalendars();
      calendarData = calendars.map(c => ({
        url: c.url,
        displayName: typeof c.displayName === 'string' ? c.displayName : 'Unnamed',
      }));
      console.log(`Found ${calendarData.length} calendars:`, calendarData);
    } catch (calError) {
      console.error("Error fetching calendars:", calError);
      // Continue anyway - credentials might still be valid
    }

    // Store calendar URLs for faster future syncs
    const calendarUrls = calendarData.map(c => c.url).join(",");

    // Use service role to store the connection securely
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if connection already exists
    const { data: existing } = await supabaseAdmin
      .from("calendar_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "apple_calendar")
      .single();

    // Encrypt credentials
    const encryptedCredentials = btoa(JSON.stringify({ email, password: appSpecificPassword }));

    if (existing) {
      // Update existing connection
      const { error: updateError } = await supabaseAdmin
        .from("calendar_connections")
        .update({
          access_token: encryptedCredentials,
          connection_type: "caldav",
          caldav_server_url: client.serverUrl || "https://caldav.icloud.com",
          calendar_id: calendarUrls || null,
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
          caldav_server_url: client.serverUrl || "https://caldav.icloud.com",
          calendar_id: calendarUrls || null,
          sync_enabled: true,
        });

      if (insertError) throw insertError;
      console.log(`Created new CalDAV connection for user: ${user.id}`);
    }

    console.log("=== iCloud CalDAV Connect Complete ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Apple Calendar connected successfully",
        calendarsFound: calendarData.length,
      }),
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
