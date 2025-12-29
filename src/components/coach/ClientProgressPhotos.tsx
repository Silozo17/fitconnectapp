import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, Shield, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientProgressPhotosProps {
  clientId: string;
  clientName?: string;
}

export const ClientProgressPhotos = ({ clientId, clientName }: ClientProgressPhotosProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { data: progressData, isLoading, error } = useQuery({
    queryKey: ["client-progress-photos", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_progress")
        .select("id, recorded_at, photo_urls, notes")
        .eq("client_id", clientId)
        .not("photo_urls", "is", null)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  // Check if access is denied
  const isAccessDenied = error?.message?.includes("permission") || 
    error?.message?.includes("policy");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || isAccessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {clientName || "This client"} has restricted access to their progress photos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Flatten all photos with their dates
  const allPhotos = (progressData || []).flatMap((entry) =>
    (entry.photo_urls || []).map((url: string) => ({
      url,
      date: entry.recorded_at,
      notes: entry.notes,
    }))
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Progress Photos
          </CardTitle>
          <CardDescription>
            {allPhotos.length} photos available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img
                    src={photo.url}
                    alt={`Progress photo from ${format(new Date(photo.date), "d MMM yyyy")}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium">
                        {format(new Date(photo.date), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No progress photos yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Progress photo"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
