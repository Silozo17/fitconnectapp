import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogAdminAction } from "./useAuditLog";

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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ tier, featureId, value, featureName, oldValue }: { 
      tier: string; 
      featureId: string; 
      value: any;
      featureName?: string;
      oldValue?: any;
    }) => {
      const { data, error } = await supabase
        .from("tier_features")
        .upsert({ tier, feature_id: featureId, value }, { onConflict: "tier,feature_id" })
        .select()
        .single();
      if (error) throw error;
      
      // Log the action
      await logAction.log({
        action: "UPDATE_TIER_FEATURE",
        entityType: "tier_features",
        entityId: featureId,
        oldValues: oldValue !== undefined ? { tier, feature: featureName, value: oldValue } : undefined,
        newValues: { tier, feature: featureName, value },
      });
      
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ key, value, description, oldValue }: { 
      key: string; 
      value: any; 
      description?: string;
      oldValue?: any;
    }) => {
      const { data, error } = await supabase
        .from("platform_settings")
        .upsert({ key, value, description, updated_at: new Date().toISOString() }, { onConflict: "key" })
        .select()
        .single();
      if (error) throw error;
      
      // Log the action
      await logAction.log({
        action: "UPDATE_PLATFORM_SETTING",
        entityType: "platform_settings",
        entityId: key,
        oldValues: oldValue !== undefined ? { [key]: oldValue } : undefined,
        newValues: { [key]: value },
      });
      
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ id, status, adminNotes, resolvedBy, oldStatus }: { 
      id: string; 
      status: string; 
      adminNotes?: string; 
      resolvedBy?: string;
      oldStatus?: string;
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
      
      // Log the action
      await logAction.log({
        action: "RESOLVE_REVIEW_DISPUTE",
        entityType: "review_disputes",
        entityId: id,
        oldValues: oldStatus ? { status: oldStatus } : undefined,
        newValues: { status, admin_notes: adminNotes },
      });
      
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ reviewId, reviewData }: { 
      reviewId: string;
      reviewData?: { rating?: number; coachName?: string; clientName?: string };
    }) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
      
      // Log the action
      await logAction.log({
        action: "DELETE_REVIEW",
        entityType: "reviews",
        entityId: reviewId,
        oldValues: reviewData ? {
          rating: reviewData.rating,
          coach: reviewData.coachName,
          client: reviewData.clientName,
        } : undefined,
      });
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ coachId, tier, reason, expiresAt, coachName }: { 
      coachId: string; 
      tier: string; 
      reason?: string;
      expiresAt?: string;
      coachName?: string;
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

      // If granting Founder tier, also award the Founder badge
      if (tier === "founder") {
        // Get the Founder badge
        const { data: founderBadge } = await supabase
          .from("badges")
          .select("id")
          .eq("name", "Founder")
          .single();

        if (founderBadge) {
          // Check if coach already has this badge
          const { data: existingBadge } = await supabase
            .from("coach_badges")
            .select("id")
            .eq("coach_id", coachId)
            .eq("badge_id", founderBadge.id)
            .single();

          if (!existingBadge) {
            // Award the Founder badge
            await supabase.from("coach_badges").insert({
              coach_id: coachId,
              badge_id: founderBadge.id,
              source_data: { granted_reason: reason || "Founder plan grant" },
            });
          }
        }
      }

      // Log the action
      await logAction.log({
        action: "GRANT_FREE_PLAN",
        entityType: "admin_granted_subscriptions",
        entityId: coachId,
        newValues: { 
          coach: coachName || coachId, 
          tier, 
          reason, 
          expires_at: expiresAt 
        },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-granted-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      // Also invalidate the coach's own queries so their dashboard updates
      queryClient.invalidateQueries({ queryKey: ["coach-profile"] });
      queryClient.invalidateQueries({ queryKey: ["coach-onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      // Invalidate subscription status and feature access for immediate UI update
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["feature-access"] });
      queryClient.invalidateQueries({ queryKey: ["coach-active-grant"] });
      toast.success("Free plan granted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useRevokeGrantedPlan = () => {
  const queryClient = useQueryClient();
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ grantId, coachId, tier, coachName, targetTier = "free" }: { 
      grantId: string; 
      coachId: string;
      tier?: string;
      coachName?: string;
      targetTier?: string;
    }) => {
      // Use edge function to bypass founder protection trigger
      const { error } = await supabase.functions.invoke("admin-revoke-plan", {
        body: { 
          grantId, 
          coachId, 
          currentTier: tier,
          targetTier,
        }
      });
      
      if (error) throw error;

      // Log the action
      await logAction.log({
        action: "REVOKE_GRANTED_PLAN",
        entityType: "admin_granted_subscriptions",
        entityId: grantId,
        oldValues: { 
          coach: coachName || coachId, 
          tier: tier || "unknown" 
        },
        newValues: { tier: targetTier },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-granted-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      // Also invalidate the coach's own queries so their dashboard updates
      queryClient.invalidateQueries({ queryKey: ["coach-profile"] });
      queryClient.invalidateQueries({ queryKey: ["coach-onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      // Invalidate subscription status and feature access for immediate UI update
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["feature-access"] });
      queryClient.invalidateQueries({ queryKey: ["coach-active-grant"] });
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ coachId, featureId, value, reason, expiresAt, featureName, coachName, oldValue }: { 
      coachId: string; 
      featureId: string; 
      value: any;
      reason?: string;
      expiresAt?: string;
      featureName?: string;
      coachName?: string;
      oldValue?: any;
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
      
      // Log the action
      await logAction.log({
        action: oldValue !== undefined ? "UPDATE_FEATURE_OVERRIDE" : "SET_FEATURE_OVERRIDE",
        entityType: "coach_feature_overrides",
        entityId: coachId,
        oldValues: oldValue !== undefined ? { 
          coach: coachName, 
          feature: featureName, 
          value: oldValue 
        } : undefined,
        newValues: { 
          coach: coachName || coachId, 
          feature: featureName || featureId, 
          value, 
          reason 
        },
      });
      
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
  const logAction = useLogAdminAction();
  
  return useMutation({
    mutationFn: async ({ overrideId, coachName, featureName, oldValue }: { 
      overrideId: string;
      coachName?: string;
      featureName?: string;
      oldValue?: any;
    }) => {
      const { error } = await supabase
        .from("coach_feature_overrides")
        .delete()
        .eq("id", overrideId);
      if (error) throw error;
      
      // Log the action
      await logAction.log({
        action: "REMOVE_FEATURE_OVERRIDE",
        entityType: "coach_feature_overrides",
        entityId: overrideId,
        oldValues: { 
          coach: coachName, 
          feature: featureName, 
          value: oldValue 
        },
      });
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
