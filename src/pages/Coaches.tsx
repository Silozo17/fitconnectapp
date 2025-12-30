import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, Loader2, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachCard from "@/components/coaches/CoachCard";
import CoachFilters from "@/components/coaches/CoachFilters";
import BookSessionModal from "@/components/booking/BookSessionModal";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { useCoachMarketplace, type MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMarketplaceLocationFilter } from "@/hooks/useMarketplaceLocationFilter";
import { useLocationFromRoute } from "@/hooks/useLocationFromRoute";
import { useTranslation } from "@/hooks/useTranslation";

const Coaches = () => {
  const { t } = useTranslation('coaches');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | undefined>();
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);

  // Modal state
  const [bookingCoach, setBookingCoach] = useState<MarketplaceCoach | null>(null);
  const [connectionCoach, setConnectionCoach] = useState<MarketplaceCoach | null>(null);

  // Get auto-detected user location for proximity ranking
  const { location: autoLocation, isLoading: autoLocationLoading } = useUserLocation();

  // Manual location filter (persisted for session)
  const {
    manualLocation,
    manualCountryCode,
    isManualSelection,
    setManualLocation,
    clearManualLocation,
  } = useMarketplaceLocationFilter();

  // Determine effective location for proximity ranking (manual overrides auto)
  const effectiveLocation = isManualSelection
    ? manualLocation
    : autoLocationLoading
      ? null
      : autoLocation;

  // Get country from URL locale route - this is the default source of truth
  // URL: /en-gb/coaches → locationCode: 'gb' → shows UK coaches
  // URL: /pl-gb/coaches → locationCode: 'gb' → shows UK coaches (Polish UI)
  // URL: /pl-pl/coaches → locationCode: 'pl' → shows Polish coaches
  const { locationCode } = useLocationFromRoute();

  /**
   * Effective country code priority:
   * 1. Manual selection from marketplace filter (user explicitly chose via city/location picker)
   * 2. URL locale (e.g., /en-pl/coaches means show Polish coaches)
   * 
   * This ensures manual location selection ALWAYS overrides URL locale for filtering.
   */
  const effectiveCountryCode = manualCountryCode ?? locationCode;

  const { data: coaches, isLoading, error } = useCoachMarketplace({
    search: searchQuery || undefined,
    coachTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    priceRange,
    onlineOnly,
    inPersonOnly,
    userLocation: effectiveLocation,
    enableLocationRanking: true,
    countryCode: effectiveCountryCode,
  });

  const handleBook = useCallback((coach: MarketplaceCoach) => {
    setBookingCoach(coach);
  }, []);

  const handleRequestConnection = useCallback((coach: MarketplaceCoach) => {
    setConnectionCoach(coach);
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('title')} | FitConnect</title>
        <meta 
          name="description" 
          content={t('seoDescription')} 
        />
      </Helmet>

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
                {t('header.subtitle')}
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
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <SheetHeader className="p-4 border-b border-border">
                      <SheetTitle>{t('filters.title')}</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                      <CoachFilters
                        selectedTypes={selectedTypes}
                        onTypesChange={setSelectedTypes}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        onlineOnly={onlineOnly}
                        onOnlineOnlyChange={setOnlineOnly}
                        inPersonOnly={inPersonOnly}
                        onInPersonOnlyChange={setInPersonOnly}
                        autoLocation={autoLocation}
                        manualLocation={manualLocation}
                        isAutoLocationLoading={autoLocationLoading}
                        onLocationSelect={setManualLocation}
                        onClearLocation={clearManualLocation}
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
                    autoLocation={autoLocation}
                    manualLocation={manualLocation}
                    isAutoLocationLoading={autoLocationLoading}
                    onLocationSelect={setManualLocation}
                    onClearLocation={clearManualLocation}
                  />
                </aside>
              )}

              {/* Coaches Grid */}
              <div className="flex-1">
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
