import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";

export interface GymStaffMember {
  id: string;
  gym_id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  phone: string | null;
  status: string;
  can_manage_members: boolean;
  can_manage_classes: boolean;
  can_manage_settings: boolean;
  can_view_financials: boolean;
  can_teach_classes: boolean;
}

export function useGymStaff() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-staff", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_staff")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("status", "active")
        .order("display_name", { ascending: true });

      if (error) throw error;
      
      // Map database fields to our interface
      return (data || []).map((s: any) => ({
        id: s.id,
        gym_id: s.gym_id,
        user_id: s.user_id,
        email: s.email,
        display_name: s.display_name,
        avatar_url: s.avatar_url,
        role: s.role,
        bio: s.bio,
        phone: s.phone,
        status: s.status ?? "active",
        can_manage_members: s.can_manage_members ?? false,
        can_manage_classes: s.can_manage_classes ?? false,
        can_manage_settings: s.can_manage_settings ?? false,
        can_view_financials: s.can_view_financials ?? false,
        can_teach_classes: s.can_teach_classes ?? false,
      })) as GymStaffMember[];
    },
    enabled: !!gym?.id,
  });
}

export function useGymInstructors() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-instructors", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_staff")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("status", "active")
        .eq("can_teach_classes", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      
      // Map database fields to our interface
      return (data || []).map((s: any) => ({
        id: s.id,
        gym_id: s.gym_id,
        user_id: s.user_id,
        email: s.email,
        display_name: s.display_name,
        avatar_url: s.avatar_url,
        role: s.role,
        bio: s.bio,
        phone: s.phone,
        status: s.status ?? "active",
        can_manage_members: s.can_manage_members ?? false,
        can_manage_classes: s.can_manage_classes ?? false,
        can_manage_settings: s.can_manage_settings ?? false,
        can_view_financials: s.can_view_financials ?? false,
        can_teach_classes: s.can_teach_classes ?? false,
      })) as GymStaffMember[];
    },
    enabled: !!gym?.id,
  });
}
