import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DropoffConfig {
  stage1_days: number;
  stage1_action: "auto_message" | "alert_only";
  stage1_tone: "supportive" | "motivational" | "direct";
  stage1_template?: string;
  stage2_days: number;
  stage2_action: "auto_message" | "alert_only";
  stage3_days: number;
  stage3_action: "ai_assisted" | "auto_message" | "alert_only";
  signals: {
    training_logs: boolean;
    meal_logs: boolean;
    missed_sessions: boolean;
    message_replies: boolean;
    wearable_activity: boolean;
    engagement_score: boolean;
  };
}

const DEFAULT_CONFIG: DropoffConfig = {
  stage1_days: 3,
  stage1_action: "auto_message",
  stage1_tone: "supportive",
  stage2_days: 7,
  stage2_action: "alert_only",
  stage3_days: 14,
  stage3_action: "alert_only",
  signals: {
    training_logs: true,
    meal_logs: true,
    missed_sessions: true,
    message_replies: true,
    wearable_activity: false,
    engagement_score: true,
  },
};

const TONE_MESSAGES = {
  supportive: "Hey {client_name}, just checking in on you! 💙 I noticed we haven't connected in a while. Remember, I'm here to support you - no pressure, just wanted to make sure you're doing okay. Let me know if there's anything I can help with!",
  motivational: "Hey {client_name}! 💪 Missing your energy around here! Remember why you started this journey - you've got so much potential. Let's get back on track together! What do you say?",
  direct: "Hi {client_name}, I noticed you haven't been active lately. I wanted to reach out and see if everything is okay. Let's chat about what's been going on and how we can get you back on track.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Detecting client dropoff...");
    const now = new Date();

    // Get all coaches with dropoff_rescue enabled
    const { data: automationSettings, error: settingsError } = await supabase
      .from("coach_automation_settings")
      .select("*, coach:coach_profiles(id, user_id, display_name)")
      .eq("automation_type", "dropoff_rescue")
      .eq("is_enabled", true);

    if (settingsError) {
      console.error("Error fetching automation settings:", settingsError);
      throw settingsError;
    }

    if (!automationSettings || automationSettings.length === 0) {
      console.log("No coaches have dropoff rescue enabled");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let alerts = 0;
    let messages = 0;

    for (const setting of automationSettings) {
      const config: DropoffConfig = { ...DEFAULT_CONFIG, ...(setting.config as DropoffConfig) };
      const coachId = setting.coach_id;

      // Get all active clients for this coach
      const { data: clients, error: clientsError } = await supabase
        .from("coach_clients")
        .select(`
          client_id,
          client:client_profiles!coach_clients_client_id_fkey(id, user_id, first_name, last_name)
        `)
        .eq("coach_id", coachId)
        .eq("status", "active");

      if (clientsError || !clients) {
        console.error(`Error fetching clients for coach ${coachId}:`, clientsError);
        continue;
      }

      for (const clientRecord of clients) {
        const clientId = clientRecord.client_id;
        const client = clientRecord.client as any;
        const clientName = [client?.first_name, client?.last_name]
          .filter(Boolean)
          .join(" ") || "there";

        // Get current automation status
        const { data: currentStatus } = await supabase
          .from("client_automation_status")
          .select("*")
          .eq("coach_id", coachId)
          .eq("client_id", clientId)
          .maybeSingle();

        // Check if client is muted
        if (currentStatus?.muted_until && new Date(currentStatus.muted_until) > now) {
          continue;
        }

        // Calculate days since last activity based on configured signals
        let lastActivityTimestamp = 0;

        // Check training logs - use logged_at column (not completed_at which doesn't exist)
        if (config.signals.training_logs) {
          const { data: trainingLog } = await supabase
            .from("training_logs")
            .select("logged_at")
            .eq("client_id", clientId)
            .order("logged_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (trainingLog?.logged_at) {
            const logTime = new Date(trainingLog.logged_at).getTime();
            if (logTime > lastActivityTimestamp) {
              lastActivityTimestamp = logTime;
            }
          }
        }

        // Check meal logs
        if (config.signals.meal_logs) {
          const { data: mealLog } = await supabase
            .from("meal_logs")
            .select("logged_at")
            .eq("client_id", clientId)
            .order("logged_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (mealLog?.logged_at) {
            const logTime = new Date(mealLog.logged_at).getTime();
            if (logTime > lastActivityTimestamp) {
              lastActivityTimestamp = logTime;
            }
          }
        }

        // Check messages
        if (config.signals.message_replies) {
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("created_at")
            .eq("sender_id", client?.user_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (lastMessage?.created_at) {
            const msgTime = new Date(lastMessage.created_at).getTime();
            if (msgTime > lastActivityTimestamp) {
              lastActivityTimestamp = msgTime;
            }
          }
        }

        // Check missed sessions
        if (config.signals.missed_sessions) {
          const { data: recentSession } = await supabase
            .from("sessions")
            .select("start_time, status")
            .eq("client_id", clientId)
            .eq("status", "completed")
            .order("start_time", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (recentSession?.start_time) {
            const sessionTime = new Date(recentSession.start_time).getTime();
            if (sessionTime > lastActivityTimestamp) {
              lastActivityTimestamp = sessionTime;
            }
          }
        }

        // Calculate days since last activity
        const daysSinceActivity = lastActivityTimestamp > 0
          ? Math.floor((now.getTime() - lastActivityTimestamp) / (1000 * 60 * 60 * 24))
          : 999; // If no activity found, consider very inactive

        // Determine risk stage
        let newRiskStage = 0;
        if (daysSinceActivity >= config.stage3_days) {
          newRiskStage = 3;
        } else if (daysSinceActivity >= config.stage2_days) {
          newRiskStage = 2;
        } else if (daysSinceActivity >= config.stage1_days) {
          newRiskStage = 1;
        }

        const previousStage = currentStatus?.risk_stage || 0;
        
        // Only take action if stage has increased
        if (newRiskStage > previousStage) {
          console.log(`Client ${clientId} moved from stage ${previousStage} to ${newRiskStage}`);

          // Upsert automation status
          await supabase
            .from("client_automation_status")
            .upsert({
              coach_id: coachId,
              client_id: clientId,
              is_at_risk: newRiskStage > 0,
              risk_stage: newRiskStage,
              updated_at: now.toISOString(),
            }, { onConflict: "coach_id,client_id" });

          // Execute action based on stage
          if (newRiskStage === 1) {
            if (config.stage1_action === "auto_message") {
              const message = (config.stage1_template || TONE_MESSAGES[config.stage1_tone])
                .replace(/{client_name}/g, clientName);

              await supabase.from("messages").insert({
                sender_id: setting.coach.user_id,
                receiver_id: client?.user_id,
                content: message,
              });

              await supabase
                .from("client_automation_status")
                .update({ last_soft_checkin_at: now.toISOString() })
                .eq("coach_id", coachId)
                .eq("client_id", clientId);

              await supabase.from("automation_logs").insert({
                coach_id: coachId,
                client_id: clientId,
                automation_type: "dropoff_rescue",
                action_type: "soft_checkin",
                message_sent: message,
                status: "sent",
                metadata: { stage: 1, days_inactive: daysSinceActivity },
              });

              messages++;
            } else {
              // Alert only - create notification
              await supabase.from("notifications").insert({
                user_id: setting.coach.user_id,
                type: "client_at_risk",
                title: "Client needs attention",
                message: `${clientName} has been inactive for ${daysSinceActivity} days.`,
                data: { client_id: clientId, stage: 1 },
              });
              alerts++;
            }
          } else if (newRiskStage === 2) {
            // Stage 2 - Always alert coach
            await supabase.from("notifications").insert({
              user_id: setting.coach.user_id,
              type: "client_at_risk",
              title: "Client at risk - Stage 2",
              message: `${clientName} has been inactive for ${daysSinceActivity} days. Consider reaching out personally.`,
              data: { client_id: clientId, stage: 2 },
            });

            await supabase
              .from("client_automation_status")
              .update({ last_coach_alert_at: now.toISOString() })
              .eq("coach_id", coachId)
              .eq("client_id", clientId);

            await supabase.from("automation_logs").insert({
              coach_id: coachId,
              client_id: clientId,
              automation_type: "dropoff_rescue",
              action_type: "coach_alert",
              status: "sent",
              metadata: { stage: 2, days_inactive: daysSinceActivity },
            });

            alerts++;
          } else if (newRiskStage === 3) {
            // Stage 3 - Recovery attempt
            await supabase.from("notifications").insert({
              user_id: setting.coach.user_id,
              type: "client_critical",
              title: "⚠️ Client at high risk",
              message: `${clientName} has been inactive for ${daysSinceActivity} days. Urgent attention needed!`,
              data: { client_id: clientId, stage: 3 },
            });

            await supabase
              .from("client_automation_status")
              .update({ last_recovery_attempt_at: now.toISOString() })
              .eq("coach_id", coachId)
              .eq("client_id", clientId);

            await supabase.from("automation_logs").insert({
              coach_id: coachId,
              client_id: clientId,
              automation_type: "dropoff_rescue",
              action_type: "recovery_attempt",
              status: "sent",
              metadata: { stage: 3, days_inactive: daysSinceActivity },
            });

            alerts++;
          }

          processed++;
        } else if (newRiskStage === 0 && previousStage > 0) {
          // Client has become active again, reset status
          await supabase
            .from("client_automation_status")
            .update({
              is_at_risk: false,
              risk_stage: 0,
              updated_at: now.toISOString(),
            })
            .eq("coach_id", coachId)
            .eq("client_id", clientId);

          console.log(`Client ${clientId} is no longer at risk`);
        }
      }
    }

    console.log(`Dropoff detection complete: ${processed} clients flagged, ${alerts} alerts, ${messages} messages`);

    return new Response(
      JSON.stringify({ success: true, processed, alerts, messages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in dropoff detection:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
