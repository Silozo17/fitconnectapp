import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { useCoachGallery } from "@/hooks/useCoachGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface CoachGallerySectionProps {
  coachId: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

export function CoachGallerySection({ coachId }: CoachGallerySectionProps) {
  const { data: galleryImages, isLoading } = useCoachGallery(coachId);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { t } = useTranslation('coaches');

  // Don't render if no images
  if (!isLoading && (!galleryImages || galleryImages.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <ContentSection colorTheme="muted">
        <ContentSectionHeader
          icon={ImageIcon}
          title={t('profile.gallery') || 'Gallery'}
        />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </ContentSection>
    );
  }

  return (
    <>
      <ContentSection colorTheme="muted">
        <ContentSectionHeader
          icon={ImageIcon}
          title={`${t('profile.gallery') || 'Gallery'} (${galleryImages?.length || 0})`}
        />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-4">
          {galleryImages?.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            >
              <img
                src={image.image_url}
                alt={image.caption || "Gallery image"}
                className="aspect-square w-full object-cover rounded-lg transition-transform group-hover:scale-[1.02] group-hover:shadow-lg"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-xs line-clamp-2">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </ContentSection>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <div className="flex flex-col">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption || "Gallery image"}
                  className="w-full max-h-[80vh] object-contain rounded-t-lg"
                />
                {selectedImage.caption && (
                  <div className="p-4 border-t">
                    <p className="text-sm text-muted-foreground">{selectedImage.caption}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
