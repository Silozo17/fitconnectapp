import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Helper to invalidate profile completion when group classes change
const invalidateProfileCompletion = (queryClient: ReturnType<typeof useQueryClient>, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["coach-profile-completion", userId] });
    queryClient.invalidateQueries({ queryKey: ["marketplace-profile-completion", userId] });
  }
};

export type EventType = 'class' | 'workshop' | 'live_event' | 'online_event' | 'seminar' | 'bootcamp';
export type EventFormat = 'in_person' | 'online' | 'hybrid';

export interface GroupClass {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  schedule_info: string | null;
  target_audience: string | null;
  location: string | null;
  price: number | null;
  currency: string | null;
  is_waitlist_open: boolean;
  max_participants: number | null;
  is_active: boolean;
  event_type: EventType;
  event_format: EventFormat;
  online_link: string | null;
  start_date: string | null;
  end_date: string | null;
  is_recurring: boolean;
  community_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  group_class_id: string;
  client_id: string;
  joined_at: string;
  status: 'waiting' | 'notified' | 'enrolled';
  client_profiles?: {
    first_name: string | null;
    last_name: string | null;
    username: string;
  };
}

// Fetch group classes for a specific coach (public)
export const useCoachGroupClasses = (coachId?: string) => {
  return useQuery({
    queryKey: ["coach-group-classes", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("coach_group_classes")
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as GroupClass[]);
    },
    enabled: !!coachId,
  });
};

// Fetch coach's own group classes (including inactive)
export const useMyGroupClasses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-group-classes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("coach_group_classes")
        .select("*")
        .eq("coach_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as GroupClass[]);
    },
    enabled: !!user,
  });
};

// Create a new group class
export const useCreateGroupClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupClass: Omit<GroupClass, 'id' | 'coach_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) throw new Error("Coach profile not found");

      const { data, error } = await supabase
        .from("coach_group_classes")
        .insert({
          ...groupClass,
          coach_id: profile.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-group-classes"] });
      invalidateProfileCompletion(queryClient, user?.id);
      toast.success("Class/event created");
    },
    onError: () => {
      toast.error("Failed to create class/event");
    },
  });
};

// Update a group class
export const useUpdateGroupClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GroupClass> & { id: string }) => {
      const { data, error } = await supabase
        .from("coach_group_classes")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-group-classes"] });
      toast.success("Class/event updated");
    },
    onError: () => {
      toast.error("Failed to update class/event");
    },
  });
};

// Delete a group class
export const useDeleteGroupClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_group_classes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-group-classes"] });
      invalidateProfileCompletion(queryClient, user?.id);
      toast.success("Class/event deleted");
    },
    onError: () => {
      toast.error("Failed to delete class/event");
    },
  });
};

// Get waitlist for a group class (coach view)
export const useGroupClassWaitlist = (classId?: string) => {
  return useQuery({
    queryKey: ["group-class-waitlist", classId],
    queryFn: async () => {
      if (!classId) return [];

      const { data, error } = await supabase
        .from("group_class_waitlist")
        .select(`
          *,
          client_profiles (
            first_name,
            last_name,
            username
          )
        `)
        .eq("group_class_id", classId)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
    enabled: !!classId,
  });
};

// Join a waitlist (client action)
export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (classId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) throw new Error("Client profile not found");

      const { data, error } = await supabase
        .from("group_class_waitlist")
        .insert({
          group_class_id: classId,
          client_id: clientProfile.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("You're already on this waitlist");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-waitlist-entries"] });
      toast.success("You've joined the waitlist!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join waitlist");
    },
  });
};

// Leave a waitlist (client action)
export const useLeaveWaitlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (classId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) throw new Error("Client profile not found");

      const { error } = await supabase
        .from("group_class_waitlist")
        .delete()
        .eq("group_class_id", classId)
        .eq("client_id", clientProfile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-waitlist-entries"] });
      toast.success("You've left the waitlist");
    },
    onError: () => {
      toast.error("Failed to leave waitlist");
    },
  });
};

// Check if client is on a waitlist
export const useMyWaitlistEntries = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-waitlist-entries", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) return [];

      const { data, error } = await supabase
        .from("group_class_waitlist")
        .select("*")
        .eq("client_id", clientProfile.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Update waitlist entry status (coach action)
export const useUpdateWaitlistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'waiting' | 'notified' | 'enrolled' }) => {
      const { data, error } = await supabase
        .from("group_class_waitlist")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-class-waitlist"] });
    },
  });
};
