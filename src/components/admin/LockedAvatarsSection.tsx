import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAllAvatars, useGrantAvatar } from "@/hooks/useAdminAvatars";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { RARITY_CONFIG } from "@/lib/avatar-config";
import { getUnlockDescription } from "@/lib/avatar-unlocks";
import { Lock, Gift, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LockedAvatarsSectionProps {
  userId: string;
  unlockedAvatarIds: Set<string>;
}

export function LockedAvatarsSection({ userId, unlockedAvatarIds }: LockedAvatarsSectionProps) {
  const { data: allAvatars, isLoading } = useAllAvatars();
  const grantAvatar = useGrantAvatar();

  const lockedAvatars = useMemo(() => {
    if (!allAvatars) return [];
    return allAvatars.filter(avatar => !unlockedAvatarIds.has(avatar.id));
  }, [allAvatars, unlockedAvatarIds]);

  const totalAvatars = allAvatars?.length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" /> Locked Avatars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" /> 
          Locked Avatars ({lockedAvatars.length}/{totalAvatars})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lockedAvatars.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            All avatars unlocked!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lockedAvatars.map((avatar) => {
              const rarityConfig = RARITY_CONFIG[avatar.rarity as keyof typeof RARITY_CONFIG];
              const unlockDesc = getUnlockDescription(avatar.unlock_type, avatar.unlock_threshold);

              return (
                <TooltipProvider key={avatar.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative p-2 rounded-lg border bg-muted/20 opacity-60 hover:opacity-80 transition-opacity",
                          rarityConfig?.border || "border-muted"
                        )}
                      >
                        {/* Lock overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="bg-background/80 rounded-full p-1">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="aspect-square rounded-md overflow-hidden mb-2 bg-background grayscale">
                          <img
                            src={getAvatarImageUrl(avatar.slug)}
                            alt={avatar.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <p className="text-xs font-medium line-clamp-2 leading-tight">{avatar.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className={cn("text-[10px]", rarityConfig?.color)}>
                            {avatar.rarity}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-primary hover:text-primary z-20"
                            disabled={grantAvatar.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              grantAvatar.mutate({
                                userId,
                                avatarId: avatar.id,
                              });
                            }}
                          >
                            {grantAvatar.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Gift className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1">
                          {unlockDesc}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-medium">{avatar.name}</p>
                      <p className="text-xs text-muted-foreground">{unlockDesc}</p>
                      {avatar.description && (
                        <p className="text-xs mt-1">{avatar.description}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
