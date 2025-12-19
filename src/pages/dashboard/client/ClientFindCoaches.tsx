import { useState } from "react";
import { Search, SlidersHorizontal, Loader2, Users, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import CoachCard from "@/components/coaches/CoachCard";
import CoachFilters from "@/components/coaches/CoachFilters";
import BookSessionModal from "@/components/booking/BookSessionModal";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { useCoachMarketplace, type MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMarketplaceLocationFilter } from "@/hooks/useMarketplaceLocationFilter";

const ClientFindCoaches = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | undefined>();
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [inPersonOnly, setInPersonOnly] = useState(false);

  // Modal state
  const [bookingCoach, setBookingCoach] = useState<MarketplaceCoach | null>(null);
  const [connectionCoach, setConnectionCoach] = useState<MarketplaceCoach | null>(null);

  // Get auto-detected user location
  const autoLocation = useUserLocation();

  // Manual location filter (persisted for session)
  const {
    manualLocation,
    isManualSelection,
    setManualLocation,
    clearManualLocation,
  } = useMarketplaceLocationFilter();

  // Determine effective location (manual overrides auto)
  const effectiveLocation = isManualSelection
    ? manualLocation
    : autoLocation.isLoading
      ? null
      : {
          city: autoLocation.city,
          region: autoLocation.region,
          county: autoLocation.county,
          country: autoLocation.country,
        };

  const { data: coaches, isLoading, error } = useCoachMarketplace({
    search: searchQuery || undefined,
    coachTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
    priceRange,
    onlineOnly,
    inPersonOnly,
    userLocation: effectiveLocation,
    enableLocationRanking: true,
  });

  const handleBook = (coach: MarketplaceCoach) => {
    setBookingCoach(coach);
  };

  const handleRequestConnection = (coach: MarketplaceCoach) => {
    setConnectionCoach(coach);
  };

  // Get display location name
  const locationDisplay = effectiveLocation?.city || effectiveLocation?.region || effectiveLocation?.country;

  return (
    <ClientDashboardLayout
      title="Find Coaches"
      description="Browse and connect with verified fitness coaches"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Coaches</h1>
            <p className="text-muted-foreground">
              Browse our verified fitness professionals
            </p>
          </div>
          {locationDisplay && (
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {isManualSelection ? "Filtered:" : "Near"} {locationDisplay}
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
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
            Filters
          </Button>

          {/* Mobile Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden h-11">
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
                  autoLocation={autoLocation.isLoading ? null : {
                    city: autoLocation.city,
                    region: autoLocation.region,
                    county: autoLocation.county,
                    country: autoLocation.country,
                  }}
                  manualLocation={manualLocation}
                  isAutoLocationLoading={autoLocation.isLoading}
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
              autoLocation={autoLocation.isLoading ? null : {
                city: autoLocation.city,
                region: autoLocation.region,
                county: autoLocation.county,
                country: autoLocation.country,
              }}
              manualLocation={manualLocation}
              isAutoLocationLoading={autoLocation.isLoading}
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
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
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
