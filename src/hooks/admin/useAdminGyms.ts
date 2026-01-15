import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogAdminAction } from "@/hooks/useAuditLog";

export interface GymProfile {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  postcode: string | null;
  location_lat: number | null;
  location_lng: number | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  currency: string | null;
  timezone: string | null;
  stripe_account_id: string | null;
  stripe_account_status: string | null;
  platform_fee_percentage: number | null;
  status: string | null;
  verified_at: string | null;
  settings: any;
  created_at: string | null;
  updated_at: string | null;
  business_types: string[] | null;
  owner_name: string | null;
  owner_phone: string | null;
  onboarding_completed: boolean | null;
  onboarding_progress: any;
  service_settings: any;
  vat_registered: boolean;
  vat_number: string | null;
  brand_color: string | null;
  subscription_status: string | null;
  subscription_started_at: string | null;
  location_count: number | null;
  stripe_subscription_id: string | null;
  is_verified: boolean | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  // Joined data
  member_count?: number;
  staff_count?: number;
  monthly_revenue?: number;
}

export interface GymStats {
  total: number;
  active: number;
  stripeConnected: number;
  verified: number;
  totalLocations: number;
  monthlyRecurring: number;
  platformFeesThisMonth: number;
}

export interface GymFilters {
  search?: string;
  status?: string;
  subscriptionStatus?: string;
  stripeConnected?: boolean;
  verified?: boolean;
}

export function useAdminGyms(filters: GymFilters = {}) {
  return useQuery({
    queryKey: ["admin-gyms", filters],
    queryFn: async () => {
      let query = supabase
        .from("gym_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.subscriptionStatus) {
        query = query.eq("subscription_status", filters.subscriptionStatus);
      }

      if (filters.stripeConnected !== undefined) {
        if (filters.stripeConnected) {
          query = query.not("stripe_account_id", "is", null);
        } else {
          query = query.is("stripe_account_id", null);
        }
      }

      if (filters.verified !== undefined) {
        query = query.eq("is_verified", filters.verified);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch additional counts for each gym
      const gymsWithCounts = await Promise.all(
        (data || []).map(async (gym) => {
          // Get member count
          const { count: memberCount } = await supabase
            .from("gym_members")
            .select("*", { count: "exact", head: true })
            .eq("gym_id", gym.id)
            .eq("status", "active");

          // Get staff count
          const { count: staffCount } = await supabase
            .from("gym_staff")
            .select("*", { count: "exact", head: true })
            .eq("gym_id", gym.id)
            .eq("status", "active");

          return {
            ...gym,
            member_count: memberCount || 0,
            staff_count: staffCount || 0,
          } as GymProfile;
        })
      );

      return gymsWithCounts;
    },
  });
}

export function useAdminGymStats() {
  return useQuery({
    queryKey: ["admin-gym-stats"],
    queryFn: async () => {
      // Get all gyms
      const { data: gyms, error } = await supabase
        .from("gym_profiles")
        .select("id, status, subscription_status, stripe_account_id, is_verified, location_count");
      
      if (error) throw error;

      const stats: GymStats = {
        total: gyms?.length || 0,
        active: gyms?.filter(g => g.status === "active" || g.status === "onboarded").length || 0,
        stripeConnected: gyms?.filter(g => g.stripe_account_id).length || 0,
        verified: gyms?.filter(g => g.is_verified).length || 0,
        totalLocations: gyms?.reduce((sum, g) => sum + (g.location_count || 1), 0) || 0,
        monthlyRecurring: 0,
        platformFeesThisMonth: 0,
      };

      // Calculate monthly recurring revenue
      // £99 base + £25 per additional location for active subscriptions
      const activeSubscriptions = gyms?.filter(g => g.subscription_status === "active") || [];
      stats.monthlyRecurring = activeSubscriptions.reduce((sum, gym) => {
        const locations = gym.location_count || 1;
        return sum + 99 + Math.max(0, locations - 1) * 25;
      }, 0);

      // Get platform fees from gym payments this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments } = await supabase
        .from("gym_payments")
        .select("amount, platform_fee")
        .gte("created_at", startOfMonth.toISOString())
        .eq("status", "completed");

      // £1 per membership payment
      stats.platformFeesThisMonth = payments?.length || 0;

      return stats;
    },
  });
}

export function useAdminGymDetail(gymId: string | undefined) {
  return useQuery({
    queryKey: ["admin-gym-detail", gymId],
    queryFn: async () => {
      if (!gymId) return null;

      const { data: gym, error } = await supabase
        .from("gym_profiles")
        .select("*")
        .eq("id", gymId)
        .single();

      if (error) throw error;

      // Get member count
      const { count: memberCount } = await supabase
        .from("gym_members")
        .select("*", { count: "exact", head: true })
        .eq("gym_id", gymId);

      // Get staff
      const { data: staff } = await supabase
        .from("gym_staff")
        .select("*")
        .eq("gym_id", gymId);

      // Get feature toggles
      const { data: featureToggles } = await supabase
        .from("platform_gym_feature_toggles")
        .select("*")
        .eq("gym_id", gymId);

      // Get locations
      const { data: locations } = await supabase
        .from("gym_locations")
        .select("*")
        .eq("gym_id", gymId);

      return {
        ...gym,
        member_count: memberCount || 0,
        staff: staff || [],
        feature_toggles: featureToggles || [],
        locations: locations || [],
      };
    },
    enabled: !!gymId,
  });
}

export function useUpdateGymStatus() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      gymId,
      status,
      reason,
    }: {
      gymId: string;
      status: string;
      reason?: string;
    }) => {
      const updates: any = { status };
      
      if (status === "suspended") {
        updates.suspended_at = new Date().toISOString();
        updates.suspension_reason = reason;
      } else {
        updates.suspended_at = null;
        updates.suspension_reason = null;
      }

      const { error } = await supabase
        .from("gym_profiles")
        .update(updates)
        .eq("id", gymId);

      if (error) throw error;

      logAction.log({
        action: `GYM_STATUS_${status.toUpperCase()}`,
        entityType: "gym_profiles",
        entityId: gymId,
        newValues: updates,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gym-stats"] });
      toast.success("Gym status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update gym status");
    },
  });
}

export function useBulkUpdateGymStatus() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      gymIds,
      status,
      reason,
    }: {
      gymIds: string[];
      status: string;
      reason?: string;
    }) => {
      const updates: any = { status };
      
      if (status === "suspended") {
        updates.suspended_at = new Date().toISOString();
        updates.suspension_reason = reason;
      } else {
        updates.suspended_at = null;
        updates.suspension_reason = null;
      }

      const { error } = await supabase
        .from("gym_profiles")
        .update(updates)
        .in("id", gymIds);

      if (error) throw error;

      logAction.log({
        action: `BULK_GYM_STATUS_${status.toUpperCase()}`,
        entityType: "gym_profiles",
        newValues: { count: gymIds.length, status, reason },
      });

      return { success: true, count: gymIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gym-stats"] });
      toast.success(`${data.count} gyms updated`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update gyms");
    },
  });
}

export function useUpdateGymVerification() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      gymId,
      isVerified,
    }: {
      gymId: string;
      isVerified: boolean;
    }) => {
      const { error } = await supabase
        .from("gym_profiles")
        .update({
          is_verified: isVerified,
          verified_at: isVerified ? new Date().toISOString() : null,
        })
        .eq("id", gymId);

      if (error) throw error;

      logAction.log({
        action: isVerified ? "GYM_VERIFIED" : "GYM_UNVERIFIED",
        entityType: "gym_profiles",
        entityId: gymId,
        newValues: { is_verified: isVerified },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gyms"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gym-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gym-stats"] });
      toast.success("Gym verification updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update verification");
    },
  });
}

export function useToggleGymFeature() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      gymId,
      featureKey,
      isEnabled,
      reason,
    }: {
      gymId: string;
      featureKey: string;
      isEnabled: boolean;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("platform_gym_feature_toggles")
        .upsert({
          gym_id: gymId,
          feature_key: featureKey,
          is_enabled: isEnabled,
          disabled_at: isEnabled ? null : new Date().toISOString(),
          reason: isEnabled ? null : reason,
        }, {
          onConflict: "gym_id,feature_key",
        });

      if (error) throw error;

      logAction.log({
        action: isEnabled ? "GYM_FEATURE_ENABLED" : "GYM_FEATURE_DISABLED",
        entityType: "platform_gym_feature_toggles",
        entityId: gymId,
        newValues: { feature_key: featureKey, is_enabled: isEnabled, reason },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gym-detail"] });
      toast.success("Feature updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update feature");
    },
  });
}

export function useUpdateGymPlatformFee() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      gymId,
      platformFeePercentage,
    }: {
      gymId: string;
      platformFeePercentage: number;
    }) => {
      const { error } = await supabase
        .from("gym_profiles")
        .update({ platform_fee_percentage: platformFeePercentage })
        .eq("id", gymId);

      if (error) throw error;

      logAction.log({
        action: "GYM_PLATFORM_FEE_UPDATED",
        entityType: "gym_profiles",
        entityId: gymId,
        newValues: { platform_fee_percentage: platformFeePercentage },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gym-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gyms"] });
      toast.success("Platform fee updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update platform fee");
    },
  });
}

export function useSendGymAnnouncement() {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();

  return useMutation({
    mutationFn: async ({
      title,
      message,
      targetGymIds,
      deliveryMethod,
    }: {
      title: string;
      message: string;
      targetGymIds: string[] | null;
      deliveryMethod: "in_app" | "email" | "both";
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("platform_gym_announcements")
        .insert({
          title,
          message,
          target_gym_ids: targetGymIds,
          sent_by: user.id,
          delivery_method: deliveryMethod,
        });

      if (error) throw error;

      logAction.log({
        action: "GYM_ANNOUNCEMENT_SENT",
        entityType: "platform_gym_announcements",
        newValues: {
          title,
          target_count: targetGymIds?.length || "all",
          delivery_method: deliveryMethod,
        },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gym-announcements"] });
      toast.success("Announcement sent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send announcement");
    },
  });
}

export function useGymMembers(gymId: string | undefined) {
  return useQuery({
    queryKey: ["admin-gym-members", gymId],
    queryFn: async () => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from("gym_members")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!gymId,
  });
}

export function useGymPayments(gymId: string | undefined) {
  return useQuery({
    queryKey: ["admin-gym-payments", gymId],
    queryFn: async () => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from("gym_payments")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!gymId,
  });
}
