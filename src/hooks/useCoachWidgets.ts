import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "./useCoachClients";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";
import { toast } from "sonner";

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
  business_revenue_forecast: { label: "Revenue Forecast", category: "business", icon: "TrendingUp" },
  business_client_ltv: { label: "Client Lifetime Value", category: "business", icon: "Crown" },
  
  // Lists Category
  list_upcoming: { label: "Upcoming Sessions", category: "lists", icon: "Calendar" },
  list_recent_clients: { label: "Recent Clients", category: "lists", icon: "Users" },
  list_pipeline: { label: "Sales Pipeline", category: "lists", icon: "TrendingUp" },
  
  // Engagement Category
  engagement_connection_requests: { label: "Connection Requests", category: "engagement", icon: "UserPlus" },
  engagement_reviews: { label: "Recent Reviews", category: "engagement", icon: "MessageSquare" },
  
  // Intelligence Category
  intelligence_client_risk: { label: "Churn Risk Analysis", category: "intelligence", icon: "AlertTriangle" },
  intelligence_ai_insights: { label: "AI Insights", category: "intelligence", icon: "Sparkles" },
  intelligence_checkin_suggestions: { label: "Smart Check-ins", category: "intelligence", icon: "MessageCircle" },
  intelligence_engagement_score: { label: "Client Engagement", category: "intelligence", icon: "Activity" },
  
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

const getDefaultWidgets = (): CoachDashboardWidget[] => 
  DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `default-${i}`, coach_id: null }));

export function useCoachWidgets() {
  const { data: coachProfile } = useCoachProfile();

  return useQuery({
    queryKey: ["coach-widgets", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile?.id) return getDefaultWidgets();

      const { data, error } = await supabase
        .from("coach_dashboard_widgets")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("position");

      if (error) throw error;

      // If no custom widgets exist, return defaults
      if (!data || data.length === 0) {
        return getDefaultWidgets();
      }

      return data as CoachDashboardWidget[];
    },
    enabled: !!coachProfile?.id,
    staleTime: 1000 * 30, // 30 seconds for more responsive updates
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
    onMutate: async ({ widgetId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["coach-widgets", coachProfile?.id] });
      
      // Snapshot current state
      const previousWidgets = queryClient.getQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id]);
      
      // Optimistically update cache
      queryClient.setQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id], (old) => {
        if (!old) return old;
        return old.map(widget => 
          widget.id === widgetId ? { ...widget, ...updates } : widget
        );
      });
      
      return { previousWidgets };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousWidgets) {
        queryClient.setQueryData(["coach-widgets", coachProfile?.id], context.previousWidgets);
      }
      toast.error("Failed to update widget");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["coach-widgets"],
        refetchType: 'all'
      });
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
    onMutate: async (newWidget) => {
      await queryClient.cancelQueries({ queryKey: ["coach-widgets", coachProfile?.id] });
      
      const previousWidgets = queryClient.getQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id]);
      
      // Optimistically add the widget with a temp ID
      queryClient.setQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id], (old) => {
        if (!old) return old;
        const tempWidget: CoachDashboardWidget = {
          ...newWidget,
          id: `temp-${Date.now()}`,
          coach_id: coachProfile?.id || null,
        };
        return [...old, tempWidget];
      });
      
      return { previousWidgets };
    },
    onError: (err, variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(["coach-widgets", coachProfile?.id], context.previousWidgets);
      }
      toast.error("Failed to add widget");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["coach-widgets"],
        refetchType: 'all'
      });
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["coach-widgets", coachProfile?.id] });
      
      const previousWidgets = queryClient.getQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id]);
      
      // Optimistically reset to defaults
      queryClient.setQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id], getDefaultWidgets());
      
      return { previousWidgets };
    },
    onError: (err, variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(["coach-widgets", coachProfile?.id], context.previousWidgets);
      }
      toast.error("Failed to reset widgets");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["coach-widgets"],
        refetchType: 'all'
      });
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
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["coach-widgets", coachProfile?.id] });
      
      const previousWidgets = queryClient.getQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id]);
      
      // Optimistically update positions
      queryClient.setQueryData<CoachDashboardWidget[]>(["coach-widgets", coachProfile?.id], (old) => {
        if (!old) return old;
        return old.map(widget => {
          const newPos = newOrder.find(o => o.id === widget.id);
          return newPos ? { ...widget, position: newPos.position } : widget;
        }).sort((a, b) => a.position - b.position);
      });
      
      return { previousWidgets };
    },
    onError: (err, variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(["coach-widgets", coachProfile?.id], context.previousWidgets);
      }
      toast.error("Failed to reorder widgets");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["coach-widgets"],
        refetchType: 'all'
      });
    },
  });
}
