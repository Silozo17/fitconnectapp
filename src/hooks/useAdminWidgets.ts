import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardWidget {
  id: string;
  admin_id: string | null;
  widget_type: string;
  title: string;
  position: number;
  size: "small" | "medium" | "large" | "full";
  is_visible: boolean;
  config: Record<string, any>;
}

export const WIDGET_TYPES = {
  stats_users: { label: "Total Users", category: "stats", icon: "Users" },
  stats_coaches: { label: "Active Coaches", category: "stats", icon: "Dumbbell" },
  stats_sessions: { label: "Scheduled Sessions", category: "stats", icon: "Calendar" },
  stats_revenue: { label: "Monthly Revenue", category: "stats", icon: "DollarSign" },
  recent_activity: { label: "Recent Activity", category: "list", icon: "Activity" },
  quick_actions: { label: "Quick Actions", category: "actions", icon: "Zap" },
  pending_verifications: { label: "Pending Verifications", category: "list", icon: "Shield" },
  recent_signups: { label: "Recent Signups", category: "list", icon: "UserPlus" },
  chart_signups: { label: "User Signups Chart", category: "chart", icon: "TrendingUp" },
  chart_revenue: { label: "Revenue Chart", category: "chart", icon: "BarChart" },
} as const;

export function useAdminWidgets() {
  return useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      // Get admin profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Get user's custom widgets or defaults
      const { data, error } = await supabase
        .from("admin_dashboard_widgets")
        .select("*")
        .or(`admin_id.eq.${adminProfile?.id},admin_id.is.null`)
        .order("position");

      if (error) throw error;

      // Prefer user-specific widgets over defaults
      const widgetMap = new Map<string, DashboardWidget>();
      data?.forEach((widget: any) => {
        const existing = widgetMap.get(widget.widget_type);
        if (!existing || widget.admin_id) {
          widgetMap.set(widget.widget_type, widget);
        }
      });

      return Array.from(widgetMap.values()).sort((a, b) => a.position - b.position);
    },
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ widgetId, updates }: { widgetId: string; updates: Partial<DashboardWidget> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Check if this is a default widget (admin_id is null)
      const { data: existingWidget } = await supabase
        .from("admin_dashboard_widgets")
        .select("*")
        .eq("id", widgetId)
        .single();

      if (existingWidget?.admin_id === null && adminProfile) {
        // Create a user-specific copy
        const { data, error } = await supabase
          .from("admin_dashboard_widgets")
          .insert({
            ...existingWidget,
            id: undefined,
            admin_id: adminProfile.id,
            ...updates,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Update existing user-specific widget
        const { data, error } = await supabase
          .from("admin_dashboard_widgets")
          .update(updates)
          .eq("id", widgetId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
    },
  });
}

export function useAddWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widget: Omit<DashboardWidget, "id" | "admin_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("admin_dashboard_widgets")
        .insert({ ...widget, admin_id: adminProfile?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
    },
  });
}

export function useRemoveWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgetId: string) => {
      const { error } = await supabase
        .from("admin_dashboard_widgets")
        .delete()
        .eq("id", widgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
    },
  });
}

export function useResetWidgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (adminProfile) {
        // Delete all user-specific widgets to revert to defaults
        const { error } = await supabase
          .from("admin_dashboard_widgets")
          .delete()
          .eq("admin_id", adminProfile.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
    },
  });
}

// Dashboard stats hook
export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [usersRes, coachesRes, sessionsRes, revenueRes, verificationRes, recentUsersRes, activityRes] = await Promise.all([
        supabase.from("client_profiles").select("id", { count: "exact", head: true }),
        supabase.from("coach_profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("platform_subscriptions").select("*").eq("status", "active"),
        supabase.from("coach_verification_documents").select("id, coach_id, document_type, status, created_at, coach_profiles(display_name)").eq("status", "pending").limit(5),
        supabase.from("client_profiles").select("id, first_name, last_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, sub: any) => sum + (sub.amount || 0), 0) || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalCoaches: coachesRes.count || 0,
        activeSessions: sessionsRes.count || 0,
        monthlyRevenue: totalRevenue,
        pendingVerifications: verificationRes.data || [],
        recentSignups: recentUsersRes.data || [],
        recentActivity: activityRes.data || [],
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
