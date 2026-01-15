import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymMember {
  id: string;
  gym_id: string;
  user_id: string;
  client_profile_id: string | null;
  member_number: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  current_grade: string | null;
  status: string;
  joined_at: string;
  last_visit_at: string | null;
  created_at: string;
  tags: string[] | null;
  // Joined data
  active_membership?: {
    id: string;
    plan_name: string;
    status: string;
    credits_remaining: number | null;
    current_period_end: string | null;
  } | null;
}

interface UseGymMembersOptions {
  status?: string;
  search?: string;
  planId?: string;
  joinedFrom?: string;
  joinedTo?: string;
  dobFrom?: string;
  dobTo?: string;
  noActiveMembership?: boolean;
  expiringWithinDays?: number;
  limit?: number;
  offset?: number;
}

export function useGymMembers(options: UseGymMembersOptions = {}) {
  const { gym } = useGym();
  const { 
    status = "active", 
    search, 
    planId,
    joinedFrom,
    joinedTo,
    dobFrom,
    dobTo,
    noActiveMembership,
    expiringWithinDays,
    limit = 50, 
    offset = 0 
  } = options;

  return useQuery({
    queryKey: ["gym-members", gym?.id, status, search, planId, joinedFrom, joinedTo, dobFrom, dobTo, noActiveMembership, expiringWithinDays, limit, offset],
    queryFn: async () => {
      if (!gym?.id) return { members: [], count: 0 };

      let query = supabase
        .from("gym_members")
        .select(`
          *,
          active_membership:gym_memberships(
            id,
            status,
            credits_remaining,
            current_period_end,
            plan_id,
            plan:membership_plans(name)
          )
        `, { count: "exact" })
        .eq("gym_id", gym.id)
        .order("joined_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Join date range filter
      if (joinedFrom) {
        query = query.gte("joined_at", joinedFrom);
      }
      if (joinedTo) {
        query = query.lte("joined_at", joinedTo);
      }

      // DOB range filter
      if (dobFrom) {
        query = query.gte("date_of_birth", dobFrom);
      }
      if (dobTo) {
        query = query.lte("date_of_birth", dobTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data to flatten active_membership and apply client-side filters
      let members = (data || []).map((member) => {
        const activeMembership = member.active_membership?.find(
          (m: { status: string }) => m.status === "active"
        );
        return {
          ...member,
          active_membership: activeMembership
            ? {
                id: activeMembership.id,
                plan_id: activeMembership.plan_id,
                plan_name: activeMembership.plan?.name || "Unknown Plan",
                status: activeMembership.status,
                credits_remaining: activeMembership.credits_remaining,
                current_period_end: activeMembership.current_period_end,
              }
            : null,
        };
      });

      // Client-side filters for membership-related conditions
      if (planId) {
        members = members.filter(m => m.active_membership?.plan_id === planId);
      }

      if (noActiveMembership) {
        members = members.filter(m => !m.active_membership);
      }

      if (expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + expiringWithinDays);
        members = members.filter(m => {
          if (!m.active_membership?.current_period_end) return false;
          const endDate = new Date(m.active_membership.current_period_end);
          return endDate <= futureDate && endDate >= new Date();
        });
      }

      return { members: members as GymMember[], count: count || 0 };
    },
    enabled: !!gym?.id,
  });
}

export function useGymMember(memberId: string | undefined) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-member", memberId],
    queryFn: async () => {
      if (!memberId || !gym?.id) return null;

      const { data, error } = await supabase
        .from("gym_members")
        .select(`
          *,
          memberships:gym_memberships(
            *,
            plan:membership_plans(*)
          ),
          bookings:gym_class_bookings(
            *,
            class:gym_classes(
              *,
              class_type:gym_class_types(*),
              instructor:gym_staff(display_name, avatar_url)
            )
          ),
          check_ins:gym_check_ins(*)
        `)
        .eq("id", memberId)
        .eq("gym_id", gym.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!memberId && !!gym?.id,
  });
}

export function useCreateGymMember() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: Partial<GymMember>) => {
      if (!gym?.id) throw new Error("No gym selected");

      const { data, error } = await supabase
        .from("gym_members")
        .insert({
          ...memberData,
          gym_id: gym.id,
          user_id: memberData.user_id || crypto.randomUUID(),
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-members", gym?.id] });
      toast.success("Member added successfully");
    },
    onError: (error) => {
      console.error("Failed to create member:", error);
      toast.error("Failed to add member");
    },
  });
}

export function useUpdateGymMember() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: Partial<GymMember> }) => {
      const { data, error } = await supabase
        .from("gym_members")
        .update(updates)
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ["gym-members", gym?.id] });
      queryClient.invalidateQueries({ queryKey: ["gym-member", memberId] });
      toast.success("Member updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update member:", error);
      toast.error("Failed to update member");
    },
  });
}

export function useDeleteGymMember() {
  const { gym } = useGym();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, hardDelete = false }: { memberId: string; hardDelete?: boolean }) => {
      if (hardDelete) {
        const { error } = await supabase
          .from("gym_members")
          .delete()
          .eq("id", memberId);
        if (error) throw error;
      } else {
        // Soft delete - set status to 'deleted'
        const { error } = await supabase
          .from("gym_members")
          .update({ status: "deleted" })
          .eq("id", memberId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-members", gym?.id] });
      toast.success("Member deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete member:", error);
      toast.error("Failed to delete member");
    },
  });
}

export function useGymMemberStats() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-member-stats", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return null;

      const [totalResult, activeResult, newThisMonthResult] = await Promise.all([
        supabase
          .from("gym_members")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id),
        supabase
          .from("gym_members")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .eq("status", "active"),
        supabase
          .from("gym_members")
          .select("id", { count: "exact", head: true })
          .eq("gym_id", gym.id)
          .gte("joined_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        newThisMonth: newThisMonthResult.count || 0,
      };
    },
    enabled: !!gym?.id,
  });
}
