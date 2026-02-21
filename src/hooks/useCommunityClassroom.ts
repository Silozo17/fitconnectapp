import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityModule {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
}

export interface CommunityLesson {
  id: string;
  module_id: string;
  community_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  file_urls: string[] | null;
  duration_minutes: number | null;
  display_order: number;
  is_published: boolean;
  is_free_preview: boolean;
  preview_image_url: string | null;
  embed_mode: string;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  completed_at: string | null;
  last_watched_seconds: number;
}

// ===== Modules =====

export const useCommunityModules = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-modules", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_modules")
        .select("*")
        .eq("community_id", communityId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CommunityModule[];
    },
    enabled: !!communityId,
  });
};

export const useCreateModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { community_id: string; title: string; description?: string; display_order?: number }) => {
      const { data: mod, error } = await supabase
        .from("community_modules")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return mod;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["community-modules", v.community_id] }); },
  });
};

export const useUpdateModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, communityId, ...updates }: { id: string; communityId: string; title?: string; description?: string; is_published?: boolean; display_order?: number }) => {
      const { error } = await supabase
        .from("community_modules")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => { qc.invalidateQueries({ queryKey: ["community-modules", communityId] }); },
  });
};

export const useDeleteModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, communityId }: { id: string; communityId: string }) => {
      const { error } = await supabase.from("community_modules").delete().eq("id", id);
      if (error) throw error;
      return communityId;
    },
    onSuccess: (communityId) => {
      qc.invalidateQueries({ queryKey: ["community-modules", communityId] });
      qc.invalidateQueries({ queryKey: ["community-lessons"] });
    },
  });
};

// ===== Lessons =====

export const useCommunityLessons = (moduleId: string | undefined) => {
  return useQuery({
    queryKey: ["community-lessons", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_lessons")
        .select("*")
        .eq("module_id", moduleId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CommunityLesson[];
    },
    enabled: !!moduleId,
  });
};

export const useAllCommunityLessons = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["community-lessons-all", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_lessons")
        .select("*")
        .eq("community_id", communityId!)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CommunityLesson[];
    },
    enabled: !!communityId,
  });
};

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      module_id: string;
      community_id: string;
      title: string;
      description?: string;
      content?: string;
      video_url?: string;
      duration_minutes?: number;
      display_order?: number;
      is_free_preview?: boolean;
      preview_image_url?: string;
      embed_mode?: string;
    }) => {
      const { data: lesson, error } = await supabase
        .from("community_lessons")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return lesson;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["community-lessons", v.module_id] });
      qc.invalidateQueries({ queryKey: ["community-lessons-all", v.community_id] });
    },
  });
};

export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, moduleId, communityId, ...updates }: {
      id: string;
      moduleId: string;
      communityId: string;
      title?: string;
      description?: string;
      content?: string;
      video_url?: string;
      duration_minutes?: number;
      is_published?: boolean;
      is_free_preview?: boolean;
      display_order?: number;
    }) => {
      const { error } = await supabase
        .from("community_lessons")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return { moduleId, communityId };
    },
    onSuccess: ({ moduleId, communityId }) => {
      qc.invalidateQueries({ queryKey: ["community-lessons", moduleId] });
      qc.invalidateQueries({ queryKey: ["community-lessons-all", communityId] });
    },
  });
};

export const useDeleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, moduleId, communityId }: { id: string; moduleId: string; communityId: string }) => {
      const { error } = await supabase.from("community_lessons").delete().eq("id", id);
      if (error) throw error;
      return { moduleId, communityId };
    },
    onSuccess: ({ moduleId, communityId }) => {
      qc.invalidateQueries({ queryKey: ["community-lessons", moduleId] });
      qc.invalidateQueries({ queryKey: ["community-lessons-all", communityId] });
    },
  });
};

// ===== Progress =====

export const useLessonProgress = (communityId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lesson-progress", communityId, user?.id],
    queryFn: async () => {
      // Get all lesson IDs for this community, then fetch progress
      const { data: lessons } = await supabase
        .from("community_lessons")
        .select("id")
        .eq("community_id", communityId!);

      if (!lessons?.length) return [];

      const lessonIds = lessons.map((l: any) => l.id);
      const { data, error } = await supabase
        .from("community_lesson_progress")
        .select("*")
        .eq("user_id", user!.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!communityId && !!user,
  });
};

export const useMarkLessonComplete = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, communityId, completed }: { lessonId: string; communityId: string; completed: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (completed) {
        const { error } = await supabase
          .from("community_lesson_progress")
          .upsert({
            lesson_id: lessonId,
            user_id: user.id,
            completed_at: new Date().toISOString(),
          }, { onConflict: "lesson_id,user_id" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_lesson_progress")
          .update({ completed_at: null })
          .eq("lesson_id", lessonId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
      return communityId;
    },
    onSuccess: (communityId) => {
      qc.invalidateQueries({ queryKey: ["lesson-progress", communityId] });
    },
  });
};
