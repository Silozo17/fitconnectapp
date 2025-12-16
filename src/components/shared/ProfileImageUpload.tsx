import { useRef, useState } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfileImage } from "@/hooks/useProfileImage";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  userId: string;
  displayName?: string;
  onImageChange: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const buttonSizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const ProfileImageUpload = ({
  currentImageUrl,
  userId,
  displayName = "",
  onImageChange,
  size = "md",
  className,
}: ProfileImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { uploadImage, deleteImage, uploading } = useProfileImage({
    onSuccess: (url) => {
      setPreviewUrl(url);
      onImageChange(url);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to storage
    const url = await uploadImage(file, userId);
    if (!url) {
      // Revert preview on failure
      setPreviewUrl(currentImageUrl || null);
    }

    // Clear input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      await deleteImage(currentImageUrl, userId);
    }
    setPreviewUrl(null);
    onImageChange(null);
  };

  const getInitials = () => {
    if (!displayName) return "?";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], "border-2 border-border")}>
          <AvatarImage src={previewUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Upload/Change button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50",
            buttonSizeClasses[size]
          )}
        >
          {uploading ? (
            <Loader2 className={cn("animate-spin", iconSizeClasses[size])} />
          ) : (
            <Camera className={iconSizeClasses[size]} />
          )}
        </button>

        {/* Remove button */}
        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              "absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors",
              "w-5 h-5"
            )}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div>
        <p className="font-medium text-foreground">Profile Photo</p>
        <p className="text-sm text-muted-foreground">JPG, PNG, GIF or WebP. Max 2MB.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
