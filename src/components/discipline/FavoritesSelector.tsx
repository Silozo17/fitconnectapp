/**
 * Modal for managing favorite teams, players, and athletes
 */

import { useState, useMemo } from "react";
import { Search, Star, X, Users, User, Trophy, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useDisciplineEntities, 
  useDisciplineFavorites,
  useSearchEntities,
  useAddFavorite,
  useRemoveFavorite,
  FollowableEntity 
} from "@/hooks/useDisciplineFavorites";
import { DisciplineTheme } from "@/config/disciplines/types";

interface FavoritesSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disciplineId: string;
  disciplineName: string;
  theme: DisciplineTheme;
}

const entityTypeIcons = {
  team: Users,
  player: User,
  athlete: User,
  league: Trophy,
  organization: Building,
};

const entityTypeLabels = {
  team: 'Teams',
  player: 'Players',
  athlete: 'Athletes',
  league: 'Leagues',
  organization: 'Organizations',
};

function EntityCard({ 
  entity, 
  isFavorite, 
  onToggle,
  isLoading,
}: { 
  entity: FollowableEntity; 
  isFavorite: boolean; 
  onToggle: () => void;
  isLoading?: boolean;
}) {
  const Icon = entityTypeIcons[entity.entity_type] || User;
  
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg border transition-all",
        isFavorite
          ? "border-primary/50 bg-primary/10"
          : "border-border/30 hover:border-border/50 hover:bg-accent/50"
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 text-left">
        <p className="font-medium text-sm">{entity.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{entity.entity_type}</p>
      </div>
      
      <Star
        className={cn(
          "w-5 h-5 transition-colors",
          isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </button>
  );
}

export function FavoritesSelector({
  open,
  onOpenChange,
  disciplineId,
  disciplineName,
  theme,
}: FavoritesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: entities, isLoading: entitiesLoading } = useDisciplineEntities(disciplineId);
  const { data: favorites, isLoading: favoritesLoading } = useDisciplineFavorites(disciplineId);
  const { data: searchResults } = useSearchEntities(searchQuery, disciplineId);
  
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  
  const favoriteIds = useMemo(() => 
    new Set(favorites?.map(f => f.entity_id) || []),
    [favorites]
  );
  
  const favoriteMap = useMemo(() => 
    new Map(favorites?.map(f => [f.entity_id, f.id]) || []),
    [favorites]
  );

  // Group entities by type
  const groupedEntities = useMemo(() => {
    const displayEntities = searchQuery.length >= 2 ? searchResults : entities;
    if (!displayEntities) return {};
    
    return displayEntities.reduce((acc, entity) => {
      const type = entity.entity_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(entity);
      return acc;
    }, {} as Record<string, FollowableEntity[]>);
  }, [entities, searchResults, searchQuery]);

  const handleToggleFavorite = (entity: FollowableEntity) => {
    if (favoriteIds.has(entity.id)) {
      const favoriteId = favoriteMap.get(entity.id);
      if (favoriteId) {
        removeFavorite.mutate(favoriteId);
      }
    } else {
      addFavorite.mutate({ entityId: entity.id, disciplineId });
    }
  };

  const isLoading = entitiesLoading || favoritesLoading;
  const isMutating = addFavorite.isPending || removeFavorite.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Star className={cn("w-5 h-5", theme.accent)} />
            Follow in {disciplineName}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, players..."
            className="pl-9"
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Your favorites */}
        {favorites && favorites.length > 0 && !searchQuery && (
          <div className="py-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Your Favorites ({favorites.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav) => (
                <Badge 
                  key={fav.id} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeFavorite.mutate(fav.id)}
                >
                  {fav.entity?.name || 'Unknown'}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Entity list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedEntities).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No results found" : "No entities available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {Object.entries(groupedEntities).map(([type, typeEntities]) => (
                <div key={type}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {entityTypeLabels[type as keyof typeof entityTypeLabels] || type}
                  </p>
                  <div className="space-y-2">
                    {typeEntities.map((entity) => (
                      <EntityCard
                        key={entity.id}
                        entity={entity}
                        isFavorite={favoriteIds.has(entity.id)}
                        onToggle={() => handleToggleFavorite(entity)}
                        isLoading={isMutating}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Done button */}
        <div className="pt-2 border-t border-border/30">
          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
