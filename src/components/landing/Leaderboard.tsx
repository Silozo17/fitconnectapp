import { useState, useEffect } from "react";
import { Trophy, MapPin, Globe, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalLeaderboard, useLocalLeaderboard, PublicLeaderboardEntry } from "@/hooks/usePublicLeaderboard";
import { getLevelTitle } from "@/hooks/useGamification";
import { Link } from "react-router-dom";

const LOCATION_CACHE_KEY = 'fitconnect_user_location';

interface CachedLocation {
  city: string;
  country: string;
  timestamp: number;
}

function LeaderboardEntry({ entry, index }: { entry: PublicLeaderboardEntry; index: number }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-muted-foreground font-medium w-8 text-center">{rank}</span>;
  };

  const location = entry.city || entry.country || 'Unknown';

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-center w-10">
        {getRankDisplay(entry.rank)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">
          {entry.displayName}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {location}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-primary">
          Level {entry.level}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.totalXp.toLocaleString()} XP
        </p>
      </div>
    </div>
  );
}

function LeaderboardColumn({ 
  title, 
  icon: Icon, 
  entries, 
  isLoading, 
  totalParticipants 
}: { 
  title: string; 
  icon: typeof Globe; 
  entries: PublicLeaderboardEntry[];
  isLoading: boolean;
  totalParticipants: number;
}) {
  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))
        ) : entries.length > 0 ? (
          entries.map((entry, index) => (
            <LeaderboardEntry key={`${entry.displayName}-${index}`} entry={entry} index={index} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No participants yet
          </p>
        )}
      </div>

      {totalParticipants > 5 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          + {(totalParticipants - 5).toLocaleString()} more competing
        </p>
      )}
    </Card>
  );
}

export default function Leaderboard() {
  const [userLocation, setUserLocation] = useState<CachedLocation | null>(null);
  
  const { data: globalData, isLoading: globalLoading } = useGlobalLeaderboard(5);
  const { data: localData, isLoading: localLoading } = useLocalLeaderboard(
    'city',
    userLocation?.city || null,
    5
  );

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const parsed: CachedLocation = JSON.parse(cached);
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp < weekInMs) {
        setUserLocation(parsed);
        return;
      }
    }

    // Fetch location
    fetch('https://ip-api.com/json/?fields=city,country')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          const location: CachedLocation = {
            city: data.city,
            country: data.country,
            timestamp: Date.now(),
          };
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
          setUserLocation(location);
        }
      })
      .catch(() => {
        // Silently fail - global leaderboard will still work
      });
  }, []);

  const hasParticipants = (globalData?.totalParticipants || 0) > 0;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Community Leaderboard</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Thousands{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Competing
            </span>{" "}
            to Be Their Best
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your progress, earn XP, and compete with fitness enthusiasts in your area and around the world.
          </p>
        </div>

        {/* Stats */}
        {hasParticipants && (
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{globalData?.totalParticipants.toLocaleString()}</span>
              <span>active competitors</span>
            </div>
          </div>
        )}

        {/* Leaderboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <LeaderboardColumn
            title="Top Globally"
            icon={Globe}
            entries={globalData?.entries || []}
            isLoading={globalLoading}
            totalParticipants={globalData?.totalParticipants || 0}
          />
          <LeaderboardColumn
            title={userLocation?.city ? `Near You (${userLocation.city})` : "Near You"}
            icon={MapPin}
            entries={localData?.entries || []}
            isLoading={localLoading || !userLocation}
            totalParticipants={localData?.totalParticipants || 0}
          />
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link to="/leaderboards">
            <Button size="lg" variant="outline" className="gap-2">
              View Full Leaderboards
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Link to="/auth?tab=signup">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                <Trophy className="h-5 w-5" />
                Join the Competition - It's Free
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            🔒 Your privacy is protected. Only appear on leaderboards if you choose to.
          </p>
        </div>
      </div>
    </section>
  );
}
