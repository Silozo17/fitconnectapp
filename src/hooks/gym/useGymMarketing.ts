import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  status: string;
  target_audience: string;
  audience_filter: Record<string, unknown> | null;
  content: Record<string, unknown>;
  scheduled_at: string | null;
  sent_at: string | null;
  completed_at: string | null;
  stats: { sent: number; opened: number; clicked: number };
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Promotion {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  promotion_type: string;
  discount_value: number | null;
  promo_code: string | null;
  applicable_plans: string[] | null;
  start_date: string;
  end_date: string | null;
  max_redemptions: number | null;
  current_redemptions: number;
  is_active: boolean;
  terms_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export function useCampaigns(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-campaigns", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_campaigns")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!gymId,
  });
}

export function usePromotions(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-promotions", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const { data, error } = await supabase
        .from("gym_promotions")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
    enabled: !!gymId,
  });
}

export function useCampaignMutations(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createCampaign = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("gym_campaigns")
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-campaigns", gymId] });
      toast({ title: "Campaign created" });
    },
    onError: (error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("gym_campaigns")
        .update({ ...data, updated_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-campaigns", gymId] });
      toast({ title: "Campaign updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gym_campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-campaigns", gymId] });
      toast({ title: "Campaign deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });

  return { createCampaign, updateCampaign, deleteCampaign };
}

export function usePromotionMutations(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPromotion = useMutation({
    mutationFn: async (data: Omit<Promotion, "id" | "created_at" | "updated_at" | "current_redemptions">) => {
      const { data: result, error } = await supabase
        .from("gym_promotions")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-promotions", gymId] });
      toast({ title: "Promotion created" });
    },
    onError: (error) => {
      toast({ title: "Failed to create promotion", description: error.message, variant: "destructive" });
    },
  });

  const updatePromotion = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Promotion> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("gym_promotions")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-promotions", gymId] });
      toast({ title: "Promotion updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update promotion", description: error.message, variant: "destructive" });
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gym_promotions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-promotions", gymId] });
      toast({ title: "Promotion deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete promotion", description: error.message, variant: "destructive" });
    },
  });

  return { createPromotion, updatePromotion, deletePromotion };
}
