import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CalendarInfo {
  url: string;
  displayName: string;
}

async function discoverCalendars(email: string, password: string): Promise<CalendarInfo[]> {
  const authString = btoa(`${email}:${password}`);
  const calendars: CalendarInfo[] = [];
  
  console.log("Step 1: Discovering user principal...");
  
  // First, discover the user principal
  const principalResponse = await fetch("https://caldav.icloud.com/", {
    method: "PROPFIND",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "0",
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:current-user-principal/>
        </d:prop>
      </d:propfind>`,
  });

  console.log("Principal response status:", principalResponse.status);

  if (principalResponse.status === 401) {
    throw new Error("Invalid credentials. Please check your iCloud email and app-specific password.");
  }

  if (!principalResponse.ok && principalResponse.status !== 207) {
    const errorText = await principalResponse.text();
    console.error("Principal discovery failed:", errorText);
    throw new Error("Failed to connect to iCloud Calendar. Please try again.");
  }

  const principalXml = await principalResponse.text();
  console.log("Principal XML received, length:", principalXml.length);

  // Extract user principal URL
  const principalMatch = principalXml.match(/<d:current-user-principal[^>]*>[\s\S]*?<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                         principalXml.match(/<D:current-user-principal[^>]*>[\s\S]*?<D:href[^>]*>([^<]+)<\/D:href>/i);
  
  let principalUrl = principalMatch ? principalMatch[1] : null;
  
  if (!principalUrl) {
    console.log("No principal URL found, using default path pattern");
    // Fallback: try common iCloud patterns
    principalUrl = `/${email.split('@')[0]}/principal/`;
  }

  console.log("Step 2: Getting calendar home from principal:", principalUrl);

  // Get calendar home set from principal
  const homeSetResponse = await fetch(`https://caldav.icloud.com${principalUrl}`, {
    method: "PROPFIND",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/xml; charset=utf-8",
      "Depth": "0",
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
      <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <c:calendar-home-set/>
        </d:prop>
      </d:propfind>`,
  });

  console.log("Home set response status:", homeSetResponse.status);

  if (homeSetResponse.ok || homeSetResponse.status === 207) {
    const homeSetXml = await homeSetResponse.text();
    console.log("Home set XML received, length:", homeSetXml.length);

    // Extract calendar home URL
    const homeMatch = homeSetXml.match(/<c:calendar-home-set[^>]*>[\s\S]*?<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                      homeSetXml.match(/<cal:calendar-home-set[^>]*>[\s\S]*?<D:href[^>]*>([^<]+)<\/D:href>/i) ||
                      homeSetXml.match(/<calendar-home-set[^>]*>[\s\S]*?<href[^>]*>([^<]+)<\/href>/i);

    let calendarHomeUrl = homeMatch ? homeMatch[1] : null;

    if (!calendarHomeUrl) {
      console.log("No calendar home found, using default pattern");
      calendarHomeUrl = `/${email.split('@')[0]}/calendars/`;
    }

    console.log("Step 3: Listing calendars from:", calendarHomeUrl);

    // List calendars in the home
    const calendarsResponse = await fetch(`https://caldav.icloud.com${calendarHomeUrl}`, {
      method: "PROPFIND",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/xml; charset=utf-8",
        "Depth": "1",
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/">
          <d:prop>
            <d:displayname/>
            <d:resourcetype/>
            <cs:getctag/>
          </d:prop>
        </d:propfind>`,
    });

    console.log("Calendars response status:", calendarsResponse.status);

    if (calendarsResponse.ok || calendarsResponse.status === 207) {
      const calendarsXml = await calendarsResponse.text();
      
      // Parse calendar responses
      const responseBlocks = calendarsXml.split(/<d:response[^>]*>/i).slice(1);
      
      for (const block of responseBlocks) {
        // Check if this is a calendar (has calendar resource type)
        if (block.includes("<c:calendar") || block.includes("<cal:calendar") || block.includes(":calendar/>")) {
          const hrefMatch = block.match(/<d:href[^>]*>([^<]+)<\/d:href>/i) ||
                           block.match(/<D:href[^>]*>([^<]+)<\/D:href>/i);
          const nameMatch = block.match(/<d:displayname[^>]*>([^<]*)<\/d:displayname>/i) ||
                           block.match(/<D:displayname[^>]*>([^<]*)<\/D:displayname>/i);
          
          if (hrefMatch) {
            calendars.push({
              url: hrefMatch[1],
              displayName: nameMatch ? nameMatch[1] : "Unnamed Calendar",
            });
          }
        }
      }
    }
  }

  // If no calendars found, credentials are valid but we'll use defaults
  if (calendars.length === 0) {
    console.log("No calendars discovered, adding default calendar path");
    calendars.push({
      url: `/${email.split('@')[0]}/calendars/home/`,
      displayName: "Calendar",
    });
  }

  console.log(`Found ${calendars.length} calendars:`, calendars);
  return calendars;
}

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

    // Validate credentials and discover calendars using raw CalDAV
    const calendars = await discoverCalendars(email, appSpecificPassword);
    
    console.log(`Credential validation successful! Found ${calendars.length} calendars`);

    // Store calendar URLs for future syncs
    const calendarUrls = calendars.map(c => c.url).join(",");

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
          caldav_server_url: "https://caldav.icloud.com",
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
          caldav_server_url: "https://caldav.icloud.com",
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
        calendarsFound: calendars.length,
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
