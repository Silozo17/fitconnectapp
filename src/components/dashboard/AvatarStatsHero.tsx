import { useEffect, useState, useRef, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSelectedAvatar, getAvatarImageUrl } from '@/hooks/useAvatars';
import { useUserStats } from '@/hooks/useUserStats';
import { RARITY_CONFIG } from '@/lib/avatar-utils';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { calculateLevelFromXP } from '@/hooks/useGamification';
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

const StatItem = forwardRef<HTMLDivElement, StatItemProps>(function StatItem(
  { icon, label, value, suffix, color, delay },
  ref
) {
  const [displayValue, setDisplayValue] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    // Cleanup function to clear both timer and interval
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    if (typeof value !== 'number') {
      setDisplayValue(0);
      return cleanup;
    }
    
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
    }, delay);
    
    return cleanup;
  }, [value, delay]);

  return (
    <div 
      ref={ref}
      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover:scale-105 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('p-2 rounded-lg shrink-0', color)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold truncate">
          {typeof value === 'number' ? displayValue.toLocaleString() : value}
          {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
});

interface AvatarStatsHeroProps {
  firstName?: string;
}

export function AvatarStatsHero({ firstName }: AvatarStatsHeroProps) {
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { data: stats, isLoading } = useUserStats();
  const [xpProgress, setXpProgress] = useState(0);
  
  const rarityConfig = selectedAvatar ? RARITY_CONFIG[selectedAvatar.rarity] : RARITY_CONFIG.common;
  const imageUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar.slug) : '/placeholder.svg';
  
  // Calculate XP using the same formula as everywhere else
  const totalXP = stats?.xpTotal || 0;
  const { level: currentLevel, xpInLevel: xpInCurrentLevel, xpForNextLevel } = calculateLevelFromXP(totalXP);
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
    <div className="mb-8">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Avatar with glow - opens picker dialog */}
            <AvatarPicker
              selectedAvatar={selectedAvatar || null}
              profileType="client"
              trigger={
                <button className="group relative block cursor-pointer">
                  <div className={cn(
                    'relative rounded-3xl transition-transform group-hover:scale-105',
                    rarityConfig.glow,
                  )}>
                    {/* Avatar image using squircle variant */}
                    <div className={cn(
                      'relative w-36 h-48 md:w-44 md:h-56 rounded-3xl overflow-visible',
                      rarityConfig.gradient
                    )} style={{ clipPath: 'inset(-30% -5% 0% -5%)' }}>
                      <img
                        src={imageUrl}
                        alt={selectedAvatar?.name || 'Your Avatar'}
                        className="absolute w-full h-[140%] bottom-0 left-1/2 -translate-x-1/2 object-contain object-bottom"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Hover indicator */}
                  <div className="absolute inset-0 rounded-3xl flex items-center justify-center bg-background/0 group-hover:bg-background/20 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded-full">
                      Change Avatar
                    </span>
                  </div>
                </button>
              }
            />
            
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
              <AvatarPicker
                selectedAvatar={null}
                profileType="client"
                trigger={
                  <button className="mt-3 text-sm text-primary hover:underline flex items-center gap-1">
                    Choose your avatar <ChevronRight className="h-3 w-3" />
                  </button>
                }
              />
            )}
          </div>
          
          {/* Stats Section */}
          <div className="flex-1 space-y-6">
            {/* XP Progress Bar */}
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/20">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Level {currentLevel}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {(xpForNextLevel - xpInCurrentLevel).toLocaleString()} XP to next
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
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all hover:scale-105 animate-fade-in overflow-hidden"
                style={{ animationDelay: '1000ms' }}
              >
                <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">View All</p>
                  <p className="text-sm font-semibold text-primary truncate">Achievements</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
