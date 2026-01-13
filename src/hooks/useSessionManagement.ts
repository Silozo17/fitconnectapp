import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Default cancellation policy (can be overridden by coach setting)
const DEFAULT_CANCELLATION_NOTICE_HOURS = 24;

export const useSessionManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Cancel a session with policy enforcement and token handling
  const cancelSession = useMutation({
    mutationFn: async ({
      sessionId,
      reason,
      forceCancel = false,
      returnToken = false,
    }: {
      sessionId: string;
      reason: string;
      forceCancel?: boolean;
      returnToken?: boolean; // Coach can override to return token even on late cancellation
    }) => {
      // Get session details including package info and video meeting
      const { data: session, error: fetchError } = await supabase
        .from("coaching_sessions")
        .select("scheduled_at, status, coach_id, client_id, package_purchase_id, token_returned, video_meeting_id, is_online")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!session) throw new Error("Session not found");
      if (session.status !== "scheduled") throw new Error("Can only cancel scheduled sessions");

      // Get coach's cancellation policy
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("min_cancellation_hours, user_id")
        .eq("id", session.coach_id)
        .single();

      const cancellationHours = coachProfile?.min_cancellation_hours ?? DEFAULT_CANCELLATION_NOTICE_HOURS;
      const isCoachCancelling = user?.id === coachProfile?.user_id;

      // Check cancellation policy
      const scheduledTime = new Date(session.scheduled_at);
      const now = new Date();
      const hoursUntilSession = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isLateCancellation = hoursUntilSession < cancellationHours;

      if (isLateCancellation && !forceCancel && !isCoachCancelling) {
        throw new Error(
          `Sessions must be cancelled at least ${cancellationHours} hours in advance. This session is in ${Math.round(hoursUntilSession)} hours.`
        );
      }

      // Delete video meeting if exists (fire-and-forget)
      if (session.video_meeting_id && session.is_online) {
        try {
          // Get coach's video provider
          const { data: videoSettings } = await supabase
            .from("video_conference_settings")
            .select("provider")
            .eq("coach_id", session.coach_id)
            .eq("is_active", true)
            .single();

          if (videoSettings?.provider) {
            supabase.functions.invoke("video-delete-meeting", {
              body: {
                meetingId: session.video_meeting_id,
                provider: videoSettings.provider,
                coachId: session.coach_id,
                sessionId,
              },
            }).catch((err) => console.error("Video meeting deletion failed (non-blocking):", err));
          }
        } catch (err) {
          console.error("Failed to get video settings for deletion:", err);
        }
      }

      // Cancel the session
      const { error } = await supabase
        .from("coaching_sessions")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id,
          video_meeting_url: null,
          video_meeting_id: null,
        })
        .eq("id", sessionId);

      if (error) throw error;

      // Handle token return logic
      let tokenReturned = false;
      if (session.package_purchase_id && !session.token_returned) {
        // Return token if:
        // 1. Coach is cancelling (always return)
        // 2. Client is cancelling within policy window
        // 3. Coach explicitly requests token return (override)
        const shouldReturnToken = isCoachCancelling || !isLateCancellation || returnToken;
        
        if (shouldReturnToken) {
          // Decrement sessions_used
          const { data: purchase } = await supabase
            .from("client_package_purchases")
            .select("sessions_used")
            .eq("id", session.package_purchase_id)
            .single();

          if (purchase) {
            const newUsage = Math.max(0, (purchase.sessions_used || 1) - 1);
            await supabase
              .from("client_package_purchases")
              .update({ sessions_used: newUsage })
              .eq("id", session.package_purchase_id);

            // Mark token as returned
            await supabase
              .from("coaching_sessions")
              .update({ 
                token_returned: true,
                token_returned_by: user?.id,
                token_return_reason: isCoachCancelling ? "Coach cancelled session" : reason,
              })
              .eq("id", sessionId);

            // Log token return
            await supabase
              .from("session_token_history")
              .insert({
                package_purchase_id: session.package_purchase_id,
                session_id: sessionId,
                action: returnToken && isLateCancellation ? "manual_return" : "returned",
                reason: isCoachCancelling ? "Coach cancelled session" : reason,
                performed_by: user?.id,
              });

            tokenReturned = true;
          }
        }
      }
      
      // Send cancellation email
      const cancelledByRole = isCoachCancelling ? "coach" : "client";
      await supabase.functions.invoke("send-booking-cancelled", {
        body: { sessionId, cancelledBy: cancelledByRole, reason },
      }).catch((err) => console.error("Failed to send cancellation email:", err));
      
      return { 
        late: isLateCancellation, 
        tokenReturned,
        tokenForfeited: session.package_purchase_id && !tokenReturned && isLateCancellation,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-active-package"] });
      queryClient.invalidateQueries({ queryKey: ["client-package-purchases"] });
      
      if (data.tokenForfeited) {
        toast.success("Session cancelled. Token was forfeited due to late cancellation.");
      } else if (data.tokenReturned) {
        toast.success("Session cancelled. Token returned to package.");
      } else {
        toast.success(data.late ? "Session cancelled (late cancellation)" : "Session cancelled successfully");
      }
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
        .select("scheduled_at, status, is_online, coach_id, video_meeting_id")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!session) throw new Error("Session not found");
      if (session.status !== "scheduled") throw new Error("Can only reschedule scheduled sessions");

      const originalTime = session.scheduled_at;
      const oldMeetingId = session.video_meeting_id;

      // Delete old video meeting if exists (fire-and-forget)
      if (oldMeetingId && session.is_online) {
        try {
          const { data: videoSettingsForDelete } = await supabase
            .from("video_conference_settings")
            .select("provider")
            .eq("coach_id", session.coach_id)
            .eq("is_active", true)
            .single();

          if (videoSettingsForDelete?.provider) {
            supabase.functions.invoke("video-delete-meeting", {
              body: {
                meetingId: oldMeetingId,
                provider: videoSettingsForDelete.provider,
                coachId: session.coach_id,
                sessionId,
              },
            }).catch((err) => console.error("Old video meeting deletion failed (non-blocking):", err));
          }
        } catch (err) {
          console.error("Failed to delete old video meeting:", err);
        }
      }

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
          // Get coach's actual video provider and auto_create setting
          const { data: videoSettings } = await supabase
            .from("video_conference_settings")
            .select("provider, auto_create_meetings")
            .eq("coach_id", session.coach_id)
            .eq("is_active", true)
            .single();

          // Only create meeting if auto_create is enabled (default true if null/undefined)
          if (videoSettings?.provider && videoSettings?.auto_create_meetings !== false) {
            await supabase.functions.invoke("video-create-meeting", {
              body: { sessionId, provider: videoSettings.provider },
            });
          }
        } catch {
          // Video meeting creation skipped - provider not connected or auto_create disabled
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
      
      // Get session to find coach
      const { data: session } = await supabase
        .from("coaching_sessions")
        .select("coach_id")
        .eq("id", sessionId)
        .single();

      if (session) {
        // Check coach's review request settings
        const { data: coachSettings } = await supabase
          .from("coach_profiles")
          .select("review_request_mode, review_request_delay_hours, custom_review_message")
          .eq("id", session.coach_id)
          .single();

        // Only send review request if mode is 'auto' (default behavior)
        const reviewMode = coachSettings?.review_request_mode || "auto";
        
        if (reviewMode === "auto") {
          // Fire and forget - send review request email in background
          // Don't await - user gets immediate confirmation
          supabase.functions.invoke("send-review-request", {
            body: { 
              sessionId,
              customMessage: coachSettings?.custom_review_message || null,
              delayHours: coachSettings?.review_request_delay_hours || 0,
            },
          }).catch((err) => console.error("Failed to send review request email:", err));
        }
      }
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
    DEFAULT_CANCELLATION_NOTICE_HOURS,
  };
};
