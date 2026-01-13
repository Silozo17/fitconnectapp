import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "./useCoachClients";
import { toast } from "sonner";
import { createNotification } from "@/utils/notifications";

export type PaymentMode = "free" | "use_credits" | "paid";

export interface ScheduleSessionWithPackageResult {
  sessionId: string;
  paymentMode: PaymentMode;
  usedPackage: boolean;
  packageInfo?: {
    packageName: string;
    tokensRemaining: number;
    tokensTotal: number;
    expiresAt: string | null;
  };
  requiresPayment?: boolean;
  price?: number;
}

export function useScheduleSessionWithPackage() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      scheduledAt: string;
      duration: number;
      sessionType: string;
      isOnline: boolean;
      location?: string;
      notes?: string;
      paymentMode: PaymentMode;
      price?: number;
      currency?: string;
    }): Promise<ScheduleSessionWithPackageResult> => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const { paymentMode, price, currency = "GBP" } = data;

      // Step 1: For use_credits mode, verify package exists and has credits
      let activePackage = null;
      if (paymentMode === "use_credits") {
        const { data: packages, error: pkgError } = await supabase
          .from("client_package_purchases")
          .select("*, coach_packages(*)")
          .eq("client_id", data.clientId)
          .eq("coach_id", coachProfile.id)
          .eq("status", "active")
          .order("purchased_at", { ascending: true });

        if (pkgError) throw pkgError;

        // Find the first package with available tokens and not expired
        activePackage = packages?.find(pkg => {
          const tokensRemaining = pkg.sessions_total - (pkg.sessions_used || 0);
          const notExpired = !pkg.expires_at || new Date(pkg.expires_at) > new Date();
          return tokensRemaining > 0 && notExpired;
        });

        if (!activePackage) {
          throw new Error("No active package with available credits found");
        }
      }

      // Step 2: Determine session status and payment status based on payment mode
      let sessionStatus = "scheduled";
      let paymentStatus: string | null = null;

      if (paymentMode === "paid") {
        sessionStatus = "pending_payment";
        paymentStatus = "pending";
      }

      // Step 3: Create the session
      const { data: session, error: sessionError } = await supabase
        .from("coaching_sessions")
        .insert({
          coach_id: coachProfile.id,
          client_id: data.clientId,
          scheduled_at: data.scheduledAt,
          duration_minutes: data.duration,
          session_type: data.sessionType,
          is_online: data.isOnline,
          location: data.location,
          notes: data.notes,
          status: sessionStatus,
          payment_mode: paymentMode,
          payment_status: paymentStatus,
          price: paymentMode === "paid" ? price : null,
          currency: paymentMode === "paid" ? currency : null,
          package_purchase_id: activePackage?.id || null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create video meeting for online sessions
      if (data.isOnline && session) {
        try {
          // Get coach's active video provider and auto_create setting
          const { data: videoSettings } = await supabase
            .from("video_conference_settings")
            .select("provider, auto_create_meetings")
            .eq("coach_id", coachProfile.id)
            .eq("is_active", true)
            .single();

          // Only create meeting if auto_create is enabled (default true if null/undefined)
          if (videoSettings?.provider && videoSettings?.auto_create_meetings !== false) {
            await supabase.functions.invoke("video-create-meeting", {
              body: { sessionId: session.id, provider: videoSettings.provider },
            });
            console.log("Video meeting created for online session");
          }
        } catch (videoError) {
          console.error("Video meeting creation failed (non-blocking):", videoError);
          // Non-blocking - session is still created
        }
      }

      // Step 4: If using package credits, deduct a token
      if (paymentMode === "use_credits" && activePackage) {
        const newUsage = (activePackage.sessions_used || 0) + 1;

        // Update sessions_used
        const { error: updateError } = await supabase
          .from("client_package_purchases")
          .update({ sessions_used: newUsage })
          .eq("id", activePackage.id);

        if (updateError) throw updateError;

        // Log token usage
        await supabase
          .from("session_token_history")
          .insert({
            package_purchase_id: activePackage.id,
            session_id: session.id,
            action: "used",
            reason: "Session scheduled",
          });

        const tokensRemaining = activePackage.sessions_total - newUsage;
        const packageName = (activePackage.coach_packages as any)?.name || "Package";

        return {
          sessionId: session.id,
          paymentMode,
          usedPackage: true,
          packageInfo: {
            packageName,
            tokensRemaining,
            tokensTotal: activePackage.sessions_total,
            expiresAt: activePackage.expires_at,
          },
        };
      }

      // Step 5: If paid session, get client's user_id and send notification
      if (paymentMode === "paid") {
        // Get client's user_id
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("user_id")
          .eq("id", data.clientId)
          .single();

        if (clientProfile?.user_id) {
          // Get coach's display name for notification
          const coachName = coachProfile.display_name || coachProfile.username || "Your coach";

          await createNotification({
            userId: clientProfile.user_id,
            type: "session_payment_required",
            title: "Payment Required for Session",
            message: `${coachName} has scheduled a session for £${price?.toFixed(2)}. Please complete payment to confirm.`,
            data: {
              sessionId: session.id,
              coachId: coachProfile.id,
              price,
              currency,
            },
          });
        }

        return {
          sessionId: session.id,
          paymentMode,
          usedPackage: false,
          requiresPayment: true,
          price,
        };
      }

      // Free session
      return {
        sessionId: session.id,
        paymentMode,
        usedPackage: false,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-active-package"] });
      queryClient.invalidateQueries({ queryKey: ["client-package-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions", coachProfile?.id] });

      if (result.usedPackage && result.packageInfo) {
        toast.success(
          `Session scheduled! Used 1 credit from "${result.packageInfo.packageName}" (${result.packageInfo.tokensRemaining} remaining)`
        );
      } else if (result.requiresPayment) {
        toast.success("Session created. Client will be notified to complete payment.");
      } else {
        toast.success("Session scheduled successfully");
      }
    },
    onError: (error: Error) => {
      if (error.message === "No active package with available credits found") {
        toast.error("Client has no available package credits");
      } else {
        toast.error("Failed to schedule session. Please try again.");
      }
    },
  });
}

// Hook to get client's active package info for display
export function useClientPackageCredits(clientId: string | undefined, coachId: string | undefined) {
  const { data: coachProfile } = useCoachProfile();
  const actualCoachId = coachId || coachProfile?.id;

  return {
    queryKey: ["client-package-credits", clientId, actualCoachId],
    enabled: !!clientId && !!actualCoachId,
  };
}
