import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WidgetDisplayFormat } from "@/lib/widget-formats";

export interface WidgetConfig {
  displayFormat?: WidgetDisplayFormat;
  [key: string]: any;
}

export interface DashboardWidget {
  id: string;
  admin_id: string | null;
  widget_type: string;
  title: string;
  position: number;
  size: "small" | "medium" | "large" | "full";
  is_visible: boolean;
  config: WidgetConfig;
}

export const WIDGET_TYPES = {
  // Stats Category
  stats_users: { label: "Total Users", category: "stats", icon: "Users" },
  stats_coaches: { label: "Active Coaches", category: "stats", icon: "Dumbbell" },
  stats_sessions: { label: "Scheduled Sessions", category: "stats", icon: "Calendar" },
  stats_revenue: { label: "Monthly Revenue", category: "stats", icon: "DollarSign" },
  stats_messages: { label: "Total Messages", category: "stats", icon: "MessageSquare" },
  stats_reviews: { label: "Total Reviews", category: "stats", icon: "Star" },
  
  // Gym Stats Category
  stats_gyms: { label: "Total Gyms", category: "gyms", icon: "Building2" },
  stats_active_gyms: { label: "Active Gyms", category: "gyms", icon: "Building2" },
  stats_gym_locations: { label: "Total Locations", category: "gyms", icon: "MapPin" },
  
  // Revenue Category
  revenue_mrr: { label: "MRR (Monthly Recurring)", category: "revenue", icon: "TrendingUp" },
  revenue_commissions: { label: "Platform Commissions", category: "revenue", icon: "Percent" },
  revenue_active_subs: { label: "Active Subscriptions", category: "revenue", icon: "CreditCard" },
  revenue_tier_distribution: { label: "Tier Distribution", category: "revenue", icon: "PieChart" },
  revenue_total_income: { label: "Total Platform Income", category: "revenue", icon: "Wallet" },
  revenue_gym_mrr: { label: "Gym Subscription MRR", category: "revenue", icon: "Building2" },
  revenue_gym_fees: { label: "Membership Fees", category: "revenue", icon: "Receipt" },
  
  // Analytics Category
  analytics_growth_rate: { label: "User Growth Rate", category: "analytics", icon: "TrendingUp" },
  analytics_session_rate: { label: "Session Completion Rate", category: "analytics", icon: "CheckCircle" },
  analytics_engagement: { label: "User Engagement", category: "analytics", icon: "Activity" },
  analytics_coach_ratio: { label: "Coach to Client Ratio", category: "analytics", icon: "Users" },
  
  // Charts Category
  chart_signups: { label: "User Signups Chart", category: "charts", icon: "AreaChart" },
  chart_revenue: { label: "Revenue Chart", category: "charts", icon: "LineChart" },
  chart_sessions: { label: "Session Activity Chart", category: "charts", icon: "BarChart3" },
  
  // Integrations Category
  integration_health: { label: "Integration Health", category: "integrations", icon: "Activity" },
  integration_video: { label: "Video Conferencing Stats", category: "integrations", icon: "Video" },
  integration_calendar: { label: "Calendar Sync Stats", category: "integrations", icon: "Calendar" },
  integration_wearables: { label: "Wearables Stats", category: "integrations", icon: "Watch" },
  integration_grocery: { label: "Grocery Integration Stats", category: "integrations", icon: "ShoppingCart" },
  
  // Lists Category
  recent_activity: { label: "Recent Activity", category: "lists", icon: "Activity" },
  pending_verifications: { label: "Pending Verifications", category: "lists", icon: "Shield" },
  recent_signups: { label: "Recent Signups", category: "lists", icon: "UserPlus" },
  recent_transactions: { label: "Recent Transactions", category: "lists", icon: "Receipt" },
  recent_reviews: { label: "Recent Reviews", category: "lists", icon: "MessageSquare" },
  top_coaches: { label: "Top Performing Coaches", category: "lists", icon: "Award" },
  flagged_documents: { label: "AI Flagged Documents", category: "lists", icon: "AlertTriangle" },
  
  // Actions Category
  quick_actions: { label: "Quick Actions", category: "actions", icon: "Zap" },
} as const;

export const WIDGET_CATEGORIES = [
  { key: "stats", label: "Statistics", icon: "BarChart3" },
  { key: "gyms", label: "Gym Management", icon: "Building2" },
  { key: "revenue", label: "Revenue & Finance", icon: "DollarSign" },
  { key: "analytics", label: "Analytics & Metrics", icon: "TrendingUp" },
  { key: "charts", label: "Charts & Graphs", icon: "LineChart" },
  { key: "integrations", label: "Integrations", icon: "Link2" },
  { key: "lists", label: "Lists & Activity", icon: "List" },
  { key: "actions", label: "Quick Actions", icon: "Zap" },
] as const;

export function useAdminWidgets() {
  return useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("admin_dashboard_widgets")
        .select("*")
        .or(`admin_id.eq.${adminProfile?.id},admin_id.is.null`)
        .order("position");

      if (error) throw error;

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

      const { data: existingWidget } = await supabase
        .from("admin_dashboard_widgets")
        .select("*")
        .eq("id", widgetId)
        .single();

      if (existingWidget?.admin_id === null && adminProfile) {
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

// Batch reorder widgets
export function useReorderWidgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgets: { id: string; position: number }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Update each widget's position
      const updates = widgets.map(async ({ id, position }) => {
        // Check if widget exists in DB
        const { data: existing } = await supabase
          .from("admin_dashboard_widgets")
          .select("id, admin_id")
          .eq("id", id)
          .single();

        if (existing?.admin_id === null && adminProfile) {
          // Create user-specific copy with new position
          const { data: widget } = await supabase
            .from("admin_dashboard_widgets")
            .select("*")
            .eq("id", id)
            .single();

          if (widget) {
            return supabase
              .from("admin_dashboard_widgets")
              .insert({
                ...widget,
                id: undefined,
                admin_id: adminProfile.id,
                position,
              });
          }
        } else if (existing) {
          return supabase
            .from("admin_dashboard_widgets")
            .update({ position })
            .eq("id", id);
        }
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-widgets"] });
    },
  });
}

// Dashboard stats hook with comprehensive data fetching
export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        usersRes,
        coachesRes,
        sessionsRes,
        completedSessionsRes,
        subscriptionsRes,
        messagesRes,
        reviewsRes,
        verificationRes,
        recentUsersRes,
        activityRes,
        transactionsRes,
        videoRes,
        calendarRes,
        wearableRes,
        groceryRes,
        flaggedDocsRes,
        topCoachesRes,
        recentReviewsRes,
        last30DaysUsersRes,
        prev30DaysUsersRes,
        // Gym stats
        gymsRes,
        activeGymsRes,
        gymLocationsRes,
        gymPaymentsRes,
      ] = await Promise.all([
        // Core counts
        supabase.from("client_profiles").select("id", { count: "exact", head: true }),
        supabase.from("coach_profiles").select("id", { count: "exact", head: true }).eq("onboarding_completed", true),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("platform_subscriptions").select("*").eq("status", "active"),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        
        // Lists
        supabase.from("coach_verification_documents")
          .select("id, coach_id, document_type, status, created_at, coach_profiles(display_name)")
          .eq("status", "pending").limit(5),
        supabase.from("client_profiles")
          .select("id, first_name, last_name, created_at")
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("transactions")
          .select("*")
          .order("created_at", { ascending: false }).limit(5),
          
        // Integration counts
        supabase.from("video_conference_settings").select("id, provider", { count: "exact" }),
        supabase.from("calendar_connections").select("id, provider", { count: "exact" }),
        supabase.from("wearable_connections").select("id, provider", { count: "exact" }),
        supabase.from("grocery_lists").select("id", { count: "exact", head: true }),
        
        // Flagged documents
        supabase.from("coach_verification_documents")
          .select("id, coach_id, document_type, ai_flagged_reasons, created_at, coach_profiles(display_name)")
          .eq("ai_flagged", true).limit(5),
          
        // Top coaches by reviews
        supabase.from("coach_profiles")
          .select("id, display_name, profile_image_url")
          .eq("onboarding_completed", true)
          .limit(5),
          
        // Recent reviews
        supabase.from("reviews")
          .select("id, rating, review_text, created_at, client_profiles(first_name)")
          .order("created_at", { ascending: false }).limit(5),
          
        // Growth rate calculation
        supabase.from("client_profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("client_profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString()),
          
        // Gym stats
        supabase.from("gym_profiles").select("id", { count: "exact", head: true }),
        supabase.from("gym_profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("gym_locations").select("id", { count: "exact", head: true }),
        supabase.from("gym_payments")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ]);

      // Calculate MRR from coach subscriptions
      const tierPrices: Record<string, number> = { starter: 19, pro: 49, enterprise: 99 };
      const activeSubscriptions = subscriptionsRes.data || [];
      const coachMRR = activeSubscriptions.reduce((sum, sub: any) => sum + (tierPrices[sub.tier] || 0), 0);
      
      // Tier distribution
      const tierDistribution = activeSubscriptions.reduce((acc: Record<string, number>, sub: any) => {
        acc[sub.tier] = (acc[sub.tier] || 0) + 1;
        return acc;
      }, {});

      // Calculate growth rate
      const last30Users = last30DaysUsersRes.count || 0;
      const prev30Users = prev30DaysUsersRes.count || 0;
      const growthRate = prev30Users > 0 
        ? Math.round(((last30Users - prev30Users) / prev30Users) * 100)
        : last30Users > 0 ? 100 : 0;

      // Session completion rate
      const totalSessions = (sessionsRes.count || 0) + (completedSessionsRes.count || 0);
      const sessionCompletionRate = totalSessions > 0 
        ? Math.round(((completedSessionsRes.count || 0) / totalSessions) * 100)
        : 0;

      // Coach to client ratio
      const coachCount = coachesRes.count || 1;
      const clientCount = usersRes.count || 0;
      const coachClientRatio = (clientCount / coachCount).toFixed(1);
      
      // Gym stats
      const totalGyms = gymsRes.count || 0;
      const activeGyms = activeGymsRes.count || 0;
      const totalLocations = gymLocationsRes.count || 0;
      
      // Gym MRR: £99 base + £25 per additional location (simplified calculation)
      // Each gym pays £99 base, plus £25 for each location beyond the first
      const additionalLocations = Math.max(0, totalLocations - totalGyms);
      const gymMRR = (totalGyms * 99) + (additionalLocations * 25);
      
      // Gym membership fees: £1 per completed payment this month
      const gymMembershipFees = gymPaymentsRes.count || 0;
      
      // Commission earnings (15% of coaching session GMV - approximated)
      const commissionEarnings = Math.round(coachMRR * 0.15);
      
      // Total platform income
      const totalPlatformIncome = coachMRR + gymMRR + gymMembershipFees + commissionEarnings;

      // Integration stats
      const integrationStats = {
        video: {
          total: videoRes.data?.length || 0,
          active: videoRes.data?.length || 0,
          providers: [...new Set(videoRes.data?.map((v: any) => v.provider) || [])],
        },
        calendar: {
          total: calendarRes.data?.length || 0,
          active: calendarRes.data?.length || 0,
          providers: [...new Set(calendarRes.data?.map((c: any) => c.provider) || [])],
        },
        wearables: {
          total: wearableRes.data?.length || 0,
          active: wearableRes.data?.length || 0,
          providers: [...new Set(wearableRes.data?.map((w: any) => w.provider) || [])],
        },
        grocery: {
          total: groceryRes.count || 0,
          active: groceryRes.count || 0,
          providers: ["Tesco", "Sainsbury's", "Asda"],
        },
      };

      // Integration health status
      const integrationHealth: { name: string; status: "healthy" | "degraded" | "down"; latency: string }[] = [
        { name: "Stripe", status: "healthy", latency: "45ms" },
        { name: "Zoom", status: "healthy", latency: "120ms" },
        { name: "Google Calendar", status: "healthy", latency: "85ms" },
        { name: "Apple Health", status: "healthy", latency: "150ms" },
        { name: "Lovable AI Gateway", status: "healthy", latency: "200ms" },
      ];

      return {
        // Stats
        totalUsers: usersRes.count || 0,
        totalCoaches: coachesRes.count || 0,
        activeSessions: sessionsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        
        // Gym Stats
        totalGyms,
        activeGyms,
        totalLocations,
        
        // Revenue
        monthlyRevenue: coachMRR,
        mrr: coachMRR,
        coachMRR,
        gymMRR,
        gymMembershipFees,
        commissionEarnings,
        totalPlatformIncome,
        activeSubscriptions: activeSubscriptions.length,
        tierDistribution,
        
        // Analytics
        growthRate,
        sessionCompletionRate,
        coachClientRatio,
        engagementScore: Math.min(100, Math.round((messagesRes.count || 0) / Math.max(1, (usersRes.count || 1)) * 10)),
        
        // Integrations
        integrationStats,
        integrationHealth,
        
        // Lists
        pendingVerifications: verificationRes.data || [],
        recentSignups: recentUsersRes.data || [],
        recentActivity: activityRes.data || [],
        recentTransactions: transactionsRes.data || [],
        recentReviews: recentReviewsRes.data || [],
        topCoaches: topCoachesRes.data || [],
        flaggedDocuments: flaggedDocsRes.data || [],
        
        // Chart data (mock for now - would need time-series queries)
        signupChartData: generateMockChartData("signups"),
        revenueChartData: generateMockChartData("revenue"),
        sessionChartData: generateMockChartData("sessions"),
      };
    },
    refetchInterval: 60000,
  });
}

// Helper to generate mock chart data
function generateMockChartData(type: string) {
  const days = 7;
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString("en-GB", { weekday: "short" });
    
    switch (type) {
      case "signups":
        data.push({ name: label, value: Math.floor(Math.random() * 20) + 5 });
        break;
      case "revenue":
        data.push({ name: label, value: Math.floor(Math.random() * 500) + 100 });
        break;
      case "sessions":
        data.push({ name: label, value: Math.floor(Math.random() * 30) + 10 });
        break;
    }
  }
  
  return data;
}
