/**
 * Individual news item card for discipline news feed
 */

import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsItemCardProps {
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string | null;
  className?: string;
}

export function NewsItemCard({
  title,
  summary,
  url,
  imageUrl,
  publishedAt,
  className,
}: NewsItemCardProps) {
  const timeAgo = publishedAt 
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
    : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex gap-3 p-3 rounded-lg border border-border/30 bg-card/50",
        "hover:bg-accent/50 hover:border-border/50 transition-all duration-200",
        "group cursor-pointer",
        className
      )}
    >
      {imageUrl && (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h4>
        
        {summary && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {summary}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-1.5">
          {timeAgo && (
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          )}
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}
