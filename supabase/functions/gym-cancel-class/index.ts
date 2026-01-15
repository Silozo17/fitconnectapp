import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelRequest {
  classId: string;
  reason: string;
  scope: "single" | "all_future";
  notifyMembers: boolean;
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

    const { classId, reason, scope, notifyMembers }: CancelRequest = await req.json();

    console.log("Cancel request:", { classId, reason, scope, notifyMembers });

    // Get the class to cancel
    const { data: classToCancel, error: classError } = await supabase
      .from("gym_classes")
      .select("*, gym_class_types(*)")
      .eq("id", classId)
      .single();

    if (classError || !classToCancel) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authorization
    const { data: staffRecord } = await supabase
      .from("gym_staff")
      .select("id")
      .eq("gym_id", classToCancel.gym_id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: gymProfile } = await supabase
      .from("gym_profiles")
      .select("id")
      .eq("id", classToCancel.gym_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!staffRecord && !gymProfile) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();
    let classesToCancel: string[] = [classId];
    let affectedMembers: { memberId: string; classId: string; className: string; classTime: string }[] = [];

    // If cancelling all future, get all future instances
    if (scope === "all_future") {
      const parentId = classToCancel.parent_class_id || classToCancel.id;
      
      const { data: futureClasses } = await supabase
        .from("gym_classes")
        .select("id")
        .or(`id.eq.${parentId},parent_class_id.eq.${parentId}`)
        .gte("start_time", now)
        .neq("status", "cancelled");

      classesToCancel = futureClasses?.map(c => c.id) || [classId];
      console.log("Cancelling", classesToCancel.length, "classes");
    }

    // Get all affected bookings for notification
    if (notifyMembers) {
      const { data: bookings } = await supabase
        .from("gym_class_bookings")
        .select(`
          id,
          member_id,
          class_id,
          gym_classes (
            start_time,
            gym_class_types (name)
          )
        `)
        .in("class_id", classesToCancel)
        .in("status", ["confirmed", "waitlisted"]);

      affectedMembers = bookings?.map(b => ({
        memberId: b.member_id,
        classId: b.class_id,
        className: (b.gym_classes as any)?.gym_class_types?.name || "Class",
        classTime: (b.gym_classes as any)?.start_time || "",
      })) || [];

      console.log("Affected members:", affectedMembers.length);
    }

    // Cancel the classes
    const { error: cancelError } = await supabase
      .from("gym_classes")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: now,
        cancelled_by: user.id,
      })
      .in("id", classesToCancel);

    if (cancelError) {
      console.error("Cancel error:", cancelError);
      throw cancelError;
    }

    // Update bookings to cancelled status
    const { error: bookingError } = await supabase
      .from("gym_class_bookings")
      .update({
        status: "cancelled_by_gym",
        cancelled_at: now,
      })
      .in("class_id", classesToCancel)
      .in("status", ["confirmed", "waitlisted"]);

    if (bookingError) {
      console.error("Booking update error:", bookingError);
    }

    // Send notifications if requested
    if (notifyMembers && affectedMembers.length > 0) {
      // Get unique member IDs with their user IDs for push notifications
      const uniqueMemberIds = [...new Set(affectedMembers.map(m => m.memberId))];
      
      const { data: members } = await supabase
        .from("gym_members")
        .select("id, user_id, first_name, email")
        .in("id", uniqueMemberIds);

      const userIds = members?.map(m => m.user_id).filter(Boolean) || [];

      // Send push notification via OneSignal
      if (userIds.length > 0) {
        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              userIds,
              title: "Class Cancelled",
              message: `${classToCancel.gym_class_types?.name || "Your class"} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
              data: {
                type: "class_cancelled",
                classId,
              },
              useExternalUserIds: true,
            },
          });
        } catch (pushError) {
          console.error("Push notification error:", pushError);
        }
      }

      // Create cancellation notification records
      const notificationRecords = affectedMembers.map(m => ({
        class_id: m.classId,
        member_id: m.memberId,
        notification_type: scope === "single" ? "single_cancel" : "series_cancel",
        reason,
      }));

      await supabase
        .from("gym_class_cancellation_notifications")
        .insert(notificationRecords);

      // Create in-app notifications
      const inAppNotifications = members?.map(m => ({
        user_id: m.user_id,
        type: "class_cancelled",
        title: "Class Cancelled",
        message: `${classToCancel.gym_class_types?.name || "Your class"} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
        data: { classId, reason },
        is_read: false,
      })).filter(n => n.user_id) || [];

      if (inAppNotifications.length > 0) {
        await supabase.from("notifications").insert(inAppNotifications);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        cancelledCount: classesToCancel.length,
        notifiedCount: affectedMembers.length,
        message: `Cancelled ${classesToCancel.length} class(es) and notified ${affectedMembers.length} member(s)`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error cancelling class:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
