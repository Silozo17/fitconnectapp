import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymStaffTask {
  id: string;
  gym_id: string;
  location_id: string | null;
  assigned_to: string;
  created_by: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_to_staff?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  created_by_staff?: {
    id: string;
    display_name: string;
  };
}

interface UseGymStaffTasksOptions {
  assignedTo?: string;
  status?: string;
  limit?: number;
}

export function useGymStaffTasks(options: UseGymStaffTasksOptions = {}) {
  const { gym, staffRecord } = useGym();
  const { assignedTo, status, limit = 20 } = options;

  return useQuery({
    queryKey: ["gym-staff-tasks", gym?.id, assignedTo, status, limit],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = supabase
        .from("gym_staff_tasks")
        .select(`
          *,
          assigned_to_staff:gym_staff!gym_staff_tasks_assigned_to_fkey(id, display_name, avatar_url),
          created_by_staff:gym_staff!gym_staff_tasks_created_by_fkey(id, display_name)
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (assignedTo) {
        query = query.eq("assigned_to", assignedTo);
      }
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GymStaffTask[];
    },
    enabled: !!gym?.id,
  });
}

export function useMyTasks() {
  const { staffRecord } = useGym();
  return useGymStaffTasks({ 
    assignedTo: staffRecord?.id,
    status: 'pending'
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { gym, staffRecord } = useGym();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      assigned_to: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      due_date?: string;
      location_id?: string;
    }) => {
      if (!gym?.id || !staffRecord?.id) throw new Error("Not authenticated");

      const { data: task, error } = await supabase
        .from("gym_staff_tasks")
        .insert({
          gym_id: gym.id,
          created_by: staffRecord.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("gym_staff_tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-staff-tasks"] });
      toast.success("Task updated");
    },
  });
}
