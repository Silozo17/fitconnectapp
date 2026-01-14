import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralReward {
  id: string;
  gym_id: string;
  referrer_member_id: string;
  referred_member_id: string;
  reward_type: string;
  reward_value: number | null;
  status: string;
  awarded_at: string | null;
  created_at: string;
  referrer?: {
    id: string;
    user_profiles?: {
      first_name: string | null;
      last_name: string | null;
    };
  };
  referred?: {
    id: string;
    user_profiles?: {
      first_name: string | null;
      last_name: string | null;
    };
  };
}

interface MemberReferralInfo {
  referral_code: string;
  referral_credits_earned: number;
  referrals_count: number;
}

export function useGymReferralRewards(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-referral-rewards", gymId],
    queryFn: async () => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from("gym_referral_rewards")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReferralReward[];
    },
    enabled: !!gymId,
  });
}

export function useMemberReferralInfo(memberId: string | undefined) {
  return useQuery({
    queryKey: ["member-referral-info", memberId],
    queryFn: async () => {
      if (!memberId) return null;

      const { data: member, error: memberError } = await supabase
        .from("gym_members")
        .select("referral_code, referral_credits_earned")
        .eq("id", memberId)
        .single();

      if (memberError) throw memberError;

      // Count successful referrals
      const { count, error: countError } = await supabase
        .from("gym_members")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", memberId);

      if (countError) throw countError;

      return {
        referral_code: member.referral_code || "",
        referral_credits_earned: member.referral_credits_earned || 0,
        referrals_count: count || 0,
      } as MemberReferralInfo;
    },
    enabled: !!memberId,
  });
}

export function useReferralMutations(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const awardReferral = useMutation({
    mutationFn: async ({ rewardId, creditsAmount }: { rewardId: string; creditsAmount?: number }) => {
      // Get the reward details
      const { data: reward, error: rewardError } = await supabase
        .from("gym_referral_rewards")
        .select("*")
        .eq("id", rewardId)
        .single();

      if (rewardError) throw rewardError;

      // Update reward status
      const { error: updateError } = await supabase
        .from("gym_referral_rewards")
        .update({
          status: "awarded",
          awarded_at: new Date().toISOString(),
          reward_value: creditsAmount || reward.reward_value,
        })
        .eq("id", rewardId);

      if (updateError) throw updateError;

      // If credits reward, add to referrer's credits
      if (reward.reward_type === "credits" && creditsAmount) {
        const { data: member } = await supabase
          .from("gym_members")
          .select("referral_credits_earned")
          .eq("id", reward.referrer_member_id)
          .single();

        await supabase
          .from("gym_members")
          .update({
            referral_credits_earned: (member?.referral_credits_earned || 0) + creditsAmount,
          })
          .eq("id", reward.referrer_member_id);
      }

      return reward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-referral-rewards", gymId] });
      toast({ title: "Referral reward awarded" });
    },
    onError: (error) => {
      toast({ title: "Failed to award referral", description: error.message, variant: "destructive" });
    },
  });

  const applyReferralCode = useMutation({
    mutationFn: async ({ memberId, referralCode }: { memberId: string; referralCode: string }) => {
      // Find the referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from("gym_members")
        .select("id, gym_id")
        .eq("referral_code", referralCode.toUpperCase())
        .single();

      if (referrerError || !referrer) {
        throw new Error("Invalid referral code");
      }

      // Update the member with referred_by
      const { error: updateError } = await supabase
        .from("gym_members")
        .update({ referred_by: referrer.id })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Create pending referral reward
      const { error: rewardError } = await supabase
        .from("gym_referral_rewards")
        .insert({
          gym_id: referrer.gym_id,
          referrer_member_id: referrer.id,
          referred_member_id: memberId,
          reward_type: "credits",
          status: "pending",
        });

      if (rewardError) throw rewardError;

      return referrer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-referral-rewards"] });
      toast({ title: "Referral code applied!" });
    },
    onError: (error) => {
      toast({ title: "Failed to apply referral code", description: error.message, variant: "destructive" });
    },
  });

  return { awardReferral, applyReferralCode };
}

export function useReferralStats(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-referral-stats", gymId],
    queryFn: async () => {
      if (!gymId) return null;

      const { data, error } = await supabase
        .from("gym_referral_rewards")
        .select("status, reward_value")
        .eq("gym_id", gymId);

      if (error) throw error;

      return {
        total: data.length,
        pending: data.filter(r => r.status === "pending").length,
        awarded: data.filter(r => r.status === "awarded").length,
        totalCreditsAwarded: data
          .filter(r => r.status === "awarded")
          .reduce((sum, r) => sum + (r.reward_value || 0), 0),
      };
    },
    enabled: !!gymId,
  });
}
