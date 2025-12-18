import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Trash2, GripVertical, Info, ImageIcon } from "lucide-react";
import { CardImageCropperModal } from "@/components/shared/CardImageCropperModal";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useMyCoachGallery, useAddGalleryImage, useDeleteGalleryImage, useUpdateGalleryImage, useReorderGalleryImages, GalleryImage } from "@/hooks/useCoachGallery";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableImageCardProps {
  image: GalleryImage;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  isDeleting: boolean;
}

function SortableImageCard({ image, onDelete, onUpdateCaption, isDeleting }: SortableImageCardProps) {
  const [caption, setCaption] = useState(image.caption || "");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-secondary rounded-lg overflow-hidden border border-border"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-background/80 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="aspect-[4/3]">
        <img
          src={image.image_url}
          alt={image.caption || "Gallery image"}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-2 space-y-2">
        <Input
          placeholder="Add caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => {
            if (caption !== image.caption) {
              onUpdateCaption(image.id, caption);
            }
          }}
          className="text-xs h-8"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(image.id)}
          disabled={isDeleting}
          className="w-full text-destructive hover:text-destructive h-7 text-xs"
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface CoachGalleryUploadProps {
  userId: string;
}

export function CoachGalleryUpload({ userId }: CoachGalleryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  
  const { data: images = [], isLoading } = useMyCoachGallery();
  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();
  const updateCaption = useUpdateGalleryImage();
  const reorderImages = useReorderGalleryImages();
  
  const { uploadImage, uploading } = useProfileImage({
    bucket: "profile-images",
    onSuccess: (url) => {
      addImage.mutate({ imageUrl: url });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setPreviewSrc(null);

    const file = new File([croppedBlob], `gallery_${userId}_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    await uploadImage(file, userId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      const updates = newOrder.map((img, index) => ({
        id: img.id,
        display_order: index,
      }));

      reorderImages.mutate(updates);
    }
  };

  const canAddMore = images.length < 5;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Gallery Images
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Recommended:</strong> 1200×800px minimum, 4:3 aspect ratio.
                      Max 5MB per image. JPG or PNG format.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              Showcase your work with up to 5 photos ({images.length}/5)
            </CardDescription>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || uploading || addImage.isPending}
          >
            {uploading || addImage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Add Photo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Click to upload your first gallery image
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Show clients who you work with and your training style
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    onDelete={(id) => deleteImage.mutate(id)}
                    onUpdateCaption={(id, caption) => updateCaption.mutate({ id, caption })}
                    isDeleting={deleteImage.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!canAddMore && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Maximum 5 gallery images reached. Remove one to add more.
          </p>
        )}
      </CardContent>

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
    </Card>
  );
}
