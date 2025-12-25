import { useState } from 'react';
import { cn } from '@/lib/utils';
import { XPLeaderboardEntry } from '@/hooks/useGamification';
import { LeaderboardPodium } from './LeaderboardPodium';
import { LeaderboardRankRow } from './LeaderboardRankRow';
import { 
  Trophy, 
  ChevronDown,
  Users,
  LucideIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type LocationType = 'global' | 'country' | 'county' | 'city';

export interface LocationOption {
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
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'challenge';
  selectedLocation: LocationType;
  onLocationChange: (location: LocationType) => void;
  locationOptions: LocationOption[];
  locationLabel: string;
  emptyMessage?: string;
}

export function ModernLeaderboard({
  entries,
  currentUserId,
  currentUserRank,
  title = 'Leaderboard',
  subtitle,
  isLoading = false,
  variant = 'default',
  selectedLocation,
  onLocationChange,
  locationOptions,
  locationLabel,
  emptyMessage = 'No entries yet'
}: ModernLeaderboardProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const selectedOption = locationOptions.find(o => o.value === selectedLocation);
  const LocationIcon = selectedOption?.icon || Trophy;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6">
      {/* Header with location selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Location Dropdown */}
        <DropdownMenu open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-9 px-3 bg-transparent border-border/50"
            >
              <LocationIcon className="h-4 w-4" />
              <span className="max-w-[80px] truncate">{locationLabel}</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isLocationOpen && "rotate-180"
              )} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {locationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => !option.disabled && onLocationChange(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    "flex items-center gap-2",
                    selectedLocation === option.value && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-[10px] text-muted-foreground">{option.sublabel}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Your Rank Banner - simple inline, no card */}
      {currentUserRank && (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">You Currently Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">#{currentUserRank.rank}</span>
            <span className="text-xs text-muted-foreground">of {currentUserRank.total}</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 - only in default variant */}
          {variant !== 'compact' && top3.length > 0 && (
            <LeaderboardPodium entries={top3} currentUserId={currentUserId} />
          )}

          {/* List for remaining entries */}
          {(variant === 'compact' ? entries : rest).length > 0 && (
            <div className="space-y-0">
              {(variant === 'compact' ? entries : rest).map((entry, idx) => (
                <LeaderboardRankRow
                  key={entry.client_id}
                  entry={entry}
                  currentUserId={currentUserId}
                  index={idx}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
