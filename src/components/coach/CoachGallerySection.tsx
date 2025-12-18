import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoachGallery } from "@/hooks/useCoachGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface CoachGallerySectionProps {
  coachId: string;
}

export function CoachGallerySection({ coachId }: CoachGallerySectionProps) {
  const { data: galleryImages, isLoading } = useCoachGallery(coachId);

  // Don't render if no images
  if (!isLoading && (!galleryImages || galleryImages.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Gallery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages?.map((image) => (
            <div key={image.id} className="group relative">
              <img
                src={image.image_url}
                alt={image.caption || "Gallery image"}
                className="aspect-square w-full object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-sm line-clamp-2">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
