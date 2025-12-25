import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AvatarStatsHero } from '@/components/dashboard/AvatarStatsHero';
import { useSelectedAvatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { useClientXP, getLevelTitle } from '@/hooks/useGamification';
import { useUserProfile } from '@/hooks/useUserProfile';

export function ProfileBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: selectedAvatar, isLoading: avatarLoading } = useSelectedAvatar('client');
  const { data: xpData, isLoading: xpLoading } = useClientXP();
  const { profile, isLoading: profileLoading } = useUserProfile();
  
  const isLoading = avatarLoading || xpLoading || profileLoading;
  
  const displayName = profile?.display_name || profile?.first_name || profile?.username || 'User';
  const avatarUrl = selectedAvatar 
    ? getAvatarImageUrl(selectedAvatar.slug) 
    : profile?.avatar_url || '/placeholder.svg';
  
  const currentLevel = xpData?.current_level || 1;
  const totalXP = xpData?.total_xp || 0;
  const xpToNext = xpData?.xp_to_next_level || 100;
  const levelTitle = getLevelTitle(currentLevel);
  
  // Calculate XP progress percentage
  const xpProgress = Math.min(100, Math.round((totalXP / (totalXP + xpToNext)) * 100));
  
  if (isLoading) {
    return (
      <Card variant="elevated" className="mb-6 p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card variant="elevated" className="mb-6 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center gap-4 hover:bg-secondary/30 transition-all duration-200">
            {/* Avatar - Premium styling */}
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-0.5">
                <div className="h-full w-full rounded-[14px] overflow-hidden bg-card">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-elevation-2">
                {currentLevel}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-left">
              <h2 className="font-semibold text-lg text-foreground font-display">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{levelTitle}</p>
              
              {/* XP Progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {totalXP} XP
                </span>
              </div>
            </div>
            
            {/* Expand indicator */}
            <ChevronRight 
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-300',
                isOpen && 'rotate-90'
              )} 
            />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="border-t border-border/50">
          <div className="p-5 pt-0">
            <AvatarStatsHero firstName={profile?.first_name || ''} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
