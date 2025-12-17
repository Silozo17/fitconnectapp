import { cn } from "@/lib/utils";
import { Image, Loader2 } from "lucide-react";
import { useState } from "react";
import { getDocScreenshotUrl, type DocScreenshotId } from "@/lib/doc-screenshots";

interface DocScreenshotProps {
  src?: string;
  docId?: DocScreenshotId;
  alt: string;
  caption?: string;
  className?: string;
}

export function DocScreenshot({ src, docId, alt, caption, className }: DocScreenshotProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Use docId to get URL if provided, otherwise fall back to src
  const imageSrc = docId ? getDocScreenshotUrl(docId) : src;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <figure className={cn("my-6", className)}>
      {imageSrc && !hasError ? (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
            </div>
          )}
          <img
            src={imageSrc}
            alt={alt}
            className={cn(
              "rounded-lg border border-border w-full transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 aspect-video flex flex-col items-center justify-center gap-2">
          <Image className="h-12 w-12 text-muted-foreground/50" />
          <span className="text-muted-foreground/50 text-sm">{alt}</span>
        </div>
      )}
      {caption && (
        <figcaption className="text-center text-muted-foreground text-sm mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
