/**
 * News feed component for discipline details
 * Shows live sports news relevant to the selected discipline
 */

import { useState } from "react";
import { Newspaper, RefreshCw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisciplineNews } from "@/hooks/useDisciplineNews";
import { useDisciplineFavorites } from "@/hooks/useDisciplineFavorites";
import { NewsItemCard } from "./NewsItemCard";
import { DisciplineTheme } from "@/config/disciplines/types";

interface DisciplineNewsFeedProps {
  disciplineId: string;
  theme: DisciplineTheme;
  onManageFavorites?: () => void;
}

export function DisciplineNewsFeed({
  disciplineId,
  theme,
  onManageFavorites,
}: DisciplineNewsFeedProps) {
  const [showPersonalized, setShowPersonalized] = useState(false);
  
  const { data: favorites } = useDisciplineFavorites(disciplineId);
  const favoriteEntityIds = favorites?.map(f => f.entity_id) || [];
  
  const { 
    data: news, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useDisciplineNews(
    disciplineId,
    showPersonalized ? favoriteEntityIds : undefined
  );

  const hasNews = news && news.length > 0;
  const hasFavorites = favoriteEntityIds.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className={cn("w-4 h-4", theme.accent)} />
          <h4 className="font-semibold">Latest News</h4>
        </div>
        
        <div className="flex items-center gap-2">
          {hasFavorites && (
            <Button
              size="sm"
              variant={showPersonalized ? "default" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setShowPersonalized(!showPersonalized)}
            >
              <Star className="w-3 h-3 mr-1" />
              For You
            </Button>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Favorites indicator */}
      {hasFavorites && onManageFavorites && (
        <button
          onClick={onManageFavorites}
          className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Following {favoriteEntityIds.length} {favoriteEntityIds.length === 1 ? 'entity' : 'entities'} • Tap to manage
        </button>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/30">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">
            Unable to load news
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !hasNews && (
        <div className="text-center py-6 border border-dashed border-border/50 rounded-lg">
          <Newspaper className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {showPersonalized 
              ? "No news matching your favorites" 
              : "No news available right now"}
          </p>
          {showPersonalized && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="mt-2"
              onClick={() => setShowPersonalized(false)}
            >
              Show all news
            </Button>
          )}
        </div>
      )}

      {/* News list */}
      {hasNews && (
        <div className="space-y-2">
          {news.slice(0, 5).map((item) => (
            <NewsItemCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              url={item.url}
              imageUrl={item.image_url}
              publishedAt={item.published_at}
            />
          ))}
          
          {news.length > 5 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Showing 5 of {news.length} articles
            </p>
          )}
        </div>
      )}
    </div>
  );
}
