import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSelectedAvatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { useUserStats } from '@/hooks/useUserStats';
import { RARITY_CONFIG } from '@/lib/avatar-config';
import { 
  Zap, 
  Trophy, 
  Flame, 
  Dumbbell, 
  Medal, 
  Target, 
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
  delay: number;
}

function StatItem({ icon, label, value, suffix, color, delay }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : 0;
  
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(0);
      return;
    }
    
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover:scale-105 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('p-2 rounded-lg', color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">
          {typeof value === 'number' ? displayValue.toLocaleString() : value}
          {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

interface AvatarStatsHeroProps {
  firstName?: string;
}

export function AvatarStatsHero({ firstName }: AvatarStatsHeroProps) {
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { data: stats, isLoading } = useUserStats();
  const [xpProgress, setXpProgress] = useState(0);
  
  const rarityConfig = selectedAvatar ? RARITY_CONFIG[selectedAvatar.rarity] : RARITY_CONFIG.common;
  const imageUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar.slug) : '/placeholder.svg';
  
  // Calculate XP to next level (Level * 100 XP per level)
  const currentLevel = stats?.currentLevel || 1;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = (stats?.xpTotal || 0) % xpForNextLevel;
  const xpPercentage = Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100);
  
  // Animate XP bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setXpProgress(xpPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [xpPercentage]);
  
  // Calculate leaderboard percentile
  const getLeaderboardText = () => {
    if (!stats?.leaderboardRank || stats.leaderboardRank === 0) return 'Unranked';
    if (stats.leaderboardRank <= 10) return `#${stats.leaderboardRank} (Top 10!)`;
    if (stats.leaderboardRank <= 100) return `#${stats.leaderboardRank}`;
    return `#${stats.leaderboardRank}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-6 mb-8 animate-pulse">
        <div className="h-48 bg-muted/20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-card via-card/80 to-background border border-border overflow-hidden mb-8">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Avatar with glow */}
            <Link 
              to="/dashboard/client/achievements" 
              className="group relative block"
            >
              <div className={cn(
                'relative rounded-xl p-1 transition-transform group-hover:scale-105',
                rarityConfig.glow,
                rarityConfig.border,
                'border-2 bg-gradient-to-br from-primary/20 to-accent/20'
              )}>
                {/* Animated glow ring */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/40 via-transparent to-accent/40 animate-pulse" />
                
                {/* Avatar image - portrait */}
                <div className="relative w-32 h-44 md:w-40 md:h-56 rounded-lg overflow-hidden bg-background/50">
                  <img
                    src={imageUrl}
                    alt={selectedAvatar?.name || 'Your Avatar'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/0 group-hover:bg-background/20 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded-full">
                  Change Avatar
                </span>
              </div>
            </Link>
            
            {/* Avatar name and rarity */}
            {selectedAvatar && (
              <div className="mt-3 text-center lg:text-left">
                <h3 className="font-bold text-base">{selectedAvatar.name}</h3>
                <span className={cn('text-sm', rarityConfig.color)}>
                  {rarityConfig.label}
                </span>
              </div>
            )}
            
            {!selectedAvatar && (
              <Link 
                to="/dashboard/client/achievements"
                className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
              >
                Choose your avatar <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          
          {/* Stats Section */}
          <div className="flex-1 space-y-6">
            {/* Welcome & Level */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground animate-fade-in">
                Welcome back{firstName ? `, ${firstName}` : ''}!
              </h1>
              <p className="text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
                Here's your fitness journey at a glance
              </p>
            </div>
            
            {/* XP Progress Bar */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/20">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Level {currentLevel}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </span>
              </div>
              <Progress 
                value={xpProgress} 
                className="h-3 bg-muted/30"
              />
              <p className="text-xs text-muted-foreground">
                {(xpForNextLevel - xpInCurrentLevel).toLocaleString()} XP to Level {currentLevel + 1}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatItem
                icon={<Trophy className="h-4 w-4 text-amber-500" />}
                label="Rank"
                value={getLeaderboardText()}
                color="bg-amber-500/20"
                delay={300}
              />
              <StatItem
                icon={<Flame className="h-4 w-4 text-orange-500" />}
                label="Habit Streak"
                value={stats?.habitStreak || 0}
                suffix="days"
                color="bg-orange-500/20"
                delay={400}
              />
              <StatItem
                icon={<Dumbbell className="h-4 w-4 text-blue-500" />}
                label="Workouts"
                value={stats?.workoutCount || 0}
                color="bg-blue-500/20"
                delay={500}
              />
              <StatItem
                icon={<Medal className="h-4 w-4 text-purple-500" />}
                label="Badges"
                value={stats?.badgesEarned || 0}
                color="bg-purple-500/20"
                delay={600}
              />
              <StatItem
                icon={<Target className="h-4 w-4 text-green-500" />}
                label="Challenges"
                value={stats?.challengesCompleted || 0}
                color="bg-green-500/20"
                delay={700}
              />
              <StatItem
                icon={<TrendingUp className="h-4 w-4 text-pink-500" />}
                label="Check-ins"
                value={stats?.progressEntries || 0}
                color="bg-pink-500/20"
                delay={800}
              />
              <StatItem
                icon={<Zap className="h-4 w-4 text-primary" />}
                label="Total XP"
                value={stats?.xpTotal || 0}
                color="bg-primary/20"
                delay={900}
              />
              <Link 
                to="/dashboard/client/achievements"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: '1000ms' }}
              >
                <div className="p-2 rounded-lg bg-primary/20">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">View All</p>
                  <p className="text-sm font-semibold text-primary">Achievements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
