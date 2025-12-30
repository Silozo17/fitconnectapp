import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyShowcaseConsentRequest {
  type: "request" | "granted" | "denied";
  // For "request" - coach requesting consent from client
  coachId?: string;
  clientUserId?: string;
  coachName?: string;
  // For "granted" / "denied" - client responding to coach
  coachUserId?: string;
  clientName?: string;
  consentType?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NotifyShowcaseConsentRequest = await req.json();
    const { type, coachId, clientUserId, coachName, coachUserId, clientName, consentType } = body;

    console.log(`Processing showcase consent notification: type=${type}`);

    let targetUserId: string;
    let title: string;
    let subtitle: string;
    let message: string;
    let notificationType: string;
    let notificationData: Record<string, unknown> = {};

    if (type === "request") {
      // Coach requesting consent from client
      if (!clientUserId || !coachId) {
        throw new Error("clientUserId and coachId required for request type");
      }
      targetUserId = clientUserId;
      title = "Showcase Request";
      subtitle = coachName || "Your coach";
      message = "Would like to feature your transformation";
      notificationType = "showcase_consent_request";
      notificationData = { coachId };
    } else if (type === "granted") {
      // Client granted consent - notify coach
      if (!coachUserId) {
        throw new Error("coachUserId required for granted type");
      }
      targetUserId = coachUserId;
      title = "Consent Granted";
      subtitle = clientName || "A client";
      message = "You can now publish their transformation";
      notificationType = "showcase_consent_granted";
      notificationData = { consentType };
    } else if (type === "denied") {
      // Client denied/revoked consent - notify coach
      if (!coachUserId) {
        throw new Error("coachUserId required for denied type");
      }
      targetUserId = coachUserId;
      title = "Consent Revoked";
      subtitle = clientName || "A client";
      message = "Transformation permission was withdrawn";
      notificationType = "showcase_consent_revoked";
      notificationData = {};
    } else {
      throw new Error(`Invalid type: ${type}`);
    }

    // Check user's push_showcase preference
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("push_showcase")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const pushEnabled = prefs?.push_showcase !== false;

    if (pushEnabled) {
      // Send push notification via send-push-notification function
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: [targetUserId],
          title,
          message: `${subtitle}: ${message}`,
          data: {
            type: notificationType,
            ...notificationData,
          },
        }),
      });

      if (!pushResponse.ok) {
        const errorText = await pushResponse.text();
        console.error("Push notification failed:", errorText);
      } else {
        console.log(`Push notification sent successfully to user ${targetUserId}`);
      }
    } else {
      console.log(`Push notifications disabled for user ${targetUserId}, skipping push`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("Error in notify-showcase-consent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
