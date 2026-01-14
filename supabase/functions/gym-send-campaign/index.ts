import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { 
  baseEmailTemplate, 
  ctaButton, 
  EMAIL_CONFIG 
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  gymId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") || "https://fitconnect.com";
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { campaignId, gymId }: SendCampaignRequest = await req.json();

    console.log(`[gym-send-campaign] Processing campaign: ${campaignId}`);

    // Fetch the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("gym_campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("gym_id", gymId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    // Check if already sent
    if (campaign.status === "completed" || campaign.sent_at) {
      throw new Error("Campaign has already been sent");
    }

    // Fetch gym info
    const { data: gym } = await supabase
      .from("gym_profiles")
      .select("name, slug, primary_color, logo_url")
      .eq("id", gymId)
      .single();

    if (!gym) {
      throw new Error("Gym not found");
    }

    // Build recipient list based on target_audience
    let recipientQuery = supabase
      .from("gym_members")
      .select("id, user_id, first_name, last_name, email")
      .eq("gym_id", gymId);

    switch (campaign.target_audience) {
      case "active":
        recipientQuery = recipientQuery.eq("status", "active");
        break;
      case "inactive":
        recipientQuery = recipientQuery.eq("status", "inactive");
        break;
      case "leads":
        // For leads, query the leads table instead
        const { data: leads } = await supabase
          .from("gym_leads")
          .select("id, first_name, last_name, email")
          .eq("gym_id", gymId)
          .neq("status", "converted");
        
        if (!leads || leads.length === 0) {
          // Update campaign with 0 sent
          await supabase
            .from("gym_campaigns")
            .update({
              status: "completed",
              sent_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              stats: { sent: 0, opened: 0, clicked: 0, failed: 0 },
            })
            .eq("id", campaignId);

          return new Response(
            JSON.stringify({ success: true, sent: 0, message: "No leads found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Process leads
        return await processRecipients(
          supabase,
          campaign,
          gym,
          leads,
          resendApiKey,
          oneSignalAppId,
          oneSignalApiKey,
          siteUrl
        );
      default:
        // all_members - no additional filter
        break;
    }

    const { data: members, error: membersError } = await recipientQuery;

    if (membersError) {
      console.error("[gym-send-campaign] Error fetching members:", membersError);
      throw new Error("Failed to fetch recipients");
    }

    if (!members || members.length === 0) {
      await supabase
        .from("gym_campaigns")
        .update({
          status: "completed",
          sent_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          stats: { sent: 0, opened: 0, clicked: 0, failed: 0 },
        })
        .eq("id", campaignId);

      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No recipients found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return await processRecipients(
      supabase,
      campaign,
      gym,
      members,
      resendApiKey,
      oneSignalAppId,
      oneSignalApiKey,
      siteUrl
    );

  } catch (error: any) {
    console.error("[gym-send-campaign] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processRecipients(
  supabase: any,
  campaign: any,
  gym: any,
  recipients: any[],
  resendApiKey: string | undefined,
  oneSignalAppId: string | undefined,
  oneSignalApiKey: string | undefined,
  siteUrl: string
) {
  const { colors } = EMAIL_CONFIG;
  let sentCount = 0;
  let failedCount = 0;

  console.log(`[gym-send-campaign] Processing ${recipients.length} recipients for ${campaign.campaign_type} campaign`);

  // Update campaign to "sending" status
  await supabase
    .from("gym_campaigns")
    .update({ status: "active", sent_at: new Date().toISOString() })
    .eq("id", campaign.id);

  const subject = campaign.content?.subject || `Message from ${gym.name}`;
  const body = campaign.content?.body || "";

  if (campaign.campaign_type === "email") {
    if (!resendApiKey) {
      throw new Error("Email sending not configured");
    }

    // Send emails in batches of 50
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (recipient) => {
        try {
          const firstName = recipient.first_name || "Member";
          const personalizedBody = body
            .replace(/\{\{first_name\}\}/g, firstName)
            .replace(/\{\{name\}\}/g, `${firstName} ${recipient.last_name || ""}`.trim())
            .replace(/\{\{gym_name\}\}/g, gym.name);

          const emailContent = `
            <div style="text-align: center; margin-bottom: 24px;">
              ${gym.logo_url ? `<img src="${gym.logo_url}" alt="${gym.name}" style="max-height: 60px; margin-bottom: 16px;" />` : ''}
              <h2 style="color: ${colors.text}; margin: 0;">${subject.replace(/\{\{first_name\}\}/g, firstName)}</h2>
            </div>
            
            <div style="color: ${colors.textMuted}; line-height: 1.7; white-space: pre-wrap;">
              ${personalizedBody}
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              ${ctaButton("View Classes", `${siteUrl}/gyms/${gym.slug}`)}
            </div>
            
            <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin-top: 32px;">
              You're receiving this email because you're a member of ${gym.name}.
            </p>
          `;

          const html = baseEmailTemplate(emailContent, subject);

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${gym.name} <support@getfitconnect.co.uk>`,
              to: [recipient.email],
              subject: subject.replace(/\{\{first_name\}\}/g, firstName),
              html,
            }),
          });

          if (emailResponse.ok) {
            sentCount++;
            return { success: true };
          } else {
            failedCount++;
            console.error(`[gym-send-campaign] Failed to send to ${recipient.email}`);
            return { success: false };
          }
        } catch (err) {
          failedCount++;
          console.error(`[gym-send-campaign] Error sending to ${recipient.email}:`, err);
          return { success: false };
        }
      });

      await Promise.all(emailPromises);
    }

  } else if (campaign.campaign_type === "push") {
    if (!oneSignalAppId || !oneSignalApiKey) {
      throw new Error("Push notifications not configured");
    }

    // Get user IDs for push notification
    const userIds = recipients
      .filter(r => r.user_id)
      .map(r => r.user_id);

    if (userIds.length > 0) {
      const oneSignalBody = {
        app_id: oneSignalAppId,
        headings: { en: subject },
        contents: { en: body },
        include_external_user_ids: userIds,
        data: {
          type: "gym_campaign",
          gym_id: campaign.gym_id,
          campaign_id: campaign.id,
        },
      };

      const oneSignalResponse = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${oneSignalApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(oneSignalBody),
      });

      if (oneSignalResponse.ok) {
        const result = await oneSignalResponse.json();
        sentCount = result.recipients || userIds.length;
        console.log(`[gym-send-campaign] Push notification sent to ${sentCount} recipients`);
      } else {
        const errorText = await oneSignalResponse.text();
        console.error("[gym-send-campaign] OneSignal error:", errorText);
        failedCount = userIds.length;
      }
    }

  } else if (campaign.campaign_type === "sms") {
    // SMS would require integration with a service like Twilio
    // For now, log that SMS is not configured
    console.log("[gym-send-campaign] SMS sending not configured - skipping");
    throw new Error("SMS sending is not yet configured. Please contact support.");
  }

  // Update campaign status
  await supabase
    .from("gym_campaigns")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      stats: {
        sent: sentCount,
        failed: failedCount,
        opened: 0,
        clicked: 0,
      },
    })
    .eq("id", campaign.id);

  // Log to automation logs
  await supabase.from("gym_automation_logs").insert({
    gym_id: campaign.gym_id,
    automation_type: "campaign",
    action_type: `campaign_sent_${campaign.campaign_type}`,
    status: failedCount === 0 ? "success" : "partial",
    metadata: {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      recipients: recipients.length,
      sent: sentCount,
      failed: failedCount,
    },
  });

  console.log(`[gym-send-campaign] Campaign completed: ${sentCount} sent, ${failedCount} failed`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      sent: sentCount, 
      failed: failedCount,
      total: recipients.length 
    }),
    { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
  );
}
