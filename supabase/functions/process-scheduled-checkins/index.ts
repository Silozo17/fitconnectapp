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

    console.log("Processing scheduled check-ins...");

    const now = new Date();
    
    // Get all active scheduled check-ins that are due
    const { data: dueCheckins, error: fetchError } = await supabase
      .from("scheduled_checkins")
      .select(`
        *,
        coach:coach_profiles(id, user_id, first_name, last_name),
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
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${dueCheckins.length} due check-ins`);

    let processed = 0;
    let errors = 0;

    for (const checkin of dueCheckins) {
      try {
        // Replace template variables
        const clientName = [checkin.client?.first_name, checkin.client?.last_name]
          .filter(Boolean)
          .join(" ") || "there";
        
        const message = checkin.message_template
          .replace(/{client_name}/g, clientName)
          .replace(/{days_since_login}/g, "recently");

        // Create message in conversation
        // First, find or create conversation
        const { data: existingConversation } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant1_id.eq.${checkin.coach?.user_id},participant2_id.eq.${checkin.client?.user_id}),and(participant1_id.eq.${checkin.client?.user_id},participant2_id.eq.${checkin.coach?.user_id})`)
          .maybeSingle();

        let conversationId = existingConversation?.id;

        if (!conversationId) {
          const { data: newConversation, error: convError } = await supabase
            .from("conversations")
            .insert({
              participant1_id: checkin.coach?.user_id,
              participant2_id: checkin.client?.user_id,
            })
            .select("id")
            .single();

          if (convError) {
            console.error("Error creating conversation:", convError);
            errors++;
            continue;
          }
          conversationId = newConversation.id;
        }

        // Send message
        const { error: messageError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: checkin.coach?.user_id,
            content: message,
          });

        if (messageError) {
          console.error("Error sending message:", messageError);
          errors++;
          continue;
        }

        // Calculate next run time preserving the scheduled time
        let nextRunAt: Date | null = null;
        const [hours, minutes] = (checkin.time_of_day || "09:00").split(":").map(Number);
        
        if (checkin.schedule_type === "daily") {
          nextRunAt = new Date(now);
          nextRunAt.setDate(nextRunAt.getDate() + 1);
          nextRunAt.setHours(hours, minutes, 0, 0);
        } else if (checkin.schedule_type === "weekly") {
          nextRunAt = new Date(now);
          nextRunAt.setDate(nextRunAt.getDate() + 7);
          nextRunAt.setHours(hours, minutes, 0, 0);
        } else if (checkin.schedule_type === "monthly") {
          nextRunAt = new Date(now);
          nextRunAt.setMonth(nextRunAt.getMonth() + 1);
          // Preserve the day of month if set
          if (checkin.day_of_month) {
            nextRunAt.setDate(checkin.day_of_month);
          }
          nextRunAt.setHours(hours, minutes, 0, 0);
        }
        // For "once" type, we don't set a next run

        // Update the check-in record
        const updateData: any = {
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

        processed++;
        console.log(`Processed check-in ${checkin.id} for client ${checkin.client_id}`);
      } catch (err) {
        console.error(`Error processing check-in ${checkin.id}:`, err);
        errors++;
      }
    }

    console.log(`Completed: ${processed} processed, ${errors} errors`);

    return new Response(
      JSON.stringify({ success: true, processed, errors }),
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
