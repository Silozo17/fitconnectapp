import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, Loader2, Users } from "lucide-react";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachCard from "@/components/coaches/CoachCard";
import CoachFilters from "@/components/coaches/CoachFilters";
import BookSessionModal from "@/components/booking/BookSessionModal";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { BestMatchToggle } from "@/components/coaches/BestMatchToggle";
import { useCoachMarketplace, type MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useLocationFromRoute } from "@/hooks/useLocationFromRoute";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useTranslation } from "@/hooks/useTranslation";
import { LocationData } from "@/types/ranking";

const Coaches = () => {
  const { t } = useTranslation('coaches');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number } | undefined>();
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [qualifiedOnly, setQualifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  // "Best match" ranking toggle - OFF by default
  const [useRanking, setUseRanking] = useState(false);
  const [isActivatingRanking, setIsActivatingRanking] = useState(false);

  // Location filter state
  const [manualLocation, setManualLocation] = useState<LocationData | null>(null);
  
  // User location for ranking (GPS or IP-based)
  const { 
    location: userLocation, 
    isRequestingPrecise,
    requestPreciseLocation,
    accuracyLevel,
  } = useUserLocation();

  // Modal state
  const [bookingCoach, setBookingCoach] = useState<MarketplaceCoach | null>(null);
  const [connectionCoach, setConnectionCoach] = useState<MarketplaceCoach | null>(null);

  // Get country from URL locale route - this is the source of truth
  const { locationCode } = useLocationFromRoute();

  // Determine effective country code: manual location overrides route
  const effectiveCountryCode = manualLocation?.countryCode || locationCode;

  // Determine ranking location (priority: manual > GPS/IP)
  // For ranking, we need city or lat/lng
  const rankingCity = manualLocation?.city || userLocation?.city || undefined;
  const rankingRegion = manualLocation?.region || userLocation?.region || undefined;
  const rankingLat = manualLocation?.lat ?? userLocation?.lat ?? undefined;
  const rankingLng = manualLocation?.lng ?? userLocation?.lng ?? undefined;

  // Check if we have sufficient location for ranking
  const hasLocationForRanking = !!(rankingCity || (rankingLat && rankingLng));

  // Compute display location for the toggle
  const rankingLocationDisplay = rankingCity 
    ? `${rankingCity}${userLocation?.country ? `, ${userLocation.country}` : ''}`
    : userLocation?.country || null;

  // Fetch coaches with ALL filters wired to SQL
  const { data: coaches, isLoading, error } = useCoachMarketplace({
    countryCode: effectiveCountryCode,
    // Location filters (from Google Places API for filtering)
    userCity: manualLocation?.city || undefined,
    userRegion: manualLocation?.region || undefined,
    // For ranking - include GPS location if available
    userLat: useRanking ? rankingLat : undefined,
    userLng: useRanking ? rankingLng : undefined,
    // Speciality filters
    coachTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    // Price filters
    priceRange: priceRange,
    // Availability filters
    onlineOnly: onlineOnly,
    inPersonOnly: inPersonOnly,
    // Badge filters
    verifiedOnly: verifiedOnly,
    qualifiedOnly: qualifiedOnly,
    // Rating filter
    minRating: minRating,
    // ⚠️ RANKING: Only enabled when user explicitly opts in AND has location
    useRanking: useRanking && hasLocationForRanking,
  });

  const handleLocationSelect = useCallback((location: LocationData) => {
    setManualLocation(location);
  }, []);

  const handleClearLocation = useCallback(() => {
    setManualLocation(null);
  }, []);

  /**
   * Handle "Best match" toggle
   * When enabled: Request precise location if not already available
   * When disabled: Return to stable ordering
   */
  const handleBestMatchToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      // Enable ranking
      setUseRanking(true);
      
      // If we don't have precise location, request it
      if (!hasLocationForRanking && accuracyLevel !== 'precise' && accuracyLevel !== 'manual') {
        setIsActivatingRanking(true);
        const success = await requestPreciseLocation();
        setIsActivatingRanking(false);
        
        // If GPS denied and no location available, still keep ranking enabled
        // It will use IP-based location or manual location if available
        if (!success) {
          console.log('[BestMatch] GPS denied, using available location data');
        }
      }
    } else {
      // Disable ranking - immediately return to stable order
      setUseRanking(false);
    }
  }, [hasLocationForRanking, accuracyLevel, requestPreciseLocation]);

  const handleBook = useCallback((coach: MarketplaceCoach) => {
    setBookingCoach(coach);
  }, []);

  const handleRequestConnection = useCallback((coach: MarketplaceCoach) => {
    setConnectionCoach(coach);
  }, []);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Find Coaches", url: "/coaches" }
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Find Personal Trainers & Fitness Coaches",
    "description": "Browse verified personal trainers, nutritionists, boxing and MMA coaches across the UK. Book online or in-person sessions.",
    "url": "https://getfitconnect.co.uk/coaches",
    "provider": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "serviceType": ["Personal Training", "Nutrition Coaching", "Boxing Training", "MMA Training"],
    "priceRange": "£40-£100"
  };

  // Get country display name
  const countryDisplay = effectiveCountryCode
    ? effectiveCountryCode.toUpperCase() === 'GB'
      ? 'United Kingdom'
      : effectiveCountryCode.toUpperCase() === 'PL'
        ? 'Poland'
        : effectiveCountryCode.toUpperCase()
    : null;

  return (
    <>
      <SEOHead
        title="Personal Trainers Near Me | Browse UK Coaches"
        description="Browse verified personal trainers, nutritionists and boxing coaches. Filter by location, price and speciality. Book online or in-person sessions today."
        canonicalPath="/coaches"
        keywords={["personal trainer near me", "find fitness coach UK", "book personal trainer", "hire PT", "online fitness coach", "local personal trainers"]}
        schema={[breadcrumbSchema, serviceSchema]}
        noIndex={isLoading}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('header.title')} <span className="gradient-text">{t('header.titleHighlight')}</span>
              </h1>
              <p className="text-muted-foreground mb-6">
                {manualLocation?.city 
                  ? `Showing coaches in ${manualLocation.city}${manualLocation.country ? `, ${manualLocation.country}` : ''}`
                  : countryDisplay 
                    ? `Showing coaches in ${countryDisplay}` 
                    : t('header.subtitle')
                }
              </p>

              {/* Search Bar */}
              <div className="flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background/80 backdrop-blur-sm"
                  />
                </div>
                {/* Desktop Filter Toggle */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden md:flex h-12"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  {t('search.filters')}
                </Button>

                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="md:hidden h-12">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <SheetHeader className="p-4 border-b border-border shrink-0">
                      <SheetTitle>{t('filters.title')}</SheetTitle>
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
                        // Rating filter
                        minRating={minRating}
                        onMinRatingChange={setMinRating}
                        // Location filter props
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
                    // Rating filter
                    minRating={minRating}
                    onMinRatingChange={setMinRating}
                    // Location filter props
                    autoLocation={null}
                    manualLocation={manualLocation}
                    onLocationSelect={handleLocationSelect}
                    onClearLocation={handleClearLocation}
                  />
                </aside>
              )}

              {/* Coaches Grid */}
              <div className="flex-1">
                {/* Best Match Toggle - Above results */}
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
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <p>{t('results.loadFailed')}</p>
                  </div>
                ) : coaches && coaches.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>
                        {t('results.showing')} <strong className="text-foreground">{coaches.length}</strong> {coaches.length !== 1 ? t('results.coaches') : t('results.coach')}
                        {useRanking && hasLocationForRanking && (
                          <span className="text-primary ml-1">• Sorted by relevance</span>
                        )}
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
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                      {t('results.noCoaches')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('results.noCoachesDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
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
    </>
  );
};

export default Coaches;
