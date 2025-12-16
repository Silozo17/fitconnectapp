import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Platform Features
export const usePlatformFeatures = () => {
  return useQuery({
    queryKey: ["platform-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_features")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
};

// Tier Features
export const useTierFeatures = () => {
  return useQuery({
    queryKey: ["tier-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tier_features")
        .select("*, platform_features(*)");
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateTierFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tier, featureId, value }: { tier: string; featureId: string; value: any }) => {
      const { data, error } = await supabase
        .from("tier_features")
        .upsert({ tier, feature_id: featureId, value }, { onConflict: "tier,feature_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tier-features"] });
      toast.success("Feature updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// Platform Settings
export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*");
      if (error) throw error;
      // Convert array to object for easier access
      return data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
    },
  });
};

export const useUpdatePlatformSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: any; description?: string }) => {
      const { data, error } = await supabase
        .from("platform_settings")
        .upsert({ key, value, description, updated_at: new Date().toISOString() }, { onConflict: "key" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// Review Disputes
export const useReviewDisputes = () => {
  return useQuery({
    queryKey: ["review-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_disputes")
        .select(`
          *,
          reviews(*),
          coach_profiles(id, display_name, profile_image_url)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateReviewDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNotes, resolvedBy }: { 
      id: string; 
      status: string; 
      adminNotes?: string; 
      resolvedBy?: string;
    }) => {
      const { data, error } = await supabase
        .from("review_disputes")
        .update({ 
          status, 
          admin_notes: adminNotes, 
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString() 
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-disputes"] });
      toast.success("Dispute updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// All Reviews (for admin)
export const useAllReviews = () => {
  return useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          client_profiles(id, first_name, last_name),
          coach_profiles(id, display_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
      toast.success("Review deleted");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// Admin Granted Subscriptions
export const useAdminGrantedSubscriptions = () => {
  return useQuery({
    queryKey: ["admin-granted-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_granted_subscriptions")
        .select(`
          *,
          coach_profiles(id, display_name, profile_image_url)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useGrantFreePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ coachId, tier, reason, expiresAt }: { 
      coachId: string; 
      tier: string; 
      reason?: string;
      expiresAt?: string;
    }) => {
      // First, deactivate any existing granted subscriptions for this coach
      await supabase
        .from("admin_granted_subscriptions")
        .update({ is_active: false })
        .eq("coach_id", coachId)
        .eq("is_active", true);

      // Then create the new grant
      const { data, error } = await supabase
        .from("admin_granted_subscriptions")
        .insert({
          coach_id: coachId,
          tier,
          reason,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;

      // Also update the coach's subscription tier
      await supabase
        .from("coach_profiles")
        .update({ subscription_tier: tier })
        .eq("id", coachId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-granted-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Free plan granted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useRevokeGrantedPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ grantId, coachId }: { grantId: string; coachId: string }) => {
      const { error } = await supabase
        .from("admin_granted_subscriptions")
        .update({ is_active: false })
        .eq("id", grantId);
      if (error) throw error;

      // Reset coach's subscription tier to free
      await supabase
        .from("coach_profiles")
        .update({ subscription_tier: "free" })
        .eq("id", coachId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-granted-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Granted plan revoked");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

// Coach Feature Overrides
export const useCoachFeatureOverrides = (coachId?: string) => {
  return useQuery({
    queryKey: ["coach-feature-overrides", coachId],
    queryFn: async () => {
      let query = supabase
        .from("coach_feature_overrides")
        .select("*, platform_features(*)");
      
      if (coachId) {
        query = query.eq("coach_id", coachId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: coachId !== undefined,
  });
};

export const useSetFeatureOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ coachId, featureId, value, reason, expiresAt }: { 
      coachId: string; 
      featureId: string; 
      value: any;
      reason?: string;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase
        .from("coach_feature_overrides")
        .upsert({
          coach_id: coachId,
          feature_id: featureId,
          value,
          reason,
          expires_at: expiresAt,
        }, { onConflict: "coach_id,feature_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-feature-overrides"] });
      toast.success("Feature override set");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveFeatureOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (overrideId: string) => {
      const { error } = await supabase
        .from("coach_feature_overrides")
        .delete()
        .eq("id", overrideId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-feature-overrides"] });
      toast.success("Feature override removed");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};