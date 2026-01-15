import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecurringPattern {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  endType?: "never" | "date" | "occurrences";
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

    const { templateClassId, weeksAhead = 12 } = await req.json();

    console.log("Generating recurring classes for template:", templateClassId, "weeksAhead:", weeksAhead);

    // Get the template class
    const { data: templateClass, error: templateError } = await supabase
      .from("gym_classes")
      .select("*, gym_class_types(*)")
      .eq("id", templateClassId)
      .eq("is_recurring_template", true)
      .single();

    if (templateError || !templateClass) {
      console.error("Template not found:", templateError);
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

    console.log("Pattern:", JSON.stringify(pattern));

    // Get excluded dates from template
    const excludedDates = new Set<string>(
      (templateClass.excluded_dates as string[] || [])
    );

    // Calculate dates to generate - use weeksAhead parameter
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));
    endDate.setHours(23, 59, 59, 999);

    console.log("Generation window:", startDate.toISOString(), "to", endDate.toISOString());

    // Check pattern end date - only apply if it's before our generation window
    if (pattern.endDate) {
      const patternEndDate = new Date(pattern.endDate);
      patternEndDate.setHours(23, 59, 59, 999);
      if (patternEndDate < endDate) {
        endDate.setTime(patternEndDate.getTime());
        console.log("Using pattern end date:", endDate.toISOString());
      }
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

    console.log("Existing classes on dates:", Array.from(existingDates));

    // Generate new class instances
    const classesToCreate: any[] = [];
    const templateStartTime = new Date(templateClass.start_time);
    const templateEndTime = new Date(templateClass.end_time);
    const durationMs = templateEndTime.getTime() - templateStartTime.getTime();

    const currentDate = new Date(startDate);
    let occurrenceCount = 0;
    const maxOccurrences = pattern.occurrences || 999; // Default high limit

    console.log("Days of week:", pattern.daysOfWeek);

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
        
        // Skip if date is excluded (holiday/break)
        if (excludedDates.has(dateKey)) {
          console.log("Skipping excluded date:", dateKey);
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        // Skip if we already have a class on this date
        if (!existingDates.has(dateKey)) {
          // Check occurrence limit (only for "occurrences" end type)
          if (pattern.endType === "occurrences" && occurrenceCount >= maxOccurrences) {
            console.log("Reached occurrence limit:", maxOccurrences);
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

          // Only create future classes (or today's if not passed)
          const now = new Date();
          if (classStartTime >= now || 
              (classStartTime.toDateString() === now.toDateString() && classStartTime > now)) {
            classesToCreate.push({
              gym_id: templateClass.gym_id,
              class_type_id: templateClass.class_type_id,
              instructor_id: templateClass.instructor_id,
              location_id: templateClass.location_id,
              start_time: classStartTime.toISOString(),
              end_time: classEndTime.toISOString(),
              max_capacity: templateClass.max_capacity,
              status: "scheduled",
              notes: templateClass.notes,
              parent_class_id: templateClassId,
              is_recurring_template: false,
            });
            occurrenceCount++;
            console.log("Will create class on:", dateKey, "at", classStartTime.toISOString());
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Classes to create:", classesToCreate.length);

    // Insert new classes
    if (classesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("gym_classes")
        .insert(classesToCreate);

      if (insertError) {
        console.error("Insert error:", insertError);
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
