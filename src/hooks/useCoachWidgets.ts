import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "./useCoachClients";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";

export interface CoachWidgetConfig {
  displayFormat?: WidgetDisplayFormat;
  [key: string]: any;
}

export interface CoachDashboardWidget {
  id: string;
  coach_id: string | null;
  widget_type: string;
  title: string;
  position: number;
  size: "small" | "medium" | "large" | "full";
  is_visible: boolean;
  config: CoachWidgetConfig;
}

export const COACH_WIDGET_TYPES = {
  // Stats Category
  stats_clients: { label: "Active Clients", category: "stats", icon: "Users" },
  stats_sessions: { label: "Sessions This Week", category: "stats", icon: "Calendar" },
  stats_messages: { label: "Unread Messages", category: "stats", icon: "MessageSquare" },
  stats_rating: { label: "Average Rating", category: "stats", icon: "Star" },
  
  // Business Category
  business_earnings: { label: "Monthly Earnings", category: "business", icon: "DollarSign" },
  business_packages: { label: "Active Packages", category: "business", icon: "Package" },
  business_subscriptions: { label: "Active Subscriptions", category: "business", icon: "CreditCard" },
  
  // Lists Category
  list_upcoming: { label: "Upcoming Sessions", category: "lists", icon: "Calendar" },
  list_recent_clients: { label: "Recent Clients", category: "lists", icon: "Users" },
  list_pipeline: { label: "Sales Pipeline", category: "lists", icon: "TrendingUp" },
  
  // Engagement Category
  engagement_connection_requests: { label: "Connection Requests", category: "engagement", icon: "UserPlus" },
  engagement_reviews: { label: "Recent Reviews", category: "engagement", icon: "MessageSquare" },
  
  // Intelligence Category (Phase 3)
  intelligence_client_risk: { label: "Client Attention Needed", category: "intelligence", icon: "AlertTriangle" },
  intelligence_ai_insights: { label: "AI Insights", category: "intelligence", icon: "Sparkles" },
  intelligence_checkin_suggestions: { label: "Smart Check-ins", category: "intelligence", icon: "MessageCircle" },
  
  // Actions Category
  quick_actions: { label: "Quick Actions", category: "actions", icon: "Zap" },
} as const;

export const COACH_WIDGET_CATEGORIES = [
  { key: "stats", label: "Statistics", icon: "BarChart3" },
  { key: "business", label: "Business", icon: "DollarSign" },
  { key: "lists", label: "Lists & Activity", icon: "List" },
  { key: "engagement", label: "Engagement", icon: "Users" },
  { key: "intelligence", label: "Intelligence", icon: "Sparkles" },
  { key: "actions", label: "Quick Actions", icon: "Zap" },
] as const;

// Default widget configuration
const DEFAULT_WIDGETS: Omit<CoachDashboardWidget, "id" | "coach_id">[] = [
  { widget_type: "stats_clients", title: "Active Clients", position: 0, size: "small", is_visible: true, config: {} },
  { widget_type: "stats_sessions", title: "Sessions This Week", position: 1, size: "small", is_visible: true, config: {} },
  { widget_type: "stats_messages", title: "Unread Messages", position: 2, size: "small", is_visible: true, config: {} },
  { widget_type: "stats_rating", title: "Average Rating", position: 3, size: "small", is_visible: true, config: {} },
  { widget_type: "quick_actions", title: "Quick Actions", position: 4, size: "full", is_visible: true, config: {} },
  { widget_type: "engagement_connection_requests", title: "Connection Requests", position: 5, size: "full", is_visible: true, config: {} },
  { widget_type: "list_upcoming", title: "Upcoming Sessions", position: 6, size: "medium", is_visible: true, config: {} },
  { widget_type: "engagement_reviews", title: "Your Reviews", position: 7, size: "medium", is_visible: true, config: {} },
];

export function useCoachWidgets() {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["coach-widgets", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile?.id) return DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `default-${i}`, coach_id: null }));

      const { data, error } = await supabase
        .from("coach_dashboard_widgets")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("position");

      if (error) throw error;

      // If no custom widgets exist, return defaults
      if (!data || data.length === 0) {
        return DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `default-${i}`, coach_id: null })) as CoachDashboardWidget[];
      }

      return data as CoachDashboardWidget[];
    },
    enabled: !!coachProfile?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateCoachWidget() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async ({ widgetId, updates }: { widgetId: string; updates: Partial<CoachDashboardWidget> }) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      // If it's a default widget (not in DB yet), insert it
      if (widgetId.startsWith("default-")) {
        const widgetIndex = parseInt(widgetId.replace("default-", ""));
        const defaultWidget = DEFAULT_WIDGETS[widgetIndex];
        
        const { data, error } = await supabase
          .from("coach_dashboard_widgets")
          .insert({
            coach_id: coachProfile.id,
            ...defaultWidget,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("coach_dashboard_widgets")
        .update(updates)
        .eq("id", widgetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-widgets"] });
    },
  });
}

export function useAddCoachWidget() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (widget: Omit<CoachDashboardWidget, "id" | "coach_id">) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("coach_dashboard_widgets")
        .insert({ ...widget, coach_id: coachProfile.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-widgets"] });
    },
  });
}

export function useResetCoachWidgets() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async () => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      // Delete all custom widgets to reset to defaults
      const { error } = await supabase
        .from("coach_dashboard_widgets")
        .delete()
        .eq("coach_id", coachProfile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-widgets"] });
    },
  });
}

// Batch reorder widgets
export function useReorderCoachWidgets() {
  const queryClient = useQueryClient();
  const { data: coachProfile } = useCoachProfile();

  return useMutation({
    mutationFn: async (widgets: { id: string; position: number }[]) => {
      if (!coachProfile?.id) throw new Error("Coach profile not found");

      // Handle default widgets that need to be created first
      const updates = widgets.map(async ({ id, position }) => {
        if (id.startsWith("default-")) {
          const widgetIndex = parseInt(id.replace("default-", ""));
          const defaultWidget = DEFAULT_WIDGETS[widgetIndex];
          
          return supabase
            .from("coach_dashboard_widgets")
            .insert({
              coach_id: coachProfile.id,
              ...defaultWidget,
              position,
            });
        }
        
        return supabase
          .from("coach_dashboard_widgets")
          .update({ position })
          .eq("id", id);
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-widgets"] });
    },
  });
}
