import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/shared/SEOHead";
import { Trophy, Globe, MapPin, Search, Users, ChevronRight, Filter, Medal, Award, Flag, Building2, Sparkles, Lock, Crown, Target, Flame, Dumbbell, BarChart3, Camera, Utensils, Zap } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  usePaginatedLeaderboard, 
  useLocationOptions, 
  PublicLeaderboardEntry 
} from "@/hooks/usePublicLeaderboard";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useCountry } from "@/hooks/useCountry";
import { getCountryNameFromCode } from "@/lib/location-utils";
import { useAvatars, getAvatarImageUrl } from "@/hooks/useAvatars";
import { getUnlockDescription } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ScopeType = 'global' | 'country' | 'county' | 'city';

// Rarity order for sorting
const RARITY_ORDER: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

const sortByRarity = (a: any, b: any) => 
  (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0);

// SVG icon component based on unlock type
const UnlockIcon = ({ type, className = "h-5 w-5 text-white" }: { type: string | null; className?: string }) => {
  if (!type) return null;
  
  const iconMap: Record<string, React.ReactNode> = {
    workout_count: <Dumbbell className={className} />,
    habit_streak: <Flame className={className} />,
    progress_entries: <BarChart3 className={className} />,
    progress_photos: <Camera className={className} />,
    macro_days: <Utensils className={className} />,
    xp_total: <Zap className={className} />,
    challenges_completed: <Target className={className} />,
    leaderboard_rank: <Trophy className={className} />,
  };
  
  return iconMap[type] || null;
};

// Leaderboard Components
function LeaderboardRow({ entry, t }: { entry: PublicLeaderboardEntry; t: any }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">{rank}</span>;
  };

  const location = [entry.city, entry.county, entry.country].filter(Boolean).join(', ');

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-16 text-center">{getRankDisplay(entry.rank)}</TableCell>
      <TableCell><span className="font-semibold text-foreground">{entry.displayName}</span></TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {location || t('community.leaderboard.unknown')}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{t('community.leaderboard.level')} {entry.level}</span>
      </TableCell>
      <TableCell className="text-right font-bold text-primary">{entry.totalXp.toLocaleString()} XP</TableCell>
    </TableRow>
  );
}

function LeaderboardCard({ entry, t }: { entry: PublicLeaderboardEntry; t: any }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-muted-foreground font-bold text-lg">#{rank}</span>;
  };

  const location = [entry.city, entry.country].filter(Boolean).join(', ');

  return (
    <Card className="p-4 glass-card hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10">{getRankDisplay(entry.rank)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{entry.displayName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location || t('community.leaderboard.unknown')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{t('community.leaderboard.level')} {entry.level}</p>
          <p className="text-xs text-muted-foreground">{entry.totalXp.toLocaleString()} XP</p>
        </div>
      </div>
    </Card>
  );
}

// Avatar Card Component
function AvatarCard({ avatar, locked = false }: { avatar: any; locked?: boolean }) {
  const rarityColors = {
    common: { border: 'border-slate-500/30', bg: 'bg-slate-500/10', text: 'text-slate-400' },
    uncommon: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
    rare: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    epic: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    legendary: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  };
  
  const colors = rarityColors[avatar.rarity as keyof typeof rarityColors] || rarityColors.common;
  
  return (
    <Card className={cn("relative overflow-hidden transition-all hover:scale-105 group", colors.border, colors.bg)}>
      <div className="aspect-[3/4] p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <img
            src={avatar.image_url || getAvatarImageUrl(avatar.slug)}
            alt={avatar.name}
            className={cn("max-h-full w-auto object-contain transition-all duration-300", locked && "group-hover:opacity-40")}
          />
          {locked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-lg">
              <Lock className="h-6 w-6 text-white mb-2" />
              <UnlockIcon type={avatar.unlock_type} className="h-5 w-5 text-white mb-1" />
              <span className="text-white text-xs text-center px-2 font-medium">
                {getUnlockDescription(avatar.unlock_type, avatar.unlock_threshold)}
              </span>
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <h3 className="font-semibold text-sm">{avatar.name}</h3>
          <Badge variant="outline" className={cn("mt-1 text-xs capitalize", colors.text, colors.border)}>
            {avatar.rarity}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

export default function Community() {
  const { t } = useTranslation('pages');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'leaderboards';
  
  // Leaderboard state
  const [scope, setScope] = useState<ScopeType>('global');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { location: userLocation } = useUserLocation();
  const { countryCode } = useCountry();
  
  // Derive country name from the selected countryCode (source of truth)
  const effectiveCountry = getCountryNameFromCode(countryCode) || userLocation?.country;

  useEffect(() => {
    if (effectiveCountry && !selectedCountry) {
      setSelectedCountry(effectiveCountry);
    }
  }, [effectiveCountry]);

  const { data: countries } = useLocationOptions('country');
  const { data: counties } = useLocationOptions('county');
  const { data: cities } = useLocationOptions('city');

  const getLocationValue = () => {
    switch (scope) {
      case 'country': return selectedCountry;
      case 'county': return selectedCounty;
      case 'city': return selectedCity;
      default: return null;
    }
  };

  const { data: leaderboardData, isLoading: leaderboardLoading } = usePaginatedLeaderboard(
    scope,
    getLocationValue(),
    perPage,
    page
  );

  useEffect(() => {
    setPage(1);
  }, [scope, selectedCountry, selectedCounty, selectedCity, perPage]);

  const filterOptions = (options: { value: string; label: string; count: number }[] | undefined) => {
    if (!options) return [];
    if (!searchQuery) return options;
    return options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const totalPages = Math.ceil((leaderboardData?.totalParticipants || 0) / perPage);

  const getScopeLabel = () => {
    switch (scope) {
      case 'country': return selectedCountry ? t('community.leaderboard.inLocation', { location: selectedCountry }) : t('community.leaderboard.byCountry');
      case 'county': return selectedCounty ? t('community.leaderboard.inLocation', { location: selectedCounty }) : t('community.leaderboard.byCounty');
      case 'city': return selectedCity ? t('community.leaderboard.inLocation', { location: selectedCity }) : t('community.leaderboard.byCity');
      default: return t('community.leaderboard.global');
    }
  };

  // Avatar data with memoized sorting
  const { data: avatars, isLoading: avatarsLoading } = useAvatars();
  const freeAvatars = useMemo(() => avatars?.filter(a => a.category === 'free').sort(sortByRarity) || [], [avatars]);
  const challengeAvatars = useMemo(() => avatars?.filter(a => a.category === 'challenge_unlock').sort(sortByRarity) || [], [avatars]);
  const coachAvatars = useMemo(() => avatars?.filter(a => a.category === 'coach_exclusive').sort(sortByRarity) || [], [avatars]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <>
      <SEOHead
        title={t('community.meta.title')}
        description={t('community.meta.description')}
        canonicalPath="/community"
        noIndex={leaderboardLoading || avatarsLoading}
      />

      <div className="min-h-screen bg-background relative">
        <Navbar />
        
        <DecorativeAvatar 
          avatarSlug="streetwear-gorilla-trainer" 
          position="bottom-right" 
          size="xl" 
          opacity={15}
          className="right-8 bottom-20 z-0"
        />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('community.hero.badge')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {t('community.hero.title')}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('community.hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('community.hero.description')}
              </p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="leaderboards" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  {t('community.tabs.leaderboards')}
                </TabsTrigger>
                <TabsTrigger value="avatars" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('community.tabs.avatars')}
                </TabsTrigger>
              </TabsList>

              {/* Leaderboards Tab */}
              <TabsContent value="leaderboards" className="space-y-6">
                {/* Filters */}
                <Card className="p-4 md:p-6 glass-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{t('community.leaderboard.filters')}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Select value={scope} onValueChange={(v) => setScope(v as ScopeType)}>
                      <SelectTrigger>
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder={t('community.leaderboard.scope')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global"><Globe className="h-4 w-4 inline mr-2" />{t('community.leaderboard.global')}</SelectItem>
                        <SelectItem value="country"><Flag className="h-4 w-4 inline mr-2" />{t('community.leaderboard.byCountry')}</SelectItem>
                        <SelectItem value="county"><MapPin className="h-4 w-4 inline mr-2" />{t('community.leaderboard.byCounty')}</SelectItem>
                        <SelectItem value="city"><Building2 className="h-4 w-4 inline mr-2" />{t('community.leaderboard.byCity')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {scope === 'country' && (
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger><SelectValue placeholder={t('community.leaderboard.selectCountry')} /></SelectTrigger>
                        <SelectContent>
                          {filterOptions(countries)?.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label} ({c.count})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {scope === 'county' && (
                      <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                        <SelectTrigger><SelectValue placeholder={t('community.leaderboard.selectCounty')} /></SelectTrigger>
                        <SelectContent>
                          {filterOptions(counties)?.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label} ({c.count})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {scope === 'city' && (
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger><SelectValue placeholder={t('community.leaderboard.selectCity')} /></SelectTrigger>
                        <SelectContent>
                          {filterOptions(cities)?.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label} ({c.count})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t('community.leaderboard.searchLocation')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>

                    <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">{t('community.leaderboard.perPage', { count: 10 })}</SelectItem>
                        <SelectItem value="25">{t('community.leaderboard.perPage', { count: 25 })}</SelectItem>
                        <SelectItem value="50">{t('community.leaderboard.perPage', { count: 50 })}</SelectItem>
                        <SelectItem value="100">{t('community.leaderboard.perPage', { count: 100 })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      <strong className="text-foreground">{leaderboardData?.totalParticipants.toLocaleString() || 0}</strong>{" "}
                      {t('community.leaderboard.participants')} {getScopeLabel()}
                    </span>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Card className="overflow-hidden border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-16 text-center">{t('community.leaderboard.table.rank')}</TableHead>
                          <TableHead>{t('community.leaderboard.table.name')}</TableHead>
                          <TableHead>{t('community.leaderboard.table.location')}</TableHead>
                          <TableHead className="text-center">{t('community.leaderboard.table.level')}</TableHead>
                          <TableHead className="text-right">XP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboardLoading ? (
                          Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                            </TableRow>
                          ))
                        ) : leaderboardData?.entries.length ? (
                          leaderboardData.entries.map((entry) => (
                            <LeaderboardRow key={`${entry.rank}-${entry.displayName}`} entry={entry} t={t} />
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                              {t('community.leaderboard.noResults')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {leaderboardLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))
                  ) : leaderboardData?.entries.length ? (
                    leaderboardData.entries.map((entry) => (
                      <LeaderboardCard key={`${entry.rank}-${entry.displayName}`} entry={entry} t={t} />
                    ))
                  ) : (
                    <Card className="p-8 text-center text-muted-foreground">
                      {t('community.leaderboard.noResults')}
                    </Card>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink onClick={() => setPage(pageNum)} isActive={page === pageNum} className="cursor-pointer">
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && page < totalPages - 2 && (
                        <>
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>

              {/* Avatars Tab */}
              <TabsContent value="avatars" className="space-y-8">
                {/* How to unlock section */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('community.avatars.unlock.challenges.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('community.avatars.unlock.challenges.description')}</p>
                      </div>
                    </div>
                  </Card>
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-accent/10">
                        <Target className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('community.avatars.unlock.milestones.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('community.avatars.unlock.milestones.description')}</p>
                      </div>
                    </div>
                  </Card>
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-orange-500/10">
                        <Flame className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('community.avatars.unlock.streaks.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('community.avatars.unlock.streaks.description')}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Avatar Sub-Tabs */}
                <Tabs defaultValue="all" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
                    <TabsTrigger value="all">{t('community.avatars.tabs.all')}</TabsTrigger>
                    <TabsTrigger value="free">{t('community.avatars.tabs.free')}</TabsTrigger>
                    <TabsTrigger value="challenge">{t('community.avatars.tabs.challenge')}</TabsTrigger>
                    <TabsTrigger value="coach">{t('community.avatars.tabs.coach')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    {avatarsLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {freeAvatars.length > 0 && (
                          <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              {t('community.avatars.categories.free')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {freeAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} />)}
                            </div>
                          </div>
                        )}
                        
                        {challengeAvatars.length > 0 && (
                          <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                              {t('community.avatars.categories.challenge')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {challengeAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} locked />)}
                            </div>
                          </div>
                        )}
                        
                        {coachAvatars.length > 0 && (
                          <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <Crown className="h-5 w-5 text-purple-500" />
                              {t('community.avatars.categories.coach')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {coachAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} locked />)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="free">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {freeAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} />)}
                    </div>
                  </TabsContent>

                  <TabsContent value="challenge">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {challengeAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} locked />)}
                    </div>
                  </TabsContent>

                  <TabsContent value="coach">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {coachAvatars.map(avatar => <AvatarCard key={avatar.id} avatar={avatar} locked />)}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="mt-10 p-6 md:p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2">{t('community.cta.title')}</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('community.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gap-2">
                    {t('community.cta.getStarted')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/coaches">
                  <Button size="lg" variant="outline" className="gap-2">
                    {t('community.cta.findCoach')}
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