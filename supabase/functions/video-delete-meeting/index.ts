import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteMeetingRequest {
  sessionId?: string;
  meetingId: string;
  provider: "zoom" | "google_meet";
  coachId: string;
}

async function refreshZoomToken(supabase: any, settingsId: string, refreshToken: string): Promise<string | null> {
  const zoomClientId = Deno.env.get("ZOOM_CLIENT_ID");
  const zoomClientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");

  if (!zoomClientId || !zoomClientSecret) {
    console.error("Zoom credentials not configured");
    return null;
  }

  try {
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${zoomClientId}:${zoomClientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Zoom token:", await response.text());
      return null;
    }

    const data = await response.json();
    
    // Update stored tokens
    await supabase
      .from("video_conference_settings")
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq("id", settingsId);

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Zoom token:", error);
    return null;
  }
}

async function refreshGoogleToken(supabase: any, settingsId: string, refreshToken: string): Promise<string | null> {
  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!googleClientId || !googleClientSecret) {
    console.error("Google credentials not configured");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: googleClientId,
        client_secret: googleClientSecret,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Google token:", await response.text());
      return null;
    }

    const data = await response.json();
    
    // Update stored tokens
    await supabase
      .from("video_conference_settings")
      .update({
        access_token: data.access_token,
        token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq("id", settingsId);

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return null;
  }
}

async function deleteZoomMeeting(accessToken: string, meetingId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.status === 200) {
      console.log("Zoom meeting deleted successfully");
      return true;
    }

    // 404 means meeting already deleted or doesn't exist - treat as success
    if (response.status === 404) {
      console.log("Zoom meeting not found (already deleted)");
      return true;
    }

    console.error("Failed to delete Zoom meeting:", response.status, await response.text());
    return false;
  } catch (error) {
    console.error("Error deleting Zoom meeting:", error);
    return false;
  }
}

async function deleteGoogleMeetEvent(accessToken: string, eventId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204 || response.status === 200) {
      console.log("Google Meet event deleted successfully");
      return true;
    }

    // 404 means event already deleted or doesn't exist - treat as success
    if (response.status === 404 || response.status === 410) {
      console.log("Google Meet event not found (already deleted)");
      return true;
    }

    console.error("Failed to delete Google Meet event:", response.status, await response.text());
    return false;
  } catch (error) {
    console.error("Error deleting Google Meet event:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { meetingId, provider, coachId, sessionId }: DeleteMeetingRequest = await req.json();

    if (!meetingId || !provider || !coachId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: meetingId, provider, coachId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleting ${provider} meeting: ${meetingId} for coach: ${coachId}`);

    // Get coach's video settings
    const { data: settings, error: settingsError } = await supabase
      .from("video_conference_settings")
      .select("id, access_token, refresh_token, token_expires_at")
      .eq("coach_id", coachId)
      .eq("provider", provider)
      .eq("is_active", true)
      .single();

    if (settingsError || !settings) {
      console.error("Video settings not found:", settingsError);
      return new Response(
        JSON.stringify({ error: "Video provider not configured", deleted: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = settings.access_token;

    // Check if token is expired and refresh if needed
    if (settings.token_expires_at) {
      const expiresAt = new Date(settings.token_expires_at);
      const now = new Date();
      
      if (expiresAt <= now && settings.refresh_token) {
        console.log("Token expired, refreshing...");
        const newToken = provider === "zoom"
          ? await refreshZoomToken(supabase, settings.id, settings.refresh_token)
          : await refreshGoogleToken(supabase, settings.id, settings.refresh_token);
        
        if (newToken) {
          accessToken = newToken;
        } else {
          console.error("Failed to refresh token");
          return new Response(
            JSON.stringify({ error: "Token refresh failed", deleted: false }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Delete the meeting
    let deleted = false;
    if (provider === "zoom") {
      deleted = await deleteZoomMeeting(accessToken, meetingId);
    } else if (provider === "google_meet") {
      deleted = await deleteGoogleMeetEvent(accessToken, meetingId);
    }

    console.log(`Meeting deletion result: ${deleted}`);

    return new Response(
      JSON.stringify({ success: true, deleted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in video-delete-meeting:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, deleted: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
