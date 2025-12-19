import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  location: string | null;
  city: string | null;
  county: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }

      return data as UserProfile | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error("No user");

      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
      toast.success("Profile updated");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    },
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      if (!user?.id) throw new Error("No user");

      // Update user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ username: newUsername })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Also update the role-specific tables for backward compatibility
      // We update all of them since user might have multiple roles
      await Promise.all([
        supabase
          .from("client_profiles")
          .update({ username: newUsername })
          .eq("user_id", user.id),
        supabase
          .from("coach_profiles")
          .update({ username: newUsername })
          .eq("user_id", user.id),
        supabase
          .from("admin_profiles")
          .update({ username: newUsername })
          .eq("user_id", user.id),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
      toast.success("Username updated");
    },
    onError: (error) => {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string | null) => {
      if (!user?.id) throw new Error("No user");

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Also update role-specific tables for backward compatibility
      await Promise.all([
        supabase
          .from("client_profiles")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", user.id),
        supabase
          .from("coach_profiles")
          .update({ profile_image_url: avatarUrl })
          .eq("user_id", user.id),
        supabase
          .from("admin_profiles")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", user.id),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
    },
    onError: (error) => {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
    },
  });

  const getDisplayName = () => {
    if (!profile) return null;
    if (profile.display_name) return profile.display_name;
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.first_name || profile.username;
  };

  return {
    profile,
    isLoading,
    error,
    displayName: getDisplayName(),
    username: profile?.username,
    avatarUrl: profile?.avatar_url,
    updateProfile: updateProfileMutation.mutate,
    updateUsername: updateUsernameMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    isUpdating: updateProfileMutation.isPending || updateUsernameMutation.isPending || updateAvatarMutation.isPending,
  };
};

// Hook to get another user's profile by user_id
export const useUserProfileById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile by id:", error);
        return null;
      }

      return data as UserProfile | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper to check username availability (now checks only user_profiles)
export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  const { data } = await supabase.rpc("is_username_available", {
    check_username: username,
  });
  return data === true;
};
