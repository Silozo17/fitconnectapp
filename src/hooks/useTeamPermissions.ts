import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FeaturePermission {
  key: string;
  label: string;
  description: string;
  category: "data" | "management" | "settings";
}

export const AVAILABLE_FEATURES: FeaturePermission[] = [
  // Data & Analytics
  { key: "view_revenue", label: "View Revenue", description: "Access revenue and earnings dashboards", category: "data" },
  { key: "view_analytics", label: "View Analytics", description: "Access platform analytics and metrics", category: "data" },
  { key: "view_audit_logs", label: "View Audit Logs", description: "Access audit trail and activity logs", category: "data" },
  { key: "view_gym_financials", label: "Gym Financials", description: "View gym revenue and subscription data", category: "data" },
  
  // User Management
  { key: "manage_users", label: "Manage Users", description: "View and manage client accounts", category: "management" },
  { key: "manage_coaches", label: "Manage Coaches", description: "View and manage coach accounts", category: "management" },
  { key: "manage_gyms", label: "Manage Gyms", description: "View and manage gym accounts", category: "management" },
  { key: "manage_team", label: "Manage Team", description: "View and manage team members", category: "management" },
  { key: "manage_verifications", label: "Manage Verifications", description: "Handle coach verification requests", category: "management" },
  
  // Platform Settings
  { key: "manage_settings", label: "Platform Settings", description: "Access and modify platform settings", category: "settings" },
  { key: "manage_challenges", label: "Manage Challenges", description: "Create and edit platform challenges", category: "settings" },
  { key: "manage_avatars", label: "Manage Avatars", description: "Manage the avatar system", category: "settings" },
];

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: AVAILABLE_FEATURES.map(f => f.key), // All features
  manager: ["view_analytics", "manage_users", "manage_coaches", "manage_gyms", "manage_verifications", "manage_challenges"],
  staff: ["manage_users", "manage_coaches", "manage_gyms"],
};

export function useTeamPermissions(adminProfileId: string | undefined) {
  return useQuery({
    queryKey: ["team-permissions", adminProfileId],
    queryFn: async () => {
      if (!adminProfileId) return {};
      
      const { data, error } = await supabase
        .from("team_feature_permissions")
        .select("feature_key, is_enabled")
        .eq("admin_id", adminProfileId);

      if (error) throw error;

      // Convert to map
      const permissionMap: Record<string, boolean> = {};
      data?.forEach((p) => {
        permissionMap[p.feature_key] = p.is_enabled;
      });

      return permissionMap;
    },
    enabled: !!adminProfileId,
  });
}

export function useTogglePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      adminProfileId,
      featureKey,
      isEnabled,
    }: {
      adminProfileId: string;
      featureKey: string;
      isEnabled: boolean;
    }) => {
      const { error } = await supabase
        .from("team_feature_permissions")
        .upsert(
          {
            admin_id: adminProfileId,
            feature_key: featureKey,
            is_enabled: isEnabled,
          },
          { onConflict: "admin_id,feature_key" }
        );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["team-permissions", variables.adminProfileId],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update permission");
    },
  });
}

export function useBulkSetPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      adminProfileId,
      permissions,
    }: {
      adminProfileId: string;
      permissions: Record<string, boolean>;
    }) => {
      const records = Object.entries(permissions).map(([featureKey, isEnabled]) => ({
        admin_id: adminProfileId,
        feature_key: featureKey,
        is_enabled: isEnabled,
      }));

      const { error } = await supabase
        .from("team_feature_permissions")
        .upsert(records, { onConflict: "admin_id,feature_key" });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["team-permissions", variables.adminProfileId],
      });
      toast.success("Permissions updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update permissions");
    },
  });
}
