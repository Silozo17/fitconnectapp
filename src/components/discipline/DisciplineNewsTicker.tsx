/**
 * DisciplineNewsTicker - Compact news ticker for the discipline widget
 */

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Newspaper, ExternalLink } from "lucide-react";
import { useDisciplineNews } from "@/hooks/useDisciplineNews";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface DisciplineNewsTickerProps {
  disciplineId: string;
  accentClass?: string;
  className?: string;
  maxItems?: number;
}

export const DisciplineNewsTicker = memo(function DisciplineNewsTicker({ 
  disciplineId, 
  accentClass = "text-primary",
  className,
  maxItems = 2
}: DisciplineNewsTickerProps) {
  const { data: news, isLoading } = useDisciplineNews(disciplineId);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <Newspaper className={cn("w-3.5 h-3.5", accentClass)} />
        <span className="text-xs font-medium text-muted-foreground">Latest News</span>
      </div>
      
      <div className="space-y-1.5">
        {news.slice(0, maxItems).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </p>
              {item.published_at && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                </p>
              )}
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
});
