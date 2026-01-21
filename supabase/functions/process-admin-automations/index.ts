import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  target_audience: string;
  audience_filters: Record<string, any>;
  message_type: string;
  message_template: string;
  message_subject: string | null;
  cooldown_days: number | null;
  max_sends_per_user: number | null;
  priority: number;
}

interface UserData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  role: "client" | "coach";
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting admin automation processing...");

    // Fetch all enabled automation rules
    const { data: rules, error: rulesError } = await supabase
      .from("admin_automation_rules")
      .select("*")
      .eq("is_enabled", true)
      .order("priority", { ascending: false });

    if (rulesError) {
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    console.log(`Found ${rules?.length || 0} enabled automation rules`);

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
    };

    for (const rule of rules || []) {
      try {
        const users = await getUsersForTrigger(supabase, rule);
        console.log(`Rule "${rule.name}": Found ${users.length} potential users`);

        for (const user of users) {
          results.processed++;

          // Check cooldown
          if (rule.cooldown_days) {
            const cooldownDate = new Date();
            cooldownDate.setDate(cooldownDate.getDate() - rule.cooldown_days);

            const { data: recentLog } = await supabase
              .from("admin_automation_logs")
              .select("id")
              .eq("rule_id", rule.id)
              .eq("user_id", user.user_id)
              .gte("created_at", cooldownDate.toISOString())
              .limit(1)
              .single();

            if (recentLog) {
              console.log(`Skipping user ${user.user_id}: cooldown active`);
              await logAutomation(supabase, rule, user.user_id, "skipped", null, "Cooldown active");
              results.skipped++;
              continue;
            }
          }

          // Check max sends per user
          if (rule.max_sends_per_user) {
            const { count } = await supabase
              .from("admin_automation_logs")
              .select("id", { count: "exact", head: true })
              .eq("rule_id", rule.id)
              .eq("user_id", user.user_id)
              .eq("status", "sent");

            if ((count || 0) >= rule.max_sends_per_user) {
              console.log(`Skipping user ${user.user_id}: max sends reached`);
              await logAutomation(supabase, rule, user.user_id, "skipped", null, "Max sends reached");
              results.skipped++;
              continue;
            }
          }

          // Process message template
          const message = processTemplate(rule.message_template, user);

          // Parse message channels - handle both array and legacy string formats
          let channels: string[] = [];
          if (Array.isArray(rule.message_type)) {
            channels = rule.message_type;
          } else if (typeof rule.message_type === "string") {
            try {
              const parsed = JSON.parse(rule.message_type);
              channels = Array.isArray(parsed) ? parsed : [rule.message_type];
            } catch {
              // Legacy single value
              if (rule.message_type === "all") {
                channels = ["in_app", "email", "push"];
              } else {
                channels = [rule.message_type];
              }
            }
          }

          // Send message to each selected channel
          try {
            if (channels.includes("in_app")) {
              await sendInAppMessage(supabase, user.user_id, message, rule.name);
            }

            if (channels.includes("push")) {
              await sendPushNotification(supabaseUrl, supabaseServiceKey, user.user_id, rule.name, message);
            }

            if (channels.includes("email")) {
              // Email would go here if implemented
              console.log(`Email sending not yet implemented for user ${user.user_id}`);
            }

            await logAutomation(supabase, rule, user.user_id, "sent", message);
            results.sent++;
            console.log(`Sent automation to user ${user.user_id}`);
          } catch (sendError) {
            console.error(`Failed to send to user ${user.user_id}:`, sendError);
            await logAutomation(supabase, rule, user.user_id, "failed", message, String(sendError));
            results.failed++;
          }
        }
      } catch (ruleError) {
        console.error(`Error processing rule "${rule.name}":`, ruleError);
      }
    }

    console.log("Automation processing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin automation error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getUsersForTrigger(supabase: any, rule: AutomationRule): Promise<UserData[]> {
  const { trigger_type, trigger_config, target_audience } = rule;
  const now = new Date();
  let users: UserData[] = [];

  switch (trigger_type) {
    case "user_signup_client": {
      // New clients in last 30 minutes
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data } = await supabase
        .from("client_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .gte("created_at", thirtyMinAgo.toISOString())
        .eq("is_active", true);
      users = (data || []).map((u: any) => ({ ...u, role: "client" as const }));
      break;
    }

    case "user_signup_coach": {
      // New coaches in last 30 minutes
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .gte("created_at", thirtyMinAgo.toISOString());
      users = (data || []).map((u: any) => ({ ...u, role: "coach" as const }));
      break;
    }

    case "inactive_days": {
      const days = trigger_config.days || 7;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000); // 30 min window

      if (target_audience === "clients" || target_audience === "all") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .lte("updated_at", rangeEnd.toISOString())
          .gte("updated_at", targetDate.toISOString())
          .eq("is_active", true);
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }

      if (target_audience === "coaches" || target_audience === "all") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .lte("updated_at", rangeEnd.toISOString())
          .gte("updated_at", targetDate.toISOString());
        users.push(...(coaches || []).map((u: any) => ({ ...u, role: "coach" as const })));
      }
      break;
    }

    case "no_bookings_days": {
      const days = trigger_config.days || 30;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Get clients with no recent bookings
      const { data: clients } = await supabase
        .from("client_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .eq("is_active", true);

      for (const client of clients || []) {
        const { data: bookings } = await supabase
          .from("coaching_sessions")
          .select("id")
          .eq("client_id", client.id)
          .gte("created_at", cutoffDate.toISOString())
          .limit(1);

        if (!bookings || bookings.length === 0) {
          users.push({ ...client, role: "client" as const });
        }
      }
      break;
    }

    case "coach_verified": {
      // Coaches verified in last 30 minutes
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, user_id, first_name, last_name, created_at, updated_at")
        .eq("verified", true)
        .gte("updated_at", thirtyMinAgo.toISOString());
      users = (data || []).map((u: any) => ({ ...u, role: "coach" as const }));
      break;
    }

    case "onboarding_incomplete": {
      const days = trigger_config.days || 2;
      const targetDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const rangeEnd = new Date(targetDate.getTime() + 30 * 60 * 1000);

      if (target_audience === "clients" || target_audience === "all") {
        const { data: clients } = await supabase
          .from("client_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .eq("onboarding_completed", false)
          .lte("created_at", rangeEnd.toISOString())
          .gte("created_at", targetDate.toISOString());
        users.push(...(clients || []).map((u: any) => ({ ...u, role: "client" as const })));
      }

      if (target_audience === "coaches" || target_audience === "all") {
        const { data: coaches } = await supabase
          .from("coach_profiles")
          .select("id, user_id, first_name, last_name, created_at, updated_at")
          .eq("onboarding_completed", false)
          .lte("created_at", rangeEnd.toISOString())
          .gte("created_at", targetDate.toISOString());
        users.push(...(coaches || []).map((u: any) => ({ ...u, role: "coach" as const })));
      }
      break;
    }

    // Add more trigger types as needed
    default:
      console.log(`Trigger type "${trigger_type}" not implemented yet`);
  }

  return users;
}

function processTemplate(template: string, user: UserData): string {
  const now = new Date();
  const createdAt = new Date(user.created_at);
  const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
  const updatedAt = new Date(user.updated_at);
  const inactiveDays = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000));

  return template
    .replace(/{first_name}/g, user.first_name || "there")
    .replace(/{last_name}/g, user.last_name || "")
    .replace(/{role}/g, user.role)
    .replace(/{account_age_days}/g, String(accountAgeDays))
    .replace(/{days_inactive}/g, String(inactiveDays));
}

async function sendInAppMessage(
  supabase: any,
  userId: string,
  message: string,
  automationName: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "automation",
    title: "FitConnect",
    message: message,
    metadata: { automation_name: automationName },
  });
}

async function sendPushNotification(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  title: string,
  message: string
) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        userIds: [userId],
        title: "FitConnect",
        message: message,
        useExternalUserIds: true,
      }),
    });
  } catch (error) {
    console.error("Push notification error:", error);
  }
}

async function logAutomation(
  supabase: any,
  rule: AutomationRule,
  userId: string,
  status: "sent" | "failed" | "skipped",
  messageContent: string | null,
  errorMessage?: string
) {
  await supabase.from("admin_automation_logs").insert({
    rule_id: rule.id,
    user_id: userId,
    trigger_type: rule.trigger_type,
    message_type: rule.message_type,
    message_content: messageContent,
    status,
    error_message: errorMessage || null,
  });
}
