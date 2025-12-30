import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCaseStudyGenerator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: caseStudies = [], isLoading } = useQuery({
    queryKey: ["case-studies", coachProfile?.id],
    queryFn: async () => {
      if (!coachProfile) return [];
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!coachProfile,
  });

  const generateMutation = useMutation({
    mutationFn: async (showcaseId: string) => {
      const { data, error } = await supabase.functions.invoke("generate-case-study", {
        body: { showcaseId, coachId: coachProfile?.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Case study generated");
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
    },
    onError: () => toast.error("Failed to generate case study"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("case_studies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Case study deleted");
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const updates: any = { is_published };
      if (is_published) {
        updates.public_url = `${window.location.origin}/case-study/${id}`;
      }
      const { error } = await supabase.from("case_studies").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { is_published }) => {
      toast.success(is_published ? "Case study published" : "Case study unpublished");
      queryClient.invalidateQueries({ queryKey: ["case-studies"] });
    },
  });

  return {
    caseStudies,
    isLoading,
    generateCaseStudy: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    deleteCaseStudy: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    togglePublish: (id: string, is_published: boolean) => togglePublishMutation.mutate({ id, is_published }),
  };
}
