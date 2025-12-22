import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2, ImageIcon } from "lucide-react";
import { CardImageCropperModal } from "./CardImageCropperModal";
import { useProfileImage } from "@/hooks/useProfileImage";
import { toast } from "sonner";

interface CardImageUploadProps {
  currentImageUrl: string | null;
  userId: string;
  onImageChange: (url: string | null) => void;
}

export function CardImageUpload({
  currentImageUrl,
  userId,
  onImageChange,
}: CardImageUploadProps) {
  const { t } = useTranslation("settings");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const { uploadImage, deleteImage, uploading } = useProfileImage({
    bucket: "profile-images",
    onSuccess: (url) => {
      onImageChange(url);
      toast.success("Card photo updated");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview and open cropper
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setPreviewSrc(null);

    // Convert blob to file with card_ prefix to differentiate
    const file = new File([croppedBlob], `card_${userId}_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    await uploadImage(file, userId);
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;
    
    const success = await deleteImage(currentImageUrl, userId);
    if (success) {
      onImageChange(null);
      toast.success("Card photo removed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Preview Area - 4:3 aspect ratio */}
        <div className="relative w-48 aspect-[4/3] rounded-lg overflow-hidden bg-secondary border border-border">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Card preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-xs">4:3 Landscape</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            {currentImageUrl ? t("marketplace.cardImageChange") : t("marketplace.cardImageUpload")}
          </Button>
          {currentImageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t("marketplace.cardImageRemove")}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("marketplace.cardImageHint")}
      </p>

      {/* Cropper Modal */}
      {previewSrc && (
        <CardImageCropperModal
          open={showCropper}
          onClose={() => {
            setShowCropper(false);
            setPreviewSrc(null);
          }}
          imageSrc={previewSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
