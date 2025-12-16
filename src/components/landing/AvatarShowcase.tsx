import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Lock, Sparkles, Trophy, Target } from 'lucide-react';
import { useAvatars, getAvatarImageUrl } from '@/hooks/useAvatars';
import { cn } from '@/lib/utils';
import { getUnlockDescription } from '@/lib/avatar-unlocks';

export function AvatarShowcase() {
  const { data: avatars } = useAvatars();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rotate featured avatars
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(8, avatars?.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [avatars?.length]);
  
  const featuredAvatars = avatars?.slice(0, 8) || [];
  
  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-amber-600',
  };
  
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Unlock Avatars</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Earn <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Exclusive Avatars</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete challenges, hit milestones, and unlock unique avatars to represent your fitness journey.
            Show off your achievements on the leaderboard!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Featured Avatar Display */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className={cn(
                "absolute inset-0 rounded-3xl blur-3xl opacity-30 bg-gradient-to-br",
                rarityColors[featuredAvatars[activeIndex]?.rarity as keyof typeof rarityColors] || rarityColors.common
              )} />
              
              {/* Avatar image */}
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 w-64 h-80">
                {featuredAvatars[activeIndex] && (
                  <>
                    <img
                      src={featuredAvatars[activeIndex].image_url || getAvatarImageUrl(featuredAvatars[activeIndex].slug)}
                      alt={featuredAvatars[activeIndex].name}
                      className="w-full h-48 object-contain animate-float"
                    />
                    <div className="text-center mt-4">
                      <h3 className="font-semibold text-foreground">{featuredAvatars[activeIndex].name}</h3>
                      <Badge variant="outline" className={cn(
                        "mt-1 capitalize",
                        featuredAvatars[activeIndex].rarity === 'legendary' && "border-yellow-500/50 text-yellow-500",
                        featuredAvatars[activeIndex].rarity === 'epic' && "border-purple-500/50 text-purple-500",
                        featuredAvatars[activeIndex].rarity === 'rare' && "border-blue-500/50 text-blue-500"
                      )}>
                        {featuredAvatars[activeIndex].rarity}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Avatar grid preview */}
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {featuredAvatars.map((avatar, index) => (
                <button
                  key={avatar.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                    index === activeIndex 
                      ? "border-primary scale-105 shadow-lg shadow-primary/20" 
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <img
                    src={avatar.image_url || getAvatarImageUrl(avatar.slug)}
                    alt={avatar.name}
                    className="w-full h-full object-contain bg-muted/30"
                  />
                  {avatar.category !== 'free' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-white/80" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Unlock info cards */}
            <div className="space-y-3">
              <Card className="p-4 bg-card/50 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Complete Challenges</p>
                    <p className="text-xs text-muted-foreground">Unlock avatars by completing fitness challenges</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card/50 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hit Milestones</p>
                    <p className="text-xs text-muted-foreground">Track workouts, habits & progress to earn XP</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Link to="/avatars">
              <Button className="w-full gap-2">
                View All Avatars
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
