import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachPackage {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  session_count: number;
  price: number;
  currency: string;
  validity_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachSubscriptionPlan {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_period: string;
  sessions_per_period: number | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPackagePurchase {
  id: string;
  client_id: string;
  coach_id: string;
  package_id: string;
  sessions_total: number;
  sessions_used: number;
  amount_paid: number;
  status: string;
  purchased_at: string;
  expires_at: string | null;
}

export interface ClientSubscription {
  id: string;
  client_id: string;
  coach_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
  cancelled_at: string | null;
}

// Fetch coach's packages
export const useCoachPackages = (coachId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-packages", coachId || user?.id],
    queryFn: async () => {
      let query = supabase.from("coach_packages").select("*");
      
      if (coachId) {
        query = query.eq("coach_id", coachId).eq("is_active", true);
      } else {
        // Get own packages
        const { data: profile } = await supabase
          .from("coach_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();
        
        if (!profile) return [];
        query = query.eq("coach_id", profile.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as CoachPackage[];
    },
    enabled: !!coachId || !!user,
  });
};

// Fetch coach's subscription plans
export const useCoachSubscriptionPlans = (coachId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-subscription-plans", coachId || user?.id],
    queryFn: async () => {
      let query = supabase.from("coach_subscription_plans").select("*");
      
      if (coachId) {
        query = query.eq("coach_id", coachId).eq("is_active", true);
      } else {
        const { data: profile } = await supabase
          .from("coach_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();
        
        if (!profile) return [];
        query = query.eq("coach_id", profile.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map(plan => ({
        ...plan,
        features: plan.features || []
      })) as CoachSubscriptionPlan[];
    },
    enabled: !!coachId || !!user,
  });
};

// Create package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (packageData: Omit<CoachPackage, "id" | "coach_id" | "created_at" | "updated_at">) => {
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!profile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("coach_packages")
        .insert({ ...packageData, coach_id: profile.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-packages"] });
    },
  });
};

// Update package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoachPackage> & { id: string }) => {
      const { data, error } = await supabase
        .from("coach_packages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-packages"] });
    },
  });
};

// Create subscription plan
export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: Omit<CoachSubscriptionPlan, "id" | "coach_id" | "created_at" | "updated_at">) => {
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!profile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("coach_subscription_plans")
        .insert({ ...planData, coach_id: profile.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-subscription-plans"] });
    },
  });
};

// Update subscription plan
export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoachSubscriptionPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("coach_subscription_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-subscription-plans"] });
    },
  });
};

// Client purchase a package
export const usePurchasePackage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ packageId, coachId }: { packageId: string; coachId: string }) => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!clientProfile) throw new Error("Client profile not found");

      // Get package details
      const { data: pkg } = await supabase
        .from("coach_packages")
        .select("*")
        .eq("id", packageId)
        .single();

      if (!pkg) throw new Error("Package not found");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (pkg.validity_days || 90));

      const { data, error } = await supabase
        .from("client_package_purchases")
        .insert({
          client_id: clientProfile.id,
          coach_id: coachId,
          package_id: packageId,
          sessions_total: pkg.session_count,
          amount_paid: pkg.price,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-package-purchases"] });
    },
  });
};

// Get client's package purchases
export const useClientPackages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-package-purchases", user?.id],
    queryFn: async () => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!clientProfile) return [];

      const { data, error } = await supabase
        .from("client_package_purchases")
        .select("*")
        .eq("client_id", clientProfile.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data as ClientPackagePurchase[];
    },
    enabled: !!user,
  });
};
