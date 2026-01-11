import { useState, useCallback, lazy, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import { useTranslation } from "react-i18next";

const Cropper = lazy(() => import("react-easy-crop"));

// 4:5 portrait aspect ratio for transformation photos
const ASPECT = 4 / 5;
const OUTPUT_WIDTH = 800;

interface TransformationPhotoCropperModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
}

export function TransformationPhotoCropperModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
}: TransformationPhotoCropperModalProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback(
    (
      _croppedArea: { x: number; y: number; width: number; height: number },
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleClose = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, OUTPUT_WIDTH, ASPECT);
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
      handleClose();
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, handleClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("showcase.cropPhoto", "Crop Photo")}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("showcase.cropAspectRatioNote", "Ideal aspect ratio: 4:5 (portrait). Adjust the crop area to frame your transformation photo.")}
          </p>
        </DialogHeader>

        <div className="relative aspect-[4/5] w-full bg-muted rounded-lg overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropAreaChange}
              />
            )}
          </Suspense>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            {t("common.zoom", "Zoom")}
          </label>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(values) => setZoom(values[0])}
            className="w-full"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {t("common:common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("common.cropAndSave", "Crop & Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
