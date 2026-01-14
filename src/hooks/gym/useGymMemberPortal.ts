import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Messages
export interface GymMemberMessage {
  id: string;
  gym_id: string;
  sender_type: "member" | "staff" | "system";
  sender_member_id: string | null;
  sender_staff_id: string | null;
  recipient_member_id: string | null;
  recipient_staff_id: string | null;
  subject: string | null;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Helper to get current member
function useCurrentMemberId() {
  const { gym } = useGym();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["current-member-id", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return null;
      const { data } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .single();
      return data?.id || null;
    },
    enabled: !!gym?.id && !!user?.id,
  });
}

export function useMyMessages() {
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useQuery({
    queryKey: ["my-gym-messages", gym?.id, memberId],
    queryFn: async () => {
      if (!gym?.id || !memberId) return [];

      const { data, error } = await supabase
        .from("gym_member_messages")
        .select("*")
        .eq("gym_id", gym.id)
        .or(`recipient_member_id.eq.${memberId},sender_member_id.eq.${memberId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GymMemberMessage[];
    },
    enabled: !!gym?.id && !!memberId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useMutation({
    mutationFn: async (data: { recipient_staff_id?: string; subject?: string; content: string }) => {
      const { error } = await supabase
        .from("gym_member_messages")
        .insert({
          gym_id: gym?.id,
          sender_type: "member",
          sender_member_id: memberId,
          recipient_staff_id: data.recipient_staff_id,
          subject: data.subject,
          content: data.content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-gym-messages"] });
      toast.success("Message sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });
}

// Progress Tracking
export interface MemberProgress {
  id: string;
  recorded_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  measurements: Record<string, number>;
  notes: string | null;
}

export function useMyProgress() {
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useQuery({
    queryKey: ["my-progress", gym?.id, memberId],
    queryFn: async () => {
      if (!gym?.id || !memberId) return [];

      const { data, error } = await supabase
        .from("gym_member_progress")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("member_id", memberId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data as MemberProgress[];
    },
    enabled: !!gym?.id && !!memberId,
  });
}

export function useLogProgress() {
  const queryClient = useQueryClient();
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useMutation({
    mutationFn: async (data: Partial<Omit<MemberProgress, "id">>) => {
      const { error } = await supabase
        .from("gym_member_progress")
        .insert({
          gym_id: gym?.id,
          member_id: memberId,
          weight_kg: data.weight_kg,
          body_fat_percentage: data.body_fat_percentage,
          measurements: data.measurements,
          notes: data.notes,
          recorded_at: data.recorded_at,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-progress"] });
      toast.success("Progress logged");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to log progress");
    },
  });
}

// Goals
export interface MemberGoal {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  start_date: string;
  target_date: string | null;
  status: "active" | "completed" | "abandoned";
}

export function useMyGoals() {
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useQuery({
    queryKey: ["my-goals", gym?.id, memberId],
    queryFn: async () => {
      if (!gym?.id || !memberId) return [];

      const { data, error } = await supabase
        .from("gym_member_goals")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MemberGoal[];
    },
    enabled: !!gym?.id && !!memberId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useMutation({
    mutationFn: async (data: Omit<MemberGoal, "id" | "status">) => {
      const { error } = await supabase
        .from("gym_member_goals")
        .insert({
          gym_id: gym?.id,
          member_id: memberId,
          title: data.title,
          description: data.description,
          goal_type: data.goal_type,
          target_value: data.target_value,
          current_value: data.current_value,
          unit: data.unit,
          start_date: data.start_date,
          target_date: data.target_date,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      toast.success("Goal created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create goal");
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MemberGoal> & { id: string }) => {
      const { error } = await supabase
        .from("gym_member_goals")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      toast.success("Goal updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update goal");
    },
  });
}

// Achievements
export interface MemberAchievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  badge_icon: string | null;
  earned_at: string;
}

export function useMyAchievements() {
  const { gym } = useGym();
  const { data: memberId } = useCurrentMemberId();

  return useQuery({
    queryKey: ["my-achievements", gym?.id, memberId],
    queryFn: async () => {
      if (!gym?.id || !memberId) return [];

      const { data, error } = await supabase
        .from("gym_member_achievements")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("member_id", memberId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as MemberAchievement[];
    },
    enabled: !!gym?.id && !!memberId,
  });
}
