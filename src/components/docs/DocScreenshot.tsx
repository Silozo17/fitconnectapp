import { cn } from "@/lib/utils";
import { Image } from "lucide-react";

interface DocScreenshotProps {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
}

export function DocScreenshot({ src, alt, caption, className }: DocScreenshotProps) {
  return (
    <figure className={cn("my-6", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="rounded-lg border border-border w-full"
        />
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
