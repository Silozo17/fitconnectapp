import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Loader2, Users, MapPin, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CoachCard from "@/components/coaches/CoachCard";
import CoachFilters from "@/components/coaches/CoachFilters";
import BookSessionModal from "@/components/booking/BookSessionModal";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { useCoachMarketplace, type MarketplaceCoach, type LocationFilter } from "@/hooks/useCoachMarketplace";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const Coaches = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | undefined>();
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(true);

  // Modal state
  const [bookingCoach, setBookingCoach] = useState<MarketplaceCoach | null>(null);
  const [connectionCoach, setConnectionCoach] = useState<MarketplaceCoach | null>(null);

  // Cookie consent and location
  const { hasCategory } = useCookieConsent();
  const canUseLocation = hasCategory("functional");
  
  // Only detect location if functional cookies are allowed
  const { city, region, country, county, isLoading: locationLoading, getLocationLabel } = useUserLocation(!canUseLocation);
  
  // Build location filter from detected location
  const locationFilter: LocationFilter | undefined = useMemo(() => {
    if (!canUseLocation || !locationFilterEnabled) return undefined;
    if (!city && !region && !country) return undefined;
    
    return {
      city: city || undefined,
      region: region || undefined,
      country: country || undefined,
      county: county || undefined,
    };
  }, [canUseLocation, locationFilterEnabled, city, region, country, county]);

  const locationLabel = getLocationLabel();

  const { data: coaches, isLoading, error } = useCoachMarketplace({
    search: searchQuery || undefined,
    coachTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    priceRange,
    onlineOnly,
    inPersonOnly,
    locationFilter: locationFilter,
    enableLocationMatching: locationFilterEnabled && canUseLocation,
  });

  const handleBook = (coach: MarketplaceCoach) => {
    setBookingCoach(coach);
  };

  const handleRequestConnection = (coach: MarketplaceCoach) => {
    setConnectionCoach(coach);
  };

  const handleClearLocationFilter = () => {
    setLocationFilterEnabled(false);
  };

  const handleEnableLocationFilter = () => {
    setLocationFilterEnabled(true);
  };

  // Count local coaches (score >= 80 means city or region match)
  const localCoachesCount = useMemo(() => {
    if (!coaches || !locationFilter) return 0;
    return coaches.filter(c => (c.location_score ?? 0) >= 80).length;
  }, [coaches, locationFilter]);

  return (
    <>
      <Helmet>
        <title>Find Fitness Coaches | Personal Trainers, Nutritionists & Combat Sports | FitConnect</title>
        <meta 
          name="description" 
          content="Browse and connect with verified fitness coaches near you. Filter by specialty, location, price, and session type to find your perfect match." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Find Your <span className="gradient-text">Perfect Coach</span>
              </h1>
              <p className="text-muted-foreground mb-6">
                Browse our verified fitness professionals and start your transformation today.
              </p>

              {/* Location Indicator */}
              {canUseLocation && !locationLoading && locationLabel && (
                <div className="flex items-center gap-2 mb-4">
                  {locationFilterEnabled ? (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1.5 py-1.5 px-3 text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>
                        Showing coaches near <strong>{locationLabel}</strong>
                        {localCoachesCount > 0 && (
                          <span className="text-muted-foreground ml-1">
                            ({localCoachesCount} local)
                          </span>
                        )}
                      </span>
                      <button 
                        onClick={handleClearLocationFilter}
                        className="ml-1 hover:text-destructive transition-colors"
                        aria-label="Clear location filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEnableLocationFilter}
                      className="flex items-center gap-1.5"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Show coaches near {locationLabel}
                    </Button>
                  )}
                </div>
              )}

              {/* Search Bar */}
              <div className="flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, specialty, or location..."
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
                  Filters
                </Button>

                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="lg" className="md:hidden h-12">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                    <SheetHeader className="p-4 border-b border-border">
                      <SheetTitle>Filters</SheetTitle>
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
                  />
                </aside>
              )}

              {/* Coaches Grid */}
              <div className="flex-1">
                {isLoading || (canUseLocation && locationLoading) ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        {locationFilterEnabled && localCoachesCount > 0 && localCoachesCount < coaches.length && (
                          <span className="text-primary ml-1">
                            • {localCoachesCount} in your area
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                      No coaches found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {locationFilterEnabled && locationLabel 
                        ? `No coaches found near ${locationLabel}. Try searching a different location.`
                        : "Try adjusting your filters to see more results."
                      }
                    </p>
                    {locationFilterEnabled && (
                      <Button variant="outline" onClick={handleClearLocationFilter}>
                        Show all coaches
                      </Button>
                    )}
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
