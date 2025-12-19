import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface UseProfileImageOptions {
  bucket?: "profile-images" | "documents" | "transformation-photos";
  onSuccess?: (url: string) => void;
}

export const useProfileImage = (options: UseProfileImageOptions = {}) => {
  const { bucket = "profile-images", onSuccess } = options;
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    if (!file || !userId) return null;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return null;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be less than 2MB");
      return null;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onSuccess?.(publicUrl);
      return publicUrl;
    } catch (error: unknown) {
      logError("useProfileImage", error);
      toast.error(getErrorMessage(error, "Failed to upload image"));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string, userId: string): Promise<boolean> => {
    if (!url || !userId) return false;

    try {
      // Extract file path from URL
      const urlParts = url.split(`${bucket}/`);
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: unknown) {
      logError("useProfileImage", error);
      toast.error("Failed to delete image");
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
  };
};
