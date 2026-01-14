import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GymLead {
  id: string;
  gym_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  interest_areas: string[] | null;
  preferred_contact: string;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  converted_member_id: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff?: {
    id: string;
    user_id: string;
    user_profiles?: {
      first_name: string | null;
      last_name: string | null;
    };
  };
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  staff_id: string | null;
  activity_type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  staff?: {
    user_profiles?: {
      first_name: string | null;
      last_name: string | null;
    };
  };
}

export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { value: "qualified", label: "Qualified", color: "bg-purple-500" },
  { value: "trial_scheduled", label: "Trial Scheduled", color: "bg-indigo-500" },
  { value: "trial_completed", label: "Trial Completed", color: "bg-cyan-500" },
  { value: "converted", label: "Converted", color: "bg-green-500" },
  { value: "lost", label: "Lost", color: "bg-red-500" },
] as const;

export const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "social_media", label: "Social Media" },
  { value: "advertising", label: "Advertising" },
  { value: "other", label: "Other" },
] as const;

export function useGymLeads(gymId: string | undefined, filters?: { status?: string; assignedTo?: string }) {
  return useQuery({
    queryKey: ["gym-leads", gymId, filters],
    queryFn: async () => {
      if (!gymId) return [];
      
      let query = supabase
        .from("gym_leads")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymLead[];
    },
    enabled: !!gymId,
  });
}

export function useLeadActivities(leadId: string | undefined) {
  return useQuery({
    queryKey: ["gym-lead-activities", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("gym_lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });
}

export function useLeadMutations(gymId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createLead = useMutation({
    mutationFn: async (data: Omit<GymLead, "id" | "created_at" | "updated_at" | "assigned_staff">) => {
      const { data: result, error } = await supabase
        .from("gym_leads")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-leads", gymId] });
      toast({ title: "Lead created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create lead", description: error.message, variant: "destructive" });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...data }: Partial<GymLead> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("gym_leads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-leads", gymId] });
      toast({ title: "Lead updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update lead", description: error.message, variant: "destructive" });
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ id, status, staffId }: { id: string; status: string; staffId?: string }) => {
      // Update lead status
      const { error: updateError } = await supabase
        .from("gym_leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      // Log activity
      const { error: activityError } = await supabase
        .from("gym_lead_activities")
        .insert({
          lead_id: id,
          staff_id: staffId,
          activity_type: "status_change",
          description: `Status changed to ${status}`,
          metadata: { new_status: status },
        });

      if (activityError) throw activityError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-leads", gymId] });
      queryClient.invalidateQueries({ queryKey: ["gym-lead-activities"] });
      toast({ title: "Lead status updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gym_leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-leads", gymId] });
      toast({ title: "Lead deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete lead", description: error.message, variant: "destructive" });
    },
  });

  const addActivity = useMutation({
    mutationFn: async (data: { lead_id: string; staff_id?: string | null; activity_type: string; description?: string | null; metadata?: Record<string, unknown> | null }) => {
      const { data: result, error } = await supabase
        .from("gym_lead_activities")
        .insert([{
          lead_id: data.lead_id,
          staff_id: data.staff_id ?? null,
          activity_type: data.activity_type,
          description: data.description ?? null,
          metadata: data.metadata as any ?? null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update last_contacted_at if it's a contact activity
      if (["call", "email", "meeting"].includes(data.activity_type)) {
        await supabase
          .from("gym_leads")
          .update({ last_contacted_at: new Date().toISOString() })
          .eq("id", data.lead_id);
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gym-lead-activities", variables.lead_id] });
      queryClient.invalidateQueries({ queryKey: ["gym-leads", gymId] });
      toast({ title: "Activity logged" });
    },
    onError: (error) => {
      toast({ title: "Failed to log activity", description: error.message, variant: "destructive" });
    },
  });

  return { createLead, updateLead, updateLeadStatus, deleteLead, addActivity };
}

export function useLeadStats(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-lead-stats", gymId],
    queryFn: async () => {
      if (!gymId) return null;

      const { data, error } = await supabase
        .from("gym_leads")
        .select("status")
        .eq("gym_id", gymId);

      if (error) throw error;

      const stats = {
        total: data.length,
        new: data.filter(l => l.status === "new").length,
        contacted: data.filter(l => l.status === "contacted").length,
        qualified: data.filter(l => l.status === "qualified").length,
        trial_scheduled: data.filter(l => l.status === "trial_scheduled").length,
        trial_completed: data.filter(l => l.status === "trial_completed").length,
        converted: data.filter(l => l.status === "converted").length,
        lost: data.filter(l => l.status === "lost").length,
        conversionRate: data.length > 0 
          ? ((data.filter(l => l.status === "converted").length / data.length) * 100).toFixed(1)
          : "0",
      };

      return stats;
    },
    enabled: !!gymId,
  });
}
