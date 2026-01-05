import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useShowcasePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (
    coachId: string,
    coachUserId: string,
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
      // Use coach-uploads/{coachUserId}/{coachId}/... path for RLS compatibility
      const fileName = `coach-uploads/${coachUserId}/${coachId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("transformation-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(uploadError.message || "Failed to upload photo");
        return null;
      }

      // Get signed URL since bucket is private
      const { data: signedData, error: signedError } = await supabase.storage
        .from("transformation-photos")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (signedError) {
        console.error("Signed URL error:", signedError);
        toast.error(signedError.message || "Failed to generate photo URL");
        return null;
      }

      return signedData.signedUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.message || "Failed to upload photo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadPhoto, isUploading };
}
