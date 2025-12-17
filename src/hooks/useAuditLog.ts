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
  admin?: {
    id: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface AuditLogFilters {
  actionType?: string;
  entityType?: string;
  adminId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
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

export const useAuditLogsWithFilters = (filters: AuditLogFilters) => {
  const { actionType, entityType, adminId, startDate, endDate, search, page = 1, limit = 50 } = filters;

  return useQuery({
    queryKey: ["audit-logs-filtered", filters],
    queryFn: async () => {
      // Build query
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          admin:admin_profiles!audit_logs_admin_id_fkey (
            id,
            display_name,
            first_name,
            last_name
          )
        `, { count: "exact" });

      // Apply filters
      if (actionType) {
        query = query.ilike("action", `%${actionType}%`);
      }
      
      if (entityType) {
        query = query.eq("entity_type", entityType);
      }
      
      if (adminId) {
        query = query.eq("admin_id", adminId);
      }
      
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      
      if (endDate) {
        query = query.lte("created_at", endDate);
      }
      
      if (search) {
        query = query.or(`entity_id.ilike.%${search}%,action.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        logs: data as AuditLog[],
        count: count || 0,
      };
    },
  });
};

// Simple async function for logging - can be called from anywhere
export const logAdminAction = async ({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) => {
  try {
    // Get admin profile id
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_id", userId)
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

    if (error) {
      console.error("Failed to log admin action:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to log admin action:", err);
    return null;
  }
};

// Hook version that provides user context automatically
export const useLogAdminAction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const log = async ({
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

    const result = await logAdminAction({
      userId: user.id,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
    });

    // Invalidate queries after logging
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs-filtered"] });

    return result;
  };

  return { log };
};
