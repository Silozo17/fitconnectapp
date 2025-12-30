import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";

export type BatchOperationType = 
  | "assign_plan"
  | "send_message"
  | "update_status"
  | "add_habit"
  | "add_challenge";

export interface BatchOperationPayload {
  type: BatchOperationType;
  clientIds: string[];
  data: {
    planId?: string;
    message?: string;
    status?: string;
    habitId?: string;
    challengeId?: string;
  };
}

export interface BatchOperationResult {
  success: boolean;
  clientId: string;
  clientName?: string;
  error?: string;
}

export interface BatchOperationSummary {
  total: number;
  successful: number;
  failed: number;
  results: BatchOperationResult[];
}

export function useBatchOperations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BatchOperationPayload): Promise<BatchOperationSummary> => {
      if (!user?.id || !isFeatureEnabled("BATCH_OPERATIONS")) {
        throw new Error("Batch operations not available");
      }

      // Get coach profile
      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) {
        throw new Error("Coach profile not found");
      }

      const results: BatchOperationResult[] = [];

      // Process each client
      for (const clientId of payload.clientIds) {
        try {
          // Get client name for reporting
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("first_name, last_name, username")
            .eq("id", clientId)
            .single();

          const clientName = clientProfile 
            ? [clientProfile.first_name, clientProfile.last_name].filter(Boolean).join(" ") || clientProfile.username
            : "Unknown";

          switch (payload.type) {
            case "assign_plan": {
              if (!payload.data.planId) throw new Error("Plan ID required");
              
              // Assign training plan to client
              const { error } = await supabase
                .from("training_plans")
                .update({ 
                  assigned_to_client_id: clientId,
                  updated_at: new Date().toISOString()
                })
                .eq("id", payload.data.planId)
                .eq("coach_id", coachProfile.id);

              if (error) throw error;
              break;
            }

            case "send_message": {
              if (!payload.data.message) throw new Error("Message content required");
              
              const { error } = await supabase
                .from("messages")
                .insert({
                  sender_id: coachProfile.id,
                  receiver_id: clientId,
                  content: payload.data.message,
                  is_from_coach: true,
                });

              if (error) throw error;
              break;
            }

            case "update_status": {
              if (!payload.data.status) throw new Error("Status required");
              
              const { error } = await supabase
                .from("coach_clients")
                .update({ 
                  status: payload.data.status,
                  updated_at: new Date().toISOString()
                })
                .eq("client_id", clientId)
                .eq("coach_id", coachProfile.id);

              if (error) throw error;
              break;
            }

            case "add_habit": {
              // This would copy a habit template to the client
              // Simplified for now - would need habit template system
              results.push({
                success: false,
                clientId,
                clientName,
                error: "Habit assignment not yet implemented",
              });
              continue;
            }

            case "add_challenge": {
              if (!payload.data.challengeId) throw new Error("Challenge ID required");
              
              // Check if already participating
              const { data: existing } = await supabase
                .from("challenge_participants")
                .select("id")
                .eq("client_id", clientId)
                .eq("challenge_id", payload.data.challengeId)
                .maybeSingle();

              if (existing) {
                results.push({
                  success: false,
                  clientId,
                  clientName,
                  error: "Already participating in challenge",
                });
                continue;
              }

              const { error } = await supabase
                .from("challenge_participants")
                .insert({
                  client_id: clientId,
                  challenge_id: payload.data.challengeId,
                  status: "active",
                  current_progress: 0,
                });

              if (error) throw error;
              break;
            }

            default:
              throw new Error(`Unknown operation type: ${payload.type}`);
          }

          results.push({
            success: true,
            clientId,
            clientName,
          });

        } catch (error) {
          results.push({
            success: false,
            clientId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const summary: BatchOperationSummary = {
        total: payload.clientIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };

      return summary;
    },
    onSuccess: (summary) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });

      if (summary.failed === 0) {
        toast.success(`Successfully updated ${summary.successful} clients`);
      } else if (summary.successful === 0) {
        toast.error(`Failed to update all ${summary.failed} clients`);
      } else {
        toast.warning(
          `Updated ${summary.successful} clients, ${summary.failed} failed`
        );
      }
    },
    onError: (error) => {
      toast.error("Batch operation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });
}
