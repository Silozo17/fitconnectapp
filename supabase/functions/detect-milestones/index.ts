import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { resolveMessageVariables, fetchCustomFieldValues } from "../_shared/message-variables.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneActions {
  send_message: boolean;
  award_xp: number;
  award_badge_id?: string;
  trigger_animation: boolean;
  notify_coach: boolean;
}

const DEFAULT_CELEBRATION_MESSAGES: Record<string, string> = {
  streak: "🎉 Amazing {client_first_name}! You've hit a {value}-day streak! Your consistency is paying off!",
  program_complete: "🏆 Congratulations {client_first_name}! You've completed your training program! What an achievement!",
  challenge_complete: "🌟 {client_first_name}, you crushed it! Challenge complete! You should be so proud!",
  wearable_target: "💪 Great job {client_first_name}! You hit your {value} {unit} target today!",
  adherence: "✨ Incredible consistency {client_first_name}! {value}% adherence this week - you're unstoppable!",
  pr: "🔥 NEW PR {client_first_name}! You just set a personal record! Keep pushing those limits!",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Detecting milestones...");
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get all coaches with milestone_celebration enabled
    const { data: automationSettings, error: settingsError } = await supabase
      .from("coach_automation_settings")
      .select("*, coach:coach_profiles(id, user_id, display_name)")
      .eq("automation_type", "milestone_celebration")
      .eq("is_enabled", true);

    if (settingsError) {
      console.error("Error fetching automation settings:", settingsError);
      throw settingsError;
    }

    if (!automationSettings || automationSettings.length === 0) {
      console.log("No coaches have milestone celebration enabled");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;
    let xpAwarded = 0;
    let badgesAwarded = 0;
    let messagesSent = 0;

    for (const setting of automationSettings) {
      const coachId = setting.coach_id;

      // Get milestone configurations for this coach
      const { data: milestoneConfigs } = await supabase
        .from("milestone_automations")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_enabled", true);

      if (!milestoneConfigs || milestoneConfigs.length === 0) {
        continue;
      }

      // Get all active clients for this coach
      const { data: clients } = await supabase
        .from("coach_clients")
        .select(`
          client_id,
          client:client_profiles!coach_clients_client_id_fkey(id, user_id, first_name, last_name, city, gender, age)
        `)
        .eq("coach_id", coachId)
        .eq("status", "active");

      if (!clients) continue;

      for (const clientRecord of clients) {
        const clientId = clientRecord.client_id;
        const client = clientRecord.client as any;

        for (const config of milestoneConfigs) {
          const actions: MilestoneActions = config.actions as MilestoneActions;
          let milestoneAchieved = false;
          let milestoneValue: number | string = config.threshold_value;
          let milestoneUnit = "";

          // Check each milestone type
          if (config.milestone_type === "streak") {
            // Check habit streaks
            const { data: streaks } = await supabase
              .from("habit_streaks")
              .select("current_streak, habit:client_habits(name)")
              .eq("client_id", clientId)
              .gte("current_streak", config.threshold_value);

            if (streaks && streaks.length > 0) {
              // Check if we already celebrated this milestone today
              const { data: existingLog } = await supabase
                .from("automation_logs")
                .select("id")
                .eq("coach_id", coachId)
                .eq("client_id", clientId)
                .eq("automation_type", "milestone_celebration")
                .eq("action_type", "streak")
                .gte("created_at", today)
                .maybeSingle();

              if (!existingLog) {
                milestoneAchieved = true;
                milestoneValue = streaks[0].current_streak;
              }
            }
          } else if (config.milestone_type === "program_complete") {
            // Check for recently completed training plans
            const { data: completedPlans } = await supabase
              .from("training_plan_assignments")
              .select("id, training_plan:training_plans(name)")
              .eq("client_id", clientId)
              .eq("status", "completed")
              .gte("updated_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

            if (completedPlans && completedPlans.length > 0) {
              const { data: existingLog } = await supabase
                .from("automation_logs")
                .select("id")
                .eq("client_id", clientId)
                .eq("automation_type", "milestone_celebration")
                .eq("action_type", "program_complete")
                .eq("metadata->>plan_id", completedPlans[0].id)
                .maybeSingle();

              if (!existingLog) {
                milestoneAchieved = true;
              }
            }
          } else if (config.milestone_type === "challenge_complete") {
            // Check for recently completed challenges
            const { data: completedChallenges } = await supabase
              .from("challenge_participants")
              .select("id, challenge:challenges(title)")
              .eq("client_id", clientId)
              .eq("status", "completed")
              .gte("completed_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

            if (completedChallenges && completedChallenges.length > 0) {
              const { data: existingLog } = await supabase
                .from("automation_logs")
                .select("id")
                .eq("client_id", clientId)
                .eq("automation_type", "milestone_celebration")
                .eq("action_type", "challenge_complete")
                .gte("created_at", today)
                .maybeSingle();

              if (!existingLog) {
                milestoneAchieved = true;
              }
            }
          } else if (config.milestone_type === "adherence") {
            // Check weekly adherence
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const { data: habitLogs } = await supabase
              .from("habit_logs")
              .select("id, is_completed")
              .eq("client_id", clientId)
              .gte("logged_at", weekAgo.toISOString());

            if (habitLogs && habitLogs.length > 0) {
              const completed = habitLogs.filter(h => h.is_completed).length;
              const adherencePercent = Math.round((completed / habitLogs.length) * 100);

              if (adherencePercent >= config.threshold_value) {
                const { data: existingLog } = await supabase
                  .from("automation_logs")
                  .select("id")
                  .eq("coach_id", coachId)
                  .eq("client_id", clientId)
                  .eq("automation_type", "milestone_celebration")
                  .eq("action_type", "adherence")
                  .gte("created_at", today)
                  .maybeSingle();

                if (!existingLog) {
                  milestoneAchieved = true;
                  milestoneValue = adherencePercent;
                }
              }
            }
          }

          // Execute actions if milestone achieved
          if (milestoneAchieved) {
            console.log(`Milestone ${config.milestone_type} achieved for client ${clientId}`);

            // Award XP
            if (actions.award_xp > 0) {
              const { data: existingXp } = await supabase
                .from("client_xp")
                .select("id, total_xp, current_level")
                .eq("client_id", clientId)
                .maybeSingle();

              if (existingXp) {
                await supabase
                  .from("client_xp")
                  .update({ 
                    total_xp: existingXp.total_xp + actions.award_xp,
                    updated_at: now.toISOString()
                  })
                  .eq("id", existingXp.id);
              } else {
                await supabase
                  .from("client_xp")
                  .insert({
                    client_id: clientId,
                    total_xp: actions.award_xp,
                    current_level: 1,
                    xp_to_next_level: 100,
                  });
              }
              xpAwarded += actions.award_xp;
            }

            // Award badge
            if (actions.award_badge_id) {
              const { data: existingBadge } = await supabase
                .from("client_badges")
                .select("id")
                .eq("client_id", clientId)
                .eq("badge_id", actions.award_badge_id)
                .maybeSingle();

              if (!existingBadge) {
                await supabase
                  .from("client_badges")
                  .insert({
                    client_id: clientId,
                    badge_id: actions.award_badge_id,
                    source_data: { milestone_type: config.milestone_type, value: milestoneValue },
                  });
                badgesAwarded++;
              }
            }

            // Send celebration message (messages table uses profile_id values, not user_id)
            if (actions.send_message && setting.coach?.id && client?.id) {
              // Fetch custom fields for this coach/client pair
              const customFields = await fetchCustomFieldValues(supabase, coachId, clientId);

              // Use custom template or default message
              const messageTemplate = config.message_template || DEFAULT_CELEBRATION_MESSAGES[config.milestone_type] || "";
              
              // Resolve message variables using the shared resolver
              const message = resolveMessageVariables(
                messageTemplate,
                {
                  client: {
                    first_name: client?.first_name,
                    last_name: client?.last_name,
                    city: client?.city,
                    gender: client?.gender,
                    age: client?.age,
                  },
                  coach: {
                    display_name: setting.coach?.display_name,
                  },
                  milestone: {
                    value: milestoneValue,
                    unit: milestoneUnit,
                  },
                },
                customFields
              );

              if (message) {
                await supabase.from("messages").insert({
                  sender_id: setting.coach.id,    // coach_profiles.id
                  receiver_id: client.id,         // client_profiles.id
                  content: message,
                });
                messagesSent++;
              }
            }

            // Notify coach
            if (actions.notify_coach && setting.coach?.user_id) {
              const clientName = [client?.first_name, client?.last_name].filter(Boolean).join(" ") || "A client";
              await supabase.from("notifications").insert({
                user_id: setting.coach.user_id,
                type: "milestone_achieved",
                title: "Client milestone! 🎉",
                message: `${clientName} achieved a ${config.milestone_type} milestone!`,
                data: { client_id: clientId, milestone_type: config.milestone_type, value: milestoneValue },
              });
            }

            // Log the automation
            await supabase.from("automation_logs").insert({
              coach_id: coachId,
              client_id: clientId,
              automation_type: "milestone_celebration",
              action_type: config.milestone_type,
              status: "sent",
              metadata: {
                milestone_config_id: config.id,
                value: milestoneValue,
                xp_awarded: actions.award_xp,
                badge_awarded: actions.award_badge_id,
              },
            });

            processed++;
          }
        }
      }
    }

    console.log(`Milestone detection complete: ${processed} milestones, ${xpAwarded} XP, ${badgesAwarded} badges, ${messagesSent} messages`);

    return new Response(
      JSON.stringify({ success: true, processed, xpAwarded, badgesAwarded, messagesSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in milestone detection:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
