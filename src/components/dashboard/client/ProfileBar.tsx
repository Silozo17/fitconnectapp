import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Bell } from 'lucide-react';
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
  const levelTitle = getLevelTitle(currentLevel);
  
  if (isLoading) {
    return (
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </Card>
    );
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-6 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted border-2 border-primary/30">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Name and Level */}
              <div className="text-left">
                <h2 className="font-semibold text-foreground">{displayName}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    Level {currentLevel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {levelTitle}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" asChild className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <Link to="/dashboard/client/notifications">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
              
              {/* Expand/Collapse Chevron */}
              <ChevronDown 
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} 
              />
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="border-t border-border">
          <div className="p-4 pt-0">
            <AvatarStatsHero firstName={profile?.first_name || ''} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
