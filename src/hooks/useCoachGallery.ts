import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Helper to invalidate profile completion when gallery changes
const invalidateProfileCompletion = (queryClient: ReturnType<typeof useQueryClient>, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["coach-profile-completion", userId] });
    queryClient.invalidateQueries({ queryKey: ["marketplace-profile-completion", userId] });
  }
};

export interface GalleryImage {
  id: string;
  coach_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

export const useCoachGallery = (coachId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-gallery", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      
      const { data, error } = await supabase
        .from("coach_gallery_images")
        .select("*")
        .eq("coach_id", coachId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!coachId,
  });
};

export const useMyCoachGallery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-coach-gallery", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get coach profile
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("coach_gallery_images")
        .select("*")
        .eq("coach_id", profile.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!user,
  });
};

export const useAddGalleryImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ imageUrl, caption }: { imageUrl: string; caption?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Get coach profile
      const { data: profile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) throw new Error("Coach profile not found");

      // Get current count
      const { count } = await supabase
        .from("coach_gallery_images")
        .select("*", { count: "exact", head: true })
        .eq("coach_id", profile.id);

      if ((count || 0) >= 5) {
        throw new Error("Maximum 5 gallery images allowed");
      }

      const { data, error } = await supabase
        .from("coach_gallery_images")
        .insert({
          coach_id: profile.id,
          image_url: imageUrl,
          caption: caption || null,
          display_order: count || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["my-coach-gallery"] });
      invalidateProfileCompletion(queryClient, user?.id);
      toast.success("Image added to gallery");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add image");
    },
  });
};

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption?: string }) => {
      const { data, error } = await supabase
        .from("coach_gallery_images")
        .update({ caption })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-coach-gallery"] });
    },
  });
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_gallery_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-coach-gallery"] });
      invalidateProfileCompletion(queryClient, user?.id);
      toast.success("Image removed from gallery");
    },
    onError: () => {
      toast.error("Failed to remove image");
    },
  });
};

export const useReorderGalleryImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (images: { id: string; display_order: number }[]) => {
      const updates = images.map(({ id, display_order }) =>
        supabase
          .from("coach_gallery_images")
          .update({ display_order })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-coach-gallery"] });
    },
  });
};
