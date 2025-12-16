import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useAuditLogs = (limit = 50) => {
  return useQuery({
    queryKey: ["audit-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

export const useLogAdminAction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
    }: {
      action: string;
      entityType: string;
      entityId?: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
    }) => {
      if (!user) {
        console.warn("No user for audit logging");
        return null;
      }

      // Get admin profile id
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("audit_logs")
        .insert([{
          admin_id: adminProfile?.id || null,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          old_values: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
          new_values: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
          user_agent: navigator.userAgent,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};
