import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useShowcasePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (
    coachId: string,
    file: File,
    type: "before" | "after"
  ): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${coachId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("transformation-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get signed URL since bucket is private
      const { data: signedData, error: signedError } = await supabase.storage
        .from("transformation-photos")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (signedError) throw signedError;

      return signedData.signedUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPhoto, isUploading };
}
