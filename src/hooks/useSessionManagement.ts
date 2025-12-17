import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Cancellation policy: minimum hours notice required
const CANCELLATION_NOTICE_HOURS = 24;

export const useSessionManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Cancel a session with policy enforcement
  const cancelSession = useMutation({
    mutationFn: async ({
      sessionId,
      reason,
      forceCancel = false,
    }: {
      sessionId: string;
      reason: string;
      forceCancel?: boolean;
    }) => {
      // Get session details first
      const { data: session, error: fetchError } = await supabase
        .from("coaching_sessions")
        .select("scheduled_at, status")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!session) throw new Error("Session not found");
      if (session.status !== "scheduled") throw new Error("Can only cancel scheduled sessions");

      // Check cancellation policy
      const scheduledTime = new Date(session.scheduled_at);
      const now = new Date();
      const hoursUntilSession = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilSession < CANCELLATION_NOTICE_HOURS && !forceCancel) {
        throw new Error(
          `Sessions must be cancelled at least ${CANCELLATION_NOTICE_HOURS} hours in advance. This session is in ${Math.round(hoursUntilSession)} hours.`
        );
      }

      const { error } = await supabase
        .from("coaching_sessions")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id,
        })
        .eq("id", sessionId);

      if (error) throw error;
      return { late: hoursUntilSession < CANCELLATION_NOTICE_HOURS };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      toast.success(
        data.late
          ? "Session cancelled (late cancellation fee may apply)"
          : "Session cancelled successfully"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel session");
    },
  });

  // Reschedule a session
  const rescheduleSession = useMutation({
    mutationFn: async ({
      sessionId,
      newDateTime,
    }: {
      sessionId: string;
      newDateTime: string;
    }) => {
      // Get original session
      const { data: session, error: fetchError } = await supabase
        .from("coaching_sessions")
        .select("scheduled_at, status, is_online, coach_id")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!session) throw new Error("Session not found");
      if (session.status !== "scheduled") throw new Error("Can only reschedule scheduled sessions");

      const originalTime = session.scheduled_at;

      // Update session with new time
      const { data: updatedSession, error } = await supabase
        .from("coaching_sessions")
        .update({
          scheduled_at: newDateTime,
          rescheduled_from: originalTime,
          // Clear video meeting if rescheduled - will need new link
          video_meeting_url: null,
          video_meeting_id: null,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;

      // Auto-create new video meeting if online session
      if (session.is_online && updatedSession) {
        try {
          await supabase.functions.invoke("video-create-meeting", {
            body: { sessionId, provider: "google_meet" },
          });
        } catch {
          // Video meeting creation skipped - provider not connected
        }
      }

      return updatedSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      toast.success("Session rescheduled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule session");
    },
  });

  // Mark session as completed
  const completeSession = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
    }: {
      sessionId: string;
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status: "completed",
      };
      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from("coaching_sessions")
        .update(updateData)
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      toast.success("Session marked as completed");
    },
    onError: () => {
      toast.error("Failed to update session");
    },
  });

  // Mark as no-show
  const markNoShow = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("coaching_sessions")
        .update({ status: "no_show" })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success("Session marked as no-show");
    },
    onError: () => {
      toast.error("Failed to update session");
    },
  });

  // Save session notes
  const saveNotes = useMutation({
    mutationFn: async ({
      sessionId,
      notes,
    }: {
      sessionId: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("coaching_sessions")
        .update({ notes })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success("Notes saved");
    },
    onError: () => {
      toast.error("Failed to save notes");
    },
  });

  // Create video meeting for session
  const createVideoMeeting = useMutation({
    mutationFn: async ({
      sessionId,
      provider = "google_meet",
    }: {
      sessionId: string;
      provider?: "zoom" | "google_meet";
    }) => {
      const { data, error } = await supabase.functions.invoke("video-create-meeting", {
        body: { sessionId, provider },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      toast.success("Video meeting link created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create video meeting");
    },
  });

  return {
    cancelSession,
    rescheduleSession,
    completeSession,
    markNoShow,
    saveNotes,
    createVideoMeeting,
    CANCELLATION_NOTICE_HOURS,
  };
};
