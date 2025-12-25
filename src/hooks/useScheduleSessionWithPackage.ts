import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "./useCoachClients";
import { toast } from "sonner";

export interface ScheduleSessionWithPackageResult {
  sessionId: string;
  usedPackage: boolean;
  packageInfo?: {
    packageName: string;
    tokensRemaining: number;
    tokensTotal: number;
    expiresAt: string | null;
  };
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
      usePackageCredits?: boolean; // Default true if package exists
    }): Promise<ScheduleSessionWithPackageResult> => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const shouldUsePackage = data.usePackageCredits !== false;

      // Step 1: Check for active package with available tokens
      let activePackage = null;
      if (shouldUsePackage) {
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
      }

      // Step 2: Create the session
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
          status: "scheduled",
          package_purchase_id: activePackage?.id || null,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Step 3: If using package, deduct a token
      if (activePackage) {
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
          usedPackage: true,
          packageInfo: {
            packageName,
            tokensRemaining,
            tokensTotal: activePackage.sessions_total,
            expiresAt: activePackage.expires_at,
          },
        };
      }

      return {
        sessionId: session.id,
        usedPackage: false,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["client-active-package"] });
      queryClient.invalidateQueries({ queryKey: ["client-package-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });

      if (result.usedPackage && result.packageInfo) {
        toast.success(
          `Session scheduled! Used 1 credit from "${result.packageInfo.packageName}" (${result.packageInfo.tokensRemaining} remaining)`
        );
      } else {
        toast.success("Session scheduled successfully");
      }
    },
    onError: () => {
      toast.error("Failed to schedule session. Please try again.");
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
