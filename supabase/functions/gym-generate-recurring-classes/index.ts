import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecurringPattern {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endDate?: string;
  occurrences?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { templateClassId, weeksAhead = 4 } = await req.json();

    // Get the template class
    const { data: templateClass, error: templateError } = await supabase
      .from("gym_classes")
      .select("*, gym_class_types(*)")
      .eq("id", templateClassId)
      .eq("is_recurring_template", true)
      .single();

    if (templateError || !templateClass) {
      return new Response(JSON.stringify({ error: "Template class not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is staff or owner at this gym
    const { data: staffRecord } = await supabase
      .from("gym_staff")
      .select("id")
      .eq("gym_id", templateClass.gym_id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: gymProfile } = await supabase
      .from("gym_profiles")
      .select("id")
      .eq("id", templateClass.gym_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!staffRecord && !gymProfile) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pattern = templateClass.recurring_pattern as RecurringPattern;
    if (!pattern) {
      return new Response(JSON.stringify({ error: "No recurring pattern defined" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate dates to generate
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));

    // Check pattern end date
    const patternEndDate = pattern.endDate ? new Date(pattern.endDate) : null;
    if (patternEndDate && patternEndDate < endDate) {
      endDate.setTime(patternEndDate.getTime());
    }

    // Get existing generated classes to avoid duplicates
    const { data: existingClasses } = await supabase
      .from("gym_classes")
      .select("start_time")
      .eq("parent_class_id", templateClassId)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString());

    const existingDates = new Set(
      existingClasses?.map((c) => c.start_time.split("T")[0]) || []
    );

    // Generate new class instances
    const classesToCreate: any[] = [];
    const templateStartTime = new Date(templateClass.start_time);
    const templateEndTime = new Date(templateClass.end_time);
    const durationMs = templateEndTime.getTime() - templateStartTime.getTime();

    const currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      let shouldCreate = false;

      switch (pattern.frequency) {
        case "daily":
          shouldCreate = true;
          break;
        case "weekly":
          shouldCreate = pattern.daysOfWeek?.includes(dayOfWeek) || false;
          break;
        case "biweekly":
          const weeksDiff = Math.floor(
            (currentDate.getTime() - templateStartTime.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          shouldCreate = weeksDiff % 2 === 0 && (pattern.daysOfWeek?.includes(dayOfWeek) || false);
          break;
        case "monthly":
          shouldCreate = currentDate.getDate() === templateStartTime.getDate();
          break;
      }

      if (shouldCreate) {
        const dateKey = currentDate.toISOString().split("T")[0];
        
        // Skip if we already have a class on this date
        if (!existingDates.has(dateKey)) {
          // Check occurrence limit
          if (pattern.occurrences && occurrenceCount >= pattern.occurrences) {
            break;
          }

          const classStartTime = new Date(currentDate);
          classStartTime.setHours(
            templateStartTime.getHours(),
            templateStartTime.getMinutes(),
            0,
            0
          );

          const classEndTime = new Date(classStartTime.getTime() + durationMs);

          // Only create future classes
          if (classStartTime > new Date()) {
            classesToCreate.push({
              gym_id: templateClass.gym_id,
              class_type_id: templateClass.class_type_id,
              instructor_id: templateClass.instructor_id,
              location_id: templateClass.location_id,
              start_time: classStartTime.toISOString(),
              end_time: classEndTime.toISOString(),
              max_capacity: templateClass.max_capacity,
              current_bookings: 0,
              status: "scheduled",
              notes: templateClass.notes,
              parent_class_id: templateClassId,
              is_recurring_template: false,
            });
            occurrenceCount++;
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert new classes
    if (classesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("gym_classes")
        .insert(classesToCreate);

      if (insertError) {
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: classesToCreate.length,
        message: `Generated ${classesToCreate.length} class instances`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating recurring classes:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
