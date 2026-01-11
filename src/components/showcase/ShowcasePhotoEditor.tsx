import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  X,
  Sparkles,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useClientSuggestedPhotos } from "@/hooks/useClientSuggestedPhotos";
import { useShowcasePhotoUpload } from "@/hooks/useShowcasePhotoUpload";
import { format } from "date-fns";
import { ConsentType } from "@/hooks/useOutcomeShowcase";
import { TransformationPhotoCropperModal } from "@/components/shared/TransformationPhotoCropperModal";

interface ShowcasePhotoEditorProps {
  clientId: string;
  coachId: string;
  coachUserId: string;
  currentBeforePhoto: string | null;
  currentAfterPhoto: string | null;
  onBeforePhotoChange: (url: string | null) => void;
  onAfterPhotoChange: (url: string | null) => void;
  consentType: ConsentType | null;
  isExternal: boolean;
}

const PHOTO_ALLOWED_CONSENT_TYPES: ConsentType[] = [
  "with_photos",
  "with_name",
  "full",
];

export function ShowcasePhotoEditor({
  clientId,
  coachId,
  coachUserId,
  currentBeforePhoto,
  currentAfterPhoto,
  onBeforePhotoChange,
  onAfterPhotoChange,
  consentType,
  isExternal,
}: ShowcasePhotoEditorProps) {
  const { t } = useTranslation();
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<{ src: string; type: 'before' | 'after' } | null>(null);

  const { data: suggestedPhotos, isLoading: suggestionsLoading } =
    useClientSuggestedPhotos(isExternal ? undefined : clientId);
  const { uploadPhoto, isUploading } = useShowcasePhotoUpload();

  // Check if photos are allowed based on consent
  const photosAllowed =
    isExternal ||
    (consentType && PHOTO_ALLOWED_CONSENT_TYPES.includes(consentType));

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Read file and open cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage({ src: reader.result as string, type });
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = "";
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!cropImage) return;

    const file = new File([blob], `${cropImage.type}-photo.jpg`, { type: 'image/jpeg' });
    const url = await uploadPhoto(coachId, coachUserId, file, cropImage.type);

    if (url) {
      if (cropImage.type === "before") {
        onBeforePhotoChange(url);
      } else {
        onAfterPhotoChange(url);
      }
    }

    setCropImage(null);
  };

  const handleUseSuggested = (type: "before" | "after") => {
    if (!suggestedPhotos) return;

    if (type === "before" && suggestedPhotos.beforePhoto) {
      onBeforePhotoChange(suggestedPhotos.beforePhoto);
    } else if (type === "after" && suggestedPhotos.afterPhoto) {
      onAfterPhotoChange(suggestedPhotos.afterPhoto);
    }
  };

  if (!photosAllowed) {
    return (
      <Alert variant="destructive" className="bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t(
            "showcase.photosNotAllowed",
            "Client consent level does not permit photo usage. Request 'With Photos' or higher consent to add transformation photos."
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {t("showcase.transformationPhotos", "Transformation Photos")}
        </Label>
        {!isExternal && suggestedPhotos && (
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {t("showcase.photosAvailable", "{{count}} photos available", {
              count: suggestedPhotos.totalPhotos,
            })}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Before Photo */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("showcase.before", "Before")}
          </Label>
          <div className="relative aspect-[4/5] rounded-lg border border-border bg-secondary/30 overflow-hidden">
            {currentBeforePhoto ? (
              <>
                <img
                  src={currentBeforePhoto}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => onBeforePhotoChange(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  {t("showcase.noBeforePhoto", "No before photo")}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isExternal && suggestedPhotos?.beforePhoto && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleUseSuggested("before")}
                disabled={isUploading || suggestionsLoading}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {suggestedPhotos.beforeDate
                  ? format(suggestedPhotos.beforeDate, "MMM d")
                  : t("showcase.useSuggested", "Use Suggested")}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => beforeInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              {t("showcase.upload", "Upload")}
            </Button>
          </div>
        </div>

        {/* After Photo */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {t("showcase.after", "After")}
          </Label>
          <div className="relative aspect-[4/5] rounded-lg border border-border bg-secondary/30 overflow-hidden">
            {currentAfterPhoto ? (
              <>
                <img
                  src={currentAfterPhoto}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => onAfterPhotoChange(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  {t("showcase.noAfterPhoto", "No after photo")}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isExternal && suggestedPhotos?.afterPhoto && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleUseSuggested("after")}
                disabled={isUploading || suggestionsLoading}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {suggestedPhotos.afterDate
                  ? format(suggestedPhotos.afterDate, "MMM d")
                  : t("showcase.useSuggested", "Use Suggested")}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => afterInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              {t("showcase.upload", "Upload")}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={beforeInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "before")}
      />
      <input
        ref={afterInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "after")}
      />

      {/* Suggested photos preview */}
      {!isExternal && suggestionsLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t("showcase.loadingSuggestions", "Loading client photos...")}
        </div>
      )}

      {/* Photo Cropper Modal */}
      {cropImage && (
        <TransformationPhotoCropperModal
          open={!!cropImage}
          onClose={() => setCropImage(null)}
          imageSrc={cropImage.src}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
