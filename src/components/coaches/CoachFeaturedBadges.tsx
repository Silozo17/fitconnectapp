import { useQuery } from "@tanstack/react-query";
import { useCoachFeaturedBadges } from "@/hooks/useFeaturedBadges";
import { getBadgeIcon } from "@/lib/badge-icons";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const rarityColors: Record<string, string> = {
  common: "border-muted-foreground/30 bg-muted/20",
  uncommon: "border-success/50 bg-success/10",
  rare: "border-primary/50 bg-primary/10",
  epic: "border-accent/50 bg-accent/10",
  legendary: "border-warning/50 bg-warning/10",
};

interface CoachFeaturedBadgesProps {
  coachId: string;
}

export function CoachFeaturedBadges({ coachId }: CoachFeaturedBadgesProps) {
  const queryConfig = useCoachFeaturedBadges(coachId);
  const { data: featuredBadges, isLoading } = useQuery(queryConfig);

  if (isLoading || !featuredBadges || featuredBadges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipProvider>
        {featuredBadges.map((coachBadge) => {
          const badge = coachBadge.badge;
          if (!badge) return null;
          
          const IconComponent = getBadgeIcon(badge.icon);

          return (
            <Tooltip key={coachBadge.id}>
              <TooltipTrigger asChild>
                <div className="cursor-pointer hover:scale-110 transition-transform">
                  {badge.image_url ? (
                    <img 
                      src={badge.image_url} 
                      alt={badge.name} 
                      className="h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-md" 
                    />
                  ) : (
                    <div className={cn(
                      "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center",
                      rarityColors[badge.rarity]
                    )}>
                      <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
