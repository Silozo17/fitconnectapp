import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, Users, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import CoachCard from "@/components/coaches/CoachCard";
import CoachFilters from "@/components/coaches/CoachFilters";
import BookSessionModal from "@/components/booking/BookSessionModal";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { BestMatchToggle } from "@/components/coaches/BestMatchToggle";
import { useCoachMarketplace, type MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useCountry } from "@/hooks/useCountry";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { useUserLocation } from "@/hooks/useUserLocation";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { CoachCardSkeleton } from "@/components/dashboard/CoachCardSkeleton";
import type { UserLocationData } from "@/types/location";

const ClientFindCoaches = () => {
  const { t } = useTranslation("client");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | undefined>();
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [qualifiedOnly, setQualifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  // Best match ranking toggle - OFF by default
  const [useRanking, setUseRanking] = useState(false);
  const [isActivatingRanking, setIsActivatingRanking] = useState(false);

  // Manual location filter state (for city selection)
  const [manualLocation, setManualLocation] = useState<UserLocationData | null>(null);

  // Modal state
  const [bookingCoach, setBookingCoach] = useState<MarketplaceCoach | null>(null);
  const [connectionCoach, setConnectionCoach] = useState<MarketplaceCoach | null>(null);

  // Get country from context (geo-detection fallback)
  const { countryCode: contextCountryCode } = useCountry();

  // Get user's saved location preference from DB (for authenticated users)
  const { countryPreference: userCountryPreference } = useUserLocalePreference();

  // User location hook for GPS/IP detection
  const { 
    location: userLocation, 
    isRequestingPrecise,
    requestPreciseLocation,
    accuracyLevel,
  } = useUserLocation();

  /**
   * Effective country code priority:
   * 1. Manual location selection (city picker)
   * 2. User's saved preference in DB (from dashboard settings)
   * 3. Context country (geo-detection fallback)
   */
  const effectiveCountryCode = manualLocation?.countryCode || userCountryPreference || contextCountryCode;

  // Ranking location variables - manual location takes precedence
  const rankingCity = manualLocation?.city || userLocation?.city || undefined;
  const rankingRegion = manualLocation?.region || userLocation?.region || undefined;
  const rankingLat = manualLocation?.lat ?? userLocation?.lat ?? undefined;
  const rankingLng = manualLocation?.lng ?? userLocation?.lng ?? undefined;

  const hasLocationForRanking = !!(rankingCity || (rankingLat && rankingLng));

  const rankingLocationDisplay = rankingCity 
    ? `${rankingCity}${userLocation?.country ? `, ${userLocation.country}` : ''}`
    : userLocation?.country || null;

  // Fetch coaches with location-aware filtering and ranking
  const { data: coaches, isLoading, error } = useCoachMarketplace({
    search: searchQuery || undefined,
    countryCode: effectiveCountryCode,
    // Location filters - pass city/region for filtering
    userCity: manualLocation?.city || undefined,
    userRegion: manualLocation?.region || undefined,
    // GPS coords only used when ranking is enabled
    userLat: useRanking ? rankingLat : undefined,
    userLng: useRanking ? rankingLng : undefined,
    // Type and availability filters
    coachTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    priceRange,
    onlineOnly,
    inPersonOnly,
    verifiedOnly,
    qualifiedOnly,
    minRating,
    // Enable ranking when toggle is on AND we have location
    useRanking: useRanking && hasLocationForRanking,
  });

  const handleBook = useCallback((coach: MarketplaceCoach) => {
    setBookingCoach(coach);
  }, []);

  const handleRequestConnection = useCallback((coach: MarketplaceCoach) => {
    setConnectionCoach(coach);
  }, []);

  // Location filter handlers
  const handleLocationSelect = useCallback((location: UserLocationData) => {
    setManualLocation(location);
  }, []);

  const handleClearLocation = useCallback(() => {
    setManualLocation(null);
  }, []);

  // Best match toggle handler
  const handleBestMatchToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      setUseRanking(true);
      // Request precise location if we don't have one yet
      if (!hasLocationForRanking && accuracyLevel !== 'precise' && accuracyLevel !== 'manual') {
        setIsActivatingRanking(true);
        await requestPreciseLocation();
        setIsActivatingRanking(false);
      }
    } else {
      setUseRanking(false);
    }
  }, [hasLocationForRanking, accuracyLevel, requestPreciseLocation]);

  // Get country display name
  const countryDisplay = effectiveCountryCode
    ? effectiveCountryCode.toUpperCase() === 'GB'
      ? 'United Kingdom'
      : effectiveCountryCode.toUpperCase() === 'PL'
        ? 'Poland'
        : effectiveCountryCode.toUpperCase()
    : null;

  return (
    <ClientDashboardLayout
      title={t('findCoaches.title')}
      description={t('findCoaches.subtitle')}
    >
      <PageHelpBanner
        pageKey="client_find_coaches"
        title="Discover Coaches"
        description="Find fitness professionals that match your goals and preferences"
      />
      {/* Header */}
      <div className="mb-11">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Find <span className="gradient-text">Coaches</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t('findCoaches.description')}
            </p>
          </div>
          {countryDisplay && (
            <Badge variant="secondary" className="gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
              {countryDisplay}
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('findCoaches.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          {/* Desktop Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex h-11"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            {t('findCoaches.filters')}
          </Button>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden h-11">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
              <SheetHeader className="p-4 border-b border-border shrink-0">
                <SheetTitle>{t('findCoaches.filters')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <CoachFilters
                  variant="sheet"
                  selectedTypes={selectedTypes}
                  onTypesChange={setSelectedTypes}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  onlineOnly={onlineOnly}
                  onOnlineOnlyChange={setOnlineOnly}
                  inPersonOnly={inPersonOnly}
                  onInPersonOnlyChange={setInPersonOnly}
                  verifiedOnly={verifiedOnly}
                  onVerifiedOnlyChange={setVerifiedOnly}
                  qualifiedOnly={qualifiedOnly}
                  onQualifiedOnlyChange={setQualifiedOnly}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  autoLocation={null}
                  manualLocation={manualLocation}
                  onLocationSelect={handleLocationSelect}
                  onClearLocation={handleClearLocation}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 lg:gap-8">
        {/* Filters Sidebar - Desktop only */}
        {showFilters && (
          <aside className="hidden md:block w-64 flex-shrink-0">
            <CoachFilters
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onlineOnly={onlineOnly}
              onOnlineOnlyChange={setOnlineOnly}
              inPersonOnly={inPersonOnly}
              onInPersonOnlyChange={setInPersonOnly}
              verifiedOnly={verifiedOnly}
              onVerifiedOnlyChange={setVerifiedOnly}
              qualifiedOnly={qualifiedOnly}
              onQualifiedOnlyChange={setQualifiedOnly}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              autoLocation={null}
              manualLocation={manualLocation}
              onLocationSelect={handleLocationSelect}
              onClearLocation={handleClearLocation}
            />
          </aside>
        )}

        {/* Coaches Grid */}
        <div className="flex-1">
          {/* Best Match Toggle */}
          <div className="mb-4">
            <BestMatchToggle
              isEnabled={useRanking}
              onToggle={handleBestMatchToggle}
              isLoading={isActivatingRanking || isRequestingPrecise}
              hasLocation={hasLocationForRanking}
              locationDisplay={useRanking ? rankingLocationDisplay : null}
            />
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CoachCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>Failed to load coaches. Please try again.</p>
            </div>
          ) : coaches && coaches.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span>
                  Showing <strong className="text-foreground">{coaches.length}</strong> coach{coaches.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {coaches.map((coach) => (
                  <CoachCard 
                    key={coach.id} 
                    coach={coach}
                    onBook={handleBook}
                    onRequestConnection={handleRequestConnection}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">
                No coaches found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingCoach && (
        <BookSessionModal
          open={!!bookingCoach}
          onOpenChange={(open) => !open && setBookingCoach(null)}
          coach={{
            id: bookingCoach.id,
            display_name: bookingCoach.display_name || "Coach",
            booking_mode: bookingCoach.booking_mode,
          }}
        />
      )}

      {/* Connection Request Modal */}
      {connectionCoach && (
        <RequestConnectionModal
          open={!!connectionCoach}
          onOpenChange={(open) => !open && setConnectionCoach(null)}
          coach={connectionCoach}
        />
      )}
    </ClientDashboardLayout>
  );
};

export default ClientFindCoaches;
