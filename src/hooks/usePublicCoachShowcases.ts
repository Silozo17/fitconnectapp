import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicShowcase {
  id: string;
  title: string | null;
  description: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  display_name: string | null;
  stats: {
    weightLost?: number;
    durationWeeks?: number;
    bodyFatChange?: number;
    goalType?: string;
  } | null;
  published_at: string | null;
}

export interface PublicCaseStudy {
  id: string;
  title: string;
  content: {
    summary?: string;
    challenge?: string;
    approach?: string;
    results?: string;
    testimonial?: string;
  };
  generated_narrative: string | null;
  created_at: string;
}

export function usePublicCoachShowcases(coachId: string | undefined) {
  return useQuery({
    queryKey: ["public-coach-showcases", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("coach_outcome_showcases")
        .select("id, title, description, before_photo_url, after_photo_url, display_name, stats, published_at")
        .eq("coach_id", coachId)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        stats: item.stats as PublicShowcase['stats']
      })) as PublicShowcase[];
    },
    enabled: !!coachId,
  });
}

export function usePublicCoachCaseStudies(coachId: string | undefined) {
  return useQuery({
    queryKey: ["public-coach-case-studies", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("case_studies")
        .select("id, title, content, generated_narrative, created_at")
        .eq("coach_id", coachId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        content: item.content as PublicCaseStudy['content']
      })) as PublicCaseStudy[];
    },
    enabled: !!coachId,
  });
}
