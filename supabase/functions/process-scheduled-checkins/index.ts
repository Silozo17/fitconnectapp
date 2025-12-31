import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Convert time from a given timezone to UTC
function convertToUTC(timeOfDay: string, timezone: string, baseDate: Date): Date {
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  // Create a date string in the target timezone
  const dateStr = baseDate.toISOString().split("T")[0];
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  
  try {
    // Create date in local timezone context
    const localDate = new Date(`${dateStr}T${timeStr}`);
    
    // Get the offset for the target timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    
    // Parse the formatted date to get timezone offset
    const parts = formatter.formatToParts(localDate);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || "0";
    
    const tzDate = new Date(
      parseInt(getPart("year")),
      parseInt(getPart("month")) - 1,
      parseInt(getPart("day")),
      parseInt(getPart("hour")),
      parseInt(getPart("minute")),
      parseInt(getPart("second"))
    );
    
    // Calculate offset and return UTC time
    const offset = tzDate.getTime() - localDate.getTime();
    return new Date(localDate.getTime() - offset);
  } catch (e) {
    console.warn(`Invalid timezone ${timezone}, falling back to UTC`);
    return new Date(`${dateStr}T${timeStr}Z`);
  }
}

// Calculate next run time in UTC respecting timezone
function calculateNextRunAtUTC(
  scheduleType: string,
  timeOfDay: string,
  timezone: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  
  // Start with today's date
  let nextRun = new Date(now);
  
  if (scheduleType === "daily") {
    // Set to next occurrence of this time
    const todayRun = convertToUTC(timeOfDay, timezone, now);
    if (todayRun <= now) {
      // Already passed today, schedule for tomorrow
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      nextRun = convertToUTC(timeOfDay, timezone, tomorrow);
    } else {
      nextRun = todayRun;
    }
  } else if (scheduleType === "weekly" && dayOfWeek !== undefined && dayOfWeek !== null) {
    // Calculate days until target day
    const currentDay = now.getUTCDay();
    let daysUntil = dayOfWeek - currentDay;
    
    const todayRun = convertToUTC(timeOfDay, timezone, now);
    if (daysUntil < 0 || (daysUntil === 0 && todayRun <= now)) {
      daysUntil += 7;
    }
    
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDate.getUTCDate() + daysUntil);
    nextRun = convertToUTC(timeOfDay, timezone, targetDate);
  } else if (scheduleType === "monthly") {
    const targetDay = dayOfMonth || now.getUTCDate();
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDay);
    
    const thisMonthRun = convertToUTC(timeOfDay, timezone, targetDate);
    if (thisMonthRun <= now) {
      // Schedule for next month
      targetDate.setUTCMonth(targetDate.getUTCMonth() + 1);
      nextRun = convertToUTC(timeOfDay, timezone, targetDate);
    } else {
      nextRun = thisMonthRun;
    }
  }
  
  return nextRun;
}

// Log check-in execution to audit table
async function logCheckinExecution(
  supabase: any,
  checkinId: string,
  coachId: string,
  clientId: string,
  status: "sent" | "failed" | "skipped",
  messageId?: string,
  errorMessage?: string,
  notificationSent?: boolean,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from("scheduled_checkin_logs").insert({
      checkin_id: checkinId,
      coach_id: coachId,
      client_id: clientId,
      status,
      message_id: messageId || null,
      error_message: errorMessage || null,
      notification_sent: notificationSent || false,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error("Failed to log check-in execution:", e);
  }
}

// Send notification for a message
async function sendMessageNotification(
  supabase: any,
  messageId: string
): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-message-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ messageId }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Notification failed for message ${messageId}:`, errorText);
      return false;
    }
    
    console.log(`Notification sent for message ${messageId}`);
    return true;
  } catch (e) {
    console.error(`Error sending notification for message ${messageId}:`, e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing scheduled check-ins...");

    const now = new Date();
    
    // Get all active scheduled check-ins that are due
    const { data: dueCheckins, error: fetchError } = await supabase
      .from("scheduled_checkins")
      .select(`
        *,
        coach:coach_profiles(id, user_id, display_name),
        client:client_profiles(id, user_id, first_name, last_name)
      `)
      .eq("is_active", true)
      .lte("next_run_at", now.toISOString());

    if (fetchError) {
      console.error("Error fetching scheduled check-ins:", fetchError);
      throw fetchError;
    }

    if (!dueCheckins || dueCheckins.length === 0) {
      console.log("No scheduled check-ins due");
      return new Response(
        JSON.stringify({ success: true, processed: 0, failed: 0, skipped: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueCheckins.length} due check-ins`);

    let processed = 0;
    let failed = 0;
    let skipped = 0;
    const results: Array<{ checkinId: string; status: string; error?: string }> = [];

    for (const checkin of dueCheckins) {
      try {
        // Validate we have both user IDs
        if (!checkin.coach?.user_id || !checkin.client?.user_id) {
          console.error(`Missing user IDs for check-in ${checkin.id}`);
          await logCheckinExecution(
            supabase,
            checkin.id,
            checkin.coach_id,
            checkin.client_id,
            "skipped",
            undefined,
            "Missing coach or client user ID"
          );
          skipped++;
          results.push({ checkinId: checkin.id, status: "skipped", error: "Missing user IDs" });
          continue;
        }

        // Replace template variables
        const clientName = [checkin.client?.first_name, checkin.client?.last_name]
          .filter(Boolean)
          .join(" ") || "there";
        
        const message = checkin.message_template
          .replace(/{client_name}/g, clientName)
          .replace(/{days_since_login}/g, "recently");

        // Send message directly (messages table uses sender_id and receiver_id)
        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .insert({
            sender_id: checkin.coach.user_id,
            receiver_id: checkin.client.user_id,
            content: message,
            metadata: {
              source: "scheduled_checkin",
              checkin_id: checkin.id,
            },
          })
          .select("id")
          .single();

        if (messageError) {
          console.error("Error sending message:", messageError);
          await logCheckinExecution(
            supabase,
            checkin.id,
            checkin.coach_id,
            checkin.client_id,
            "failed",
            undefined,
            `Message insert failed: ${messageError.message}`
          );
          failed++;
          results.push({ checkinId: checkin.id, status: "failed", error: messageError.message });
          continue;
        }

        // Send notification for the message
        let notificationSent = false;
        if (messageData?.id) {
          notificationSent = await sendMessageNotification(supabase, messageData.id);
        }

        // Get timezone from check-in or default to UTC
        const timezone = checkin.timezone || "UTC";
        const timeOfDay = checkin.time_of_day || "09:00";

        // Calculate next run time using proper timezone handling
        let nextRunAt: Date | null = null;
        
        if (checkin.schedule_type === "daily") {
          nextRunAt = calculateNextRunAtUTC("daily", timeOfDay, timezone);
        } else if (checkin.schedule_type === "weekly") {
          nextRunAt = calculateNextRunAtUTC("weekly", timeOfDay, timezone, checkin.day_of_week);
        } else if (checkin.schedule_type === "monthly") {
          nextRunAt = calculateNextRunAtUTC("monthly", timeOfDay, timezone, null, checkin.day_of_month);
        }
        // For "once" type, we don't set a next run

        // Update the check-in record
        const updateData: Record<string, any> = {
          last_sent_at: now.toISOString(),
        };

        if (nextRunAt) {
          updateData.next_run_at = nextRunAt.toISOString();
        } else {
          // One-time check-in, mark as inactive
          updateData.is_active = false;
        }

        await supabase
          .from("scheduled_checkins")
          .update(updateData)
          .eq("id", checkin.id);

        // Log successful execution
        await logCheckinExecution(
          supabase,
          checkin.id,
          checkin.coach_id,
          checkin.client_id,
          "sent",
          messageData?.id,
          undefined,
          notificationSent,
          {
            next_run_at: nextRunAt?.toISOString(),
            timezone,
          }
        );

        processed++;
        results.push({ checkinId: checkin.id, status: "sent" });
        console.log(`Processed check-in ${checkin.id} for client ${checkin.client_id}, notification: ${notificationSent}`);
      } catch (err: any) {
        console.error(`Error processing check-in ${checkin.id}:`, err);
        await logCheckinExecution(
          supabase,
          checkin.id,
          checkin.coach_id,
          checkin.client_id,
          "failed",
          undefined,
          err?.message || "Unknown error"
        );
        failed++;
        results.push({ checkinId: checkin.id, status: "failed", error: err?.message });
      }
    }

    console.log(`Completed: ${processed} sent, ${failed} failed, ${skipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed, 
        failed, 
        skipped,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing scheduled check-ins:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
