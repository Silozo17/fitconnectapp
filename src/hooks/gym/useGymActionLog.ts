import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";

export interface GymActionLog {
  id: string;
  gym_id: string;
  location_id: string | null;
  staff_id: string;
  action_type: string;
  action_category: string;
  target_entity_type: string | null;
  target_entity_id: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  requires_owner_review: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  staff?: {
    display_name: string | null;
    role: string;
  };
}

export type ActionCategory = 
  | "membership" 
  | "member" 
  | "payment" 
  | "class" 
  | "settings" 
  | "staff"
  | "inventory"
  | "marketing";

export type ActionType =
  | "membership_cancel"
  | "membership_freeze"
  | "membership_unfreeze"
  | "membership_create"
  | "member_create"
  | "member_update"
  | "member_delete"
  | "payment_refund"
  | "payment_process"
  | "class_booking_override"
  | "class_create"
  | "class_update"
  | "class_cancel"
  | "staff_permission_change"
  | "staff_invite"
  | "staff_remove"
  | "settings_update"
  | "check_in_override"
  | "product_sale"
  | "campaign_send";

interface LogActionParams {
  actionType: ActionType;
  actionCategory: ActionCategory;
  targetEntityType?: string;
  targetEntityId?: string;
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  requiresOwnerReview?: boolean;
  locationId?: string;
}

/**
 * Hook to log staff actions for audit trail
 */
export function useLogGymAction() {
  const { gym, staffRecord } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: LogActionParams) => {
      if (!gym?.id || !staffRecord?.id) {
        throw new Error("No gym or staff context");
      }

      const { error } = await (supabase as any)
        .from("gym_staff_action_logs")
        .insert({
          gym_id: gym.id,
          staff_id: staffRecord.id,
          location_id: params.locationId || null,
          action_type: params.actionType,
          action_category: params.actionCategory,
          target_entity_type: params.targetEntityType || null,
          target_entity_id: params.targetEntityId || null,
          description: params.description,
          old_values: params.oldValues || null,
          new_values: params.newValues || null,
          requires_owner_review: params.requiresOwnerReview || false,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-action-logs"] });
    },
  });
}

/**
 * Hook to fetch action logs with hierarchical visibility
 */
export function useGymActionLogs(options?: {
  category?: ActionCategory;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const { gym } = useGym();
  const { category, staffId, startDate, endDate, limit = 50 } = options || {};

  return useQuery({
    queryKey: ["gym-action-logs", gym?.id, category, staffId, startDate, endDate, limit],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_staff_action_logs")
        .select(`
          *,
          staff:gym_staff!staff_id(display_name, role)
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq("action_category", category);
      }

      if (staffId) {
        query = query.eq("staff_id", staffId);
      }

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymActionLog[];
    },
    enabled: !!gym?.id,
  });
}

/**
 * Hook to mark a log as reviewed
 */
export function useReviewActionLog() {
  const { staffRecord } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!staffRecord?.id) {
        throw new Error("No staff context");
      }

      const { error } = await (supabase as any)
        .from("gym_staff_action_logs")
        .update({
          reviewed_by: staffRecord.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-action-logs"] });
    },
  });
}
