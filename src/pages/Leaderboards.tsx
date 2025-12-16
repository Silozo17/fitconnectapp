import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Trophy, Globe, MapPin, Search, Users, ChevronRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  usePaginatedLeaderboard, 
  useLocationOptions, 
  PublicLeaderboardEntry 
} from "@/hooks/usePublicLeaderboard";
import { useUserLocation } from "@/hooks/useUserLocation";
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

function LeaderboardRow({ entry }: { entry: PublicLeaderboardEntry }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-muted-foreground font-bold">{rank}</span>;
  };

  const location = [entry.city, entry.county, entry.country].filter(Boolean).join(', ');

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-16 text-center">
        {getRankDisplay(entry.rank)}
      </TableCell>
      <TableCell>
        <span className="font-semibold text-foreground">{entry.displayName}</span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {location || 'Unknown'}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Level {entry.level}
        </span>
      </TableCell>
      <TableCell className="text-right font-bold text-primary">
        {entry.totalXp.toLocaleString()} XP
      </TableCell>
    </TableRow>
  );
}

function LeaderboardCard({ entry }: { entry: PublicLeaderboardEntry }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-muted-foreground font-bold text-lg">#{rank}</span>;
  };

  const location = [entry.city, entry.country].filter(Boolean).join(', ');

  return (
    <Card className="p-4 bg-card/80 border-border/50 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10">
          {getRankDisplay(entry.rank)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{entry.displayName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location || 'Unknown'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">Level {entry.level}</p>
          <p className="text-xs text-muted-foreground">{entry.totalXp.toLocaleString()} XP</p>
        </div>
      </div>
    </Card>
  );
}

export default function Leaderboards() {
  const [scope, setScope] = useState<ScopeType>('global');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { city, region, country } = useUserLocation();

  // Auto-set location when detected
  useEffect(() => {
    if (country && !selectedCountry) {
      setSelectedCountry(country);
    }
  }, [country]);

  // Fetch location options
  const { data: countries } = useLocationOptions('country');
  const { data: counties } = useLocationOptions('county');
  const { data: cities } = useLocationOptions('city');

  // Determine location value based on scope
  const getLocationValue = () => {
    switch (scope) {
      case 'country': return selectedCountry;
      case 'county': return selectedCounty;
      case 'city': return selectedCity;
      default: return null;
    }
  };

  const { data, isLoading } = usePaginatedLeaderboard(
    scope,
    getLocationValue(),
    perPage,
    page
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [scope, selectedCountry, selectedCounty, selectedCity, perPage]);

  // Filter options based on search
  const filterOptions = (options: { value: string; label: string; count: number }[] | undefined) => {
    if (!options) return [];
    if (!searchQuery) return options;
    return options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const totalPages = Math.ceil((data?.totalParticipants || 0) / perPage);

  const getScopeLabel = () => {
    switch (scope) {
      case 'country': return selectedCountry ? `in ${selectedCountry}` : 'by Country';
      case 'county': return selectedCounty ? `in ${selectedCounty}` : 'by County';
      case 'city': return selectedCity ? `in ${selectedCity}` : 'by City';
      default: return 'Global';
    }
  };

  return (
    <>
      <Helmet>
        <title>Fitness Leaderboards | FitConnect Community Rankings</title>
        <meta name="description" content="See who's leading the fitness community. Join thousands competing to be their best on FitConnect." />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <Navbar />
        
        {/* Decorative Avatar */}
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
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Community Leaderboards</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Track Progress &{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Compete
                </span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how you stack up against fitness enthusiasts worldwide. Filter by location to find competitors near you.
              </p>
            </div>

            {/* Filters */}
            <Card className="p-4 md:p-6 mb-6 bg-card/80 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Filters</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Scope Selector */}
                <Select value={scope} onValueChange={(v) => setScope(v as ScopeType)}>
                  <SelectTrigger>
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">🌍 Global</SelectItem>
                    <SelectItem value="country">🏳️ By Country</SelectItem>
                    <SelectItem value="county">📍 By County</SelectItem>
                    <SelectItem value="city">🏙️ By City</SelectItem>
                  </SelectContent>
                </Select>

                {/* Country Selector */}
                {scope === 'country' && (
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions(countries)?.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* County Selector */}
                {scope === 'county' && (
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions(counties)?.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* City Selector */}
                {scope === 'city' && (
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions(cities)?.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Search */}
                <div className="relative col-span-2 md:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Per Page */}
                <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">{data?.totalParticipants.toLocaleString() || 0}</strong>{" "}
                  participants {getScopeLabel()}
                </span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Card className="overflow-hidden border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16 text-center">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Level</TableHead>
                      <TableHead className="text-right">XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-12 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : data?.entries.length ? (
                      data.entries.map((entry) => (
                        <LeaderboardRow key={`${entry.rank}-${entry.displayName}`} entry={entry} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No participants found for this filter
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))
              ) : data?.entries.length ? (
                data.entries.map((entry) => (
                  <LeaderboardCard key={`${entry.rank}-${entry.displayName}`} entry={entry} />
                ))
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  No participants found for this filter
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
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
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
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
              </div>
            )}

            {/* CTA */}
            <Card className="mt-10 p-6 md:p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center">
              <Trophy className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2">Want to Compete?</h2>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Join FitConnect for FREE and start earning XP by working with coaches, completing workouts, and building healthy habits!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                    Sign Up Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="gap-2">
                    Learn How XP Works
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                🔒 Privacy first: Only appear on leaderboards if you choose to opt-in
              </p>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}