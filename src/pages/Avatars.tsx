import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Lock, Crown, ChevronRight, Trophy, Target, Flame } from 'lucide-react';
import { useAvatars, getAvatarImageUrl } from '@/hooks/useAvatars';
import { getUnlockDescription, UNLOCK_DESCRIPTIONS } from '@/lib/avatar-unlocks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Avatars() {
  const { data: avatars, isLoading } = useAvatars();
  
  const freeAvatars = avatars?.filter(a => a.category === 'free') || [];
  const challengeAvatars = avatars?.filter(a => a.category === 'challenge_unlock') || [];
  const coachAvatars = avatars?.filter(a => a.category === 'coach_exclusive') || [];
  
  const rarityColors = {
    common: { border: 'border-slate-500/30', bg: 'bg-slate-500/10', text: 'text-slate-400' },
    uncommon: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
    rare: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    epic: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    legendary: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  };
  
  const AvatarCard = ({ avatar, locked = false }: { avatar: any; locked?: boolean }) => {
    const colors = rarityColors[avatar.rarity as keyof typeof rarityColors] || rarityColors.common;
    const unlockInfo = UNLOCK_DESCRIPTIONS[avatar.unlock_type];
    
    return (
      <Card className={cn(
        "relative overflow-hidden transition-all hover:scale-105 group",
        colors.border, colors.bg
      )}>
        <div className="aspect-[3/4] p-4 flex flex-col">
          {/* Avatar Image */}
          <div className="flex-1 flex items-center justify-center relative">
            <img
              src={avatar.image_url || getAvatarImageUrl(avatar.slug)}
              alt={avatar.name}
              className={cn(
                "max-h-full w-auto object-contain transition-transform group-hover:scale-110",
                locked && "opacity-60"
              )}
            />
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 rounded-full bg-black/50">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="text-center mt-3">
            <h3 className="font-semibold text-sm">{avatar.name}</h3>
            <Badge variant="outline" className={cn("mt-1 text-xs capitalize", colors.text, colors.border)}>
              {avatar.rarity}
            </Badge>
          </div>
        </div>
        
        {/* Unlock requirement tooltip on hover */}
        {avatar.category !== 'free' && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
            <div className="flex items-center gap-2 text-xs text-white">
              {unlockInfo && <span>{unlockInfo.icon}</span>}
              <span>{getUnlockDescription(avatar.unlock_type, avatar.unlock_threshold)}</span>
            </div>
          </div>
        )}
      </Card>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Unlockable Avatars | FitConnect Rewards</title>
        <meta name="description" content="Discover and unlock exclusive avatars by completing fitness challenges, hitting milestones, and earning XP on FitConnect." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Avatar Collection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Unlock Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Avatar
                </span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Represent your fitness journey with unique avatars. Complete challenges, 
                hit milestones, and show off your progress on the leaderboard!
              </p>
            </div>
            
            {/* How to unlock section */}
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              <Card className="p-6 bg-card/50 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Complete Challenges</h3>
                    <p className="text-sm text-muted-foreground">Join weekly & monthly challenges</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-card/50 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Hit Milestones</h3>
                    <p className="text-sm text-muted-foreground">Track workouts, habits & progress</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-card/50 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Build Streaks</h3>
                    <p className="text-sm text-muted-foreground">Maintain daily habit streaks</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Avatar Tabs */}
            <Tabs defaultValue="all" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="challenge">Challenge</TabsTrigger>
                <TabsTrigger value="coach">Coach</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {freeAvatars.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Free Avatars
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {freeAvatars.map(avatar => (
                            <AvatarCard key={avatar.id} avatar={avatar} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {challengeAvatars.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          Challenge Avatars
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {challengeAvatars.map(avatar => (
                            <AvatarCard key={avatar.id} avatar={avatar} locked />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {coachAvatars.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Crown className="h-5 w-5 text-purple-500" />
                          Coach Exclusive
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {coachAvatars.map(avatar => (
                            <AvatarCard key={avatar.id} avatar={avatar} locked />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="free">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {freeAvatars.map(avatar => (
                    <AvatarCard key={avatar.id} avatar={avatar} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="challenge">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {challengeAvatars.map(avatar => (
                    <AvatarCard key={avatar.id} avatar={avatar} locked />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="coach">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {coachAvatars.map(avatar => (
                    <AvatarCard key={avatar.id} avatar={avatar} locked />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* CTA */}
            <Card className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Start Collecting Avatars</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sign up for free and start your fitness journey. Complete challenges, earn XP, and unlock exclusive avatars!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/leaderboards">
                  <Button size="lg" variant="outline" className="gap-2">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
