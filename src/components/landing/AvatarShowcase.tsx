import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Lock, Sparkles, Trophy, Target } from 'lucide-react';
import { useAvatars, getAvatarImageUrl } from '@/hooks/useAvatars';
import { cn } from '@/lib/utils';
import apeHandImage from '@/assets/ape_hand.webp';

export function AvatarShowcase() {
  const { t } = useTranslation('landing');
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
    <section className="py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('avatarShowcase.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('avatarShowcase.title')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('avatarShowcase.titleHighlight')}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('avatarShowcase.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Featured Avatar Display - Free floating, no box */}
          <div className="relative flex justify-center items-center min-h-[400px]">
            {featuredAvatars[activeIndex] && (
              <div className="relative">
                {/* Glow effect */}
                <div className={cn(
                  "absolute inset-0 blur-3xl opacity-40 scale-110 bg-gradient-to-br",
                  rarityColors[featuredAvatars[activeIndex]?.rarity as keyof typeof rarityColors] || rarityColors.common
                )} />
                
                {/* Avatar image - larger, free floating */}
                <img
                  src={featuredAvatars[activeIndex].image_url || getAvatarImageUrl(featuredAvatars[activeIndex].slug)}
                  alt="Avatar character"
                  className="relative w-72 h-96 object-contain animate-float drop-shadow-2xl"
                />
              </div>
            )}
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
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('avatarShowcase.completeChallenges')}</p>
                    <p className="text-xs text-muted-foreground">{t('avatarShowcase.completeChallengesDesc')}</p>
                  </div>
                </div>
              </Card>
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('avatarShowcase.hitMilestones')}</p>
                    <p className="text-xs text-muted-foreground">{t('avatarShowcase.hitMilestonesDesc')}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Link to="/community?tab=avatars">
              <Button className="w-full gap-2">
                {t('avatarShowcase.viewAll')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Ape hand image - centered with fade-out effect */}
        <div className="flex justify-center mt-6 relative">
          <div className="relative">
            <img 
              src={apeHandImage} 
              alt="Ape hand holding phone" 
              className="w-full max-w-md object-contain"
            />
            {/* Bottom fade overlay to hide cut-off */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
