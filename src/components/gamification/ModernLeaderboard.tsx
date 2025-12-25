import { useState } from 'react';
import { cn } from '@/lib/utils';
import { XPLeaderboardEntry } from '@/hooks/useGamification';
import { LeaderboardPodium } from './LeaderboardPodium';
import { LeaderboardRankRow } from './LeaderboardRankRow';
import { SectionDivider } from '@/components/shared/SectionDivider';
import { GlassCard } from '@/components/shared/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Globe, MapPin, Map, Building, ChevronDown, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LucideIcon } from 'lucide-react';

export type LocationType = 'global' | 'country' | 'county' | 'city';

interface LocationOption {
  value: LocationType;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  sublabel?: string;
}

interface ModernLeaderboardProps {
  entries: XPLeaderboardEntry[];
  currentUserId?: string;
  currentUserRank?: { rank: number; total: number } | null;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  showPodium?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'compact' | 'challenge';
  // Location selector props
  selectedLocation: LocationType;
  onLocationChange: (location: LocationType) => void;
  locationOptions: LocationOption[];
  locationLabel?: string;
}

export function ModernLeaderboard({
  entries,
  currentUserId,
  currentUserRank,
  title = 'Leaderboard',
  subtitle,
  icon: Icon = Trophy,
  isLoading = false,
  showPodium = true,
  emptyMessage = 'No entries yet. Be the first!',
  variant = 'default',
  selectedLocation,
  onLocationChange,
  locationOptions,
  locationLabel,
}: ModernLeaderboardProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const isCompact = variant === 'compact';
  const LocationIcon = locationOptions.find(o => o.value === selectedLocation)?.icon || Globe;

  return (
    <GlassCard 
      variant="elevated" 
      className={cn(
        'overflow-hidden',
        isCompact && 'max-w-md mx-auto'
      )}
    >
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base md:text-lg truncate">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Location Selector */}
          <Select value={selectedLocation} onValueChange={(v) => onLocationChange(v as LocationType)}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 bg-background/50 border-white/10 hover:bg-background/70 transition-colors">
              <div className="flex items-center gap-2">
                <LocationIcon className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Select location">
                  {locationLabel || locationOptions.find(o => o.value === selectedLocation)?.label || 'Global'}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
              {locationOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.sublabel && (
                        <span className="text-[10px] text-muted-foreground">{option.sublabel}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current User Rank Banner */}
        {currentUserRank && currentUserRank.rank > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary text-lg">#{currentUserRank.rank}</span>
              <span className="text-xs text-muted-foreground">of {currentUserRank.total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('p-4 md:p-5', isCompact && 'p-3')}>
        {isLoading ? (
          <div className="space-y-3">
            {/* Podium skeleton */}
            {showPodium && !isCompact && (
              <div className="flex items-end justify-center gap-6 py-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
            )}
            {/* Row skeletons */}
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            {showPodium && !isCompact && top3.length > 0 && (
              <>
                <LeaderboardPodium entries={entries} currentUserId={currentUserId} />
                {rest.length > 0 && (
                  <SectionDivider className="my-4" />
                )}
              </>
            )}

            {/* Remaining rows or all rows for compact */}
            <div className="space-y-2">
              {(isCompact ? entries : rest).map((entry, index) => (
                <LeaderboardRankRow
                  key={entry.client_id}
                  entry={entry}
                  currentUserId={currentUserId}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
