import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing client reminders...");
    const now = new Date();

    // Get all active, non-paused reminders that are due
    const { data: dueReminders, error: fetchError } = await supabase
      .from("client_reminders")
      .select(`
        *,
        coach:coach_profiles!client_reminders_coach_id_fkey(id, user_id, display_name),
        client:client_profiles!client_reminders_client_id_fkey(id, user_id, first_name, last_name, timezone),
        template:reminder_templates(name, message_template)
      `)
      .eq("is_active", true)
      .eq("is_paused", false)
      .lte("next_run_at", now.toISOString());

    if (fetchError) {
      console.error("Error fetching reminders:", fetchError);
      throw fetchError;
    }

    if (!dueReminders || dueReminders.length === 0) {
      console.log("No reminders due");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueReminders.length} due reminders`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const reminder of dueReminders) {
      try {
        // Check max sends limit
        if (reminder.max_sends && reminder.sends_count >= reminder.max_sends) {
          console.log(`Reminder ${reminder.id} reached max sends, deactivating`);
          await supabase
            .from("client_reminders")
            .update({ is_active: false })
            .eq("id", reminder.id);
          skipped++;
          continue;
        }

        // Check end date
        if (reminder.end_date && new Date(reminder.end_date) < now) {
          console.log(`Reminder ${reminder.id} past end date, deactivating`);
          await supabase
            .from("client_reminders")
            .update({ is_active: false })
            .eq("id", reminder.id);
          skipped++;
          continue;
        }

        // Get message content (custom or template)
        const clientName = [reminder.client?.first_name, reminder.client?.last_name]
          .filter(Boolean)
          .join(" ") || "there";

        let messageContent = reminder.custom_message || reminder.template?.message_template || "";
        messageContent = messageContent.replace(/{{client_name}}/g, clientName);

        if (!messageContent) {
          console.error(`No message content for reminder ${reminder.id}`);
          errors++;
          continue;
        }

        // Validate user IDs
        if (!reminder.coach?.user_id || !reminder.client?.user_id) {
          console.error(`Missing user IDs for reminder ${reminder.id}`);
          errors++;
          continue;
        }

        // Send the message
        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            sender_id: reminder.coach.user_id,
            receiver_id: reminder.client.user_id,
            content: messageContent,
          });

        if (messageError) {
          console.error("Error sending reminder message:", messageError);
          errors++;
          continue;
        }

        // Calculate next run time
        let nextRunAt: Date | null = null;
        const [hours, minutes] = (reminder.time_of_day || "09:00").split(":").map(Number);

        if (reminder.frequency === "once") {
          // One-time reminder, deactivate after sending
          nextRunAt = null;
        } else if (reminder.frequency === "daily") {
          nextRunAt = new Date(now);
          nextRunAt.setDate(nextRunAt.getDate() + 1);
          nextRunAt.setHours(hours, minutes, 0, 0);
        } else if (reminder.frequency === "weekly") {
          nextRunAt = new Date(now);
          nextRunAt.setDate(nextRunAt.getDate() + 7);
          nextRunAt.setHours(hours, minutes, 0, 0);
        } else if (reminder.frequency === "monthly") {
          nextRunAt = new Date(now);
          nextRunAt.setMonth(nextRunAt.getMonth() + 1);
          nextRunAt.setHours(hours, minutes, 0, 0);
        } else if (reminder.frequency === "custom" && reminder.custom_interval_days) {
          nextRunAt = new Date(now);
          nextRunAt.setDate(nextRunAt.getDate() + reminder.custom_interval_days);
          nextRunAt.setHours(hours, minutes, 0, 0);
        }

        // Update the reminder record
        const updateData: Record<string, any> = {
          last_sent_at: now.toISOString(),
          sends_count: (reminder.sends_count || 0) + 1,
        };

        if (nextRunAt) {
          updateData.next_run_at = nextRunAt.toISOString();
        } else {
          updateData.is_active = false;
        }

        await supabase
          .from("client_reminders")
          .update(updateData)
          .eq("id", reminder.id);

        // Log the automation action
        await supabase
          .from("automation_logs")
          .insert({
            coach_id: reminder.coach_id,
            client_id: reminder.client_id,
            automation_type: "reminder",
            action_type: reminder.template?.name || "custom_reminder",
            message_sent: messageContent,
            status: "sent",
            metadata: {
              reminder_id: reminder.id,
              template_id: reminder.template_id,
              frequency: reminder.frequency,
            },
          });

        processed++;
        console.log(`Processed reminder ${reminder.id} for client ${reminder.client_id}`);
      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        errors++;
      }
    }

    console.log(`Completed: ${processed} processed, ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({ success: true, processed, skipped, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing client reminders:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
