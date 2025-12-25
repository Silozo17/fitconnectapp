import { useState } from 'react';
import { useAvatars, useUnlockedAvatars, useSelectAvatar, Avatar } from '@/hooks/useAvatars';
import { useUserStats } from '@/hooks/useUserStats';
import { AvatarCard } from './AvatarCard';
import { AvatarShowcase } from './AvatarShowcase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Loader2, Pencil, Lock } from 'lucide-react';
import { getUnlockDescription, getUnlockProgress } from '@/lib/avatar-utils';

interface AvatarPickerProps {
  selectedAvatar: Avatar | null;
  profileType: 'client' | 'coach';
  trigger?: React.ReactNode;
}

export function AvatarPicker({ selectedAvatar, profileType, trigger }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<Avatar | null>(null);
  
  const { data: avatars, isLoading: avatarsLoading } = useAvatars();
  const { data: unlockedAvatars, isLoading: unlockedLoading } = useUnlockedAvatars();
  const { data: stats } = useUserStats();
  const selectAvatar = useSelectAvatar();
  
  const isLoading = avatarsLoading || unlockedLoading;
  const unlockedIds = new Set(unlockedAvatars?.map(ua => ua.avatar_id) || []);
  
  // Auto-include free avatars as unlocked
  const freeIds = new Set(avatars?.filter(a => a.category === 'free').map(a => a.id) || []);
  const effectiveUnlockedIds = new Set([...unlockedIds, ...freeIds]);
  
  // Coach exclusive check
  const isCoach = profileType === 'coach' || stats?.isCoach;
  
  const getProgress = (avatar: Avatar) => {
    if (!stats || avatar.category === 'free' || !avatar.unlock_threshold) return undefined;
    
    let current = 0;
    switch (avatar.unlock_type) {
      case 'workout_count': current = stats.workoutCount; break;
      case 'habit_streak': current = stats.habitStreak; break;
      case 'progress_entries': current = stats.progressEntries; break;
      case 'progress_photos': current = stats.progressPhotos; break;
      case 'macro_days': current = stats.macroDays; break;
      case 'xp_total': current = stats.xpTotal; break;
      case 'challenges_completed': current = stats.challengesCompleted; break;
      case 'leaderboard_rank': 
        return { current: stats.leaderboardRank, target: avatar.unlock_threshold };
    }
    
    return { current, target: avatar.unlock_threshold };
  };
  
  const isAvatarUnlocked = (avatar: Avatar) => {
    if (avatar.category === 'free') return true;
    if (avatar.category === 'coach_exclusive') return isCoach;
    return effectiveUnlockedIds.has(avatar.id);
  };
  
  const handleSelect = async (avatar: Avatar) => {
    setPreviewAvatar(avatar);
  };
  
  const handleConfirm = async () => {
    if (!previewAvatar) return;
    await selectAvatar.mutateAsync({ avatarId: previewAvatar.id, profileType });
    setOpen(false);
    setPreviewAvatar(null);
  };
  
  const freeAvatars = avatars?.filter(a => a.category === 'free') || [];
  const challengeAvatars = avatars?.filter(a => a.category === 'challenge_unlock') || [];
  const coachAvatars = avatars?.filter(a => a.category === 'coach_exclusive') || [];
  
  const displayAvatar = previewAvatar || selectedAvatar;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Pencil className="h-4 w-4" />
            Choose Avatar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90dvh] md:max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6 pb-0 md:pb-0">
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        {/* Mobile: Stacked layout, Desktop: Side by side */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
          {/* Preview section - Compact on mobile, full on desktop */}
          <div className="flex-shrink-0 flex flex-col items-center p-3 md:p-4 bg-muted/30 rounded-2xl md:w-[220px]">
            <div className="flex md:flex-col items-center gap-4 md:gap-0 w-full">
              <AvatarShowcase avatar={displayAvatar} size="md" showStats={false} />
              <div className="flex-1 md:flex-none text-center md:mt-3 space-y-1 md:space-y-2">
                {displayAvatar && (
                  <>
                    <p className="text-sm font-medium">{displayAvatar.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-none md:max-w-[180px]">
                      {displayAvatar.description}
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* Unlock requirements for locked avatars - only show on desktop or when selected */}
            {previewAvatar && !isAvatarUnlocked(previewAvatar) && (
              <div className="w-full mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs font-medium">How to Unlock</span>
                </div>
                {previewAvatar.category === 'coach_exclusive' ? (
                  <p className="text-xs text-muted-foreground">Become a verified coach</p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">
                      {getUnlockDescription(previewAvatar.unlock_type, previewAvatar.unlock_threshold)}
                    </p>
                    {stats && previewAvatar.unlock_type && previewAvatar.unlock_threshold && (
                      <div className="space-y-1">
                        <Progress 
                          value={getUnlockProgress(previewAvatar.unlock_type, previewAvatar.unlock_threshold, stats)?.percentage || 0} 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-muted-foreground">
                          {getUnlockProgress(previewAvatar.unlock_type, previewAvatar.unlock_threshold, stats)?.current || 0} / {previewAvatar.unlock_threshold}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <Button 
              className="mt-3 md:mt-4 w-full rounded-xl" 
              onClick={handleConfirm}
              disabled={!previewAvatar || !isAvatarUnlocked(previewAvatar) || selectAvatar.isPending}
            >
              {selectAvatar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {previewAvatar && !isAvatarUnlocked(previewAvatar) ? 'Locked' : 'Select Avatar'}
            </Button>
          </div>
          
          {/* Avatar grid */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 md:h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="all" className="h-full flex flex-col">
                <TabsList className="w-full flex-shrink-0">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unlocked" className="flex-1">Unlocked</TabsTrigger>
                  <TabsTrigger value="locked" className="flex-1">Locked</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="flex-1 mt-4 max-h-[40vh] md:max-h-[400px]">
                  <TabsContent value="all" className="m-0">
                    <div className="space-y-4">
                      {/* Free avatars */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Free Avatars</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {freeAvatars.map(avatar => (
                            <AvatarCard
                              key={avatar.id}
                              avatar={avatar}
                              isUnlocked={true}
                              isSelected={displayAvatar?.id === avatar.id}
                              onClick={() => handleSelect(avatar)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Challenge avatars */}
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Challenge Avatars</h4>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {challengeAvatars.map(avatar => (
                            <AvatarCard
                              key={avatar.id}
                              avatar={avatar}
                              isUnlocked={isAvatarUnlocked(avatar)}
                              isSelected={displayAvatar?.id === avatar.id}
                              progress={getProgress(avatar)}
                              onClick={() => handleSelect(avatar)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Coach exclusive */}
                      {(isCoach || coachAvatars.length > 0) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Coach Exclusive</h4>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {coachAvatars.map(avatar => (
                              <AvatarCard
                                key={avatar.id}
                                avatar={avatar}
                                isUnlocked={isCoach}
                                isSelected={displayAvatar?.id === avatar.id}
                                onClick={() => handleSelect(avatar)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="unlocked" className="m-0">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {avatars?.filter(a => isAvatarUnlocked(a)).map(avatar => (
                        <AvatarCard
                          key={avatar.id}
                          avatar={avatar}
                          isUnlocked={true}
                          isSelected={displayAvatar?.id === avatar.id}
                          onClick={() => handleSelect(avatar)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="locked" className="m-0">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {avatars?.filter(a => !isAvatarUnlocked(a)).map(avatar => (
                        <AvatarCard
                          key={avatar.id}
                          avatar={avatar}
                          isUnlocked={false}
                          isSelected={false}
                          progress={getProgress(avatar)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
