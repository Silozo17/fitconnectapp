import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, X, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvailableCities } from "@/hooks/useAvailableCities";
import { LocationData } from "@/types/ranking";
import { LocationAccuracyLevel } from "@/types/location";
import { supabase } from "@/integrations/supabase/client";

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationFilterProps {
  /** Auto-detected location from browser/IP */
  autoLocation: LocationData | null;
  /** Manually selected location (overrides auto) */
  manualLocation: LocationData | null;
  /** Whether auto location is still loading */
  isAutoLocationLoading?: boolean;
  /** Called when user selects a new location */
  onLocationSelect: (location: LocationData) => void;
  /** Called when user clears manual selection */
  onClearLocation: () => void;
  /** Called when user requests precise GPS location */
  onRequestPreciseLocation?: () => Promise<boolean>;
  /** Whether precise location request is in progress */
  isRequestingPrecise?: boolean;
  /** Current location accuracy level */
  accuracyLevel?: LocationAccuracyLevel | null;
}

export function LocationFilter({
  autoLocation,
  manualLocation,
  isAutoLocationLoading,
  onLocationSelect,
  onClearLocation,
  onRequestPreciseLocation,
  isRequestingPrecise,
  accuracyLevel,
}: LocationFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: cities, isLoading: citiesLoading } = useAvailableCities();

  // Determine active location (manual overrides auto)
  const activeLocation = manualLocation ?? autoLocation;
  const isManual = manualLocation !== null;

  // Search places using Google Places API
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    setIsSearchingPlaces(true);
    try {
      const { data, error } = await supabase.functions.invoke("places-autocomplete", {
        body: { query },
      });

      if (error) {
        console.error("Places autocomplete error:", error);
        setPredictions([]);
        return;
      }

      setPredictions(data?.predictions || []);
    } catch (err) {
      console.error("Failed to search places:", err);
      setPredictions([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  }, [searchPlaces]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle place selection from Google Places
  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    setIsSelectingPlace(true);
    try {
      const { data, error } = await supabase.functions.invoke("places-details", {
        body: { placeId: prediction.place_id },
      });

      if (error) {
        console.error("Places details error:", error);
        return;
      }

      if (data) {
        onLocationSelect({
          city: data.city || prediction.main_text,
          region: data.region,
          country: data.country,
          displayLocation: prediction.main_text,
          lat: data.lat,
          lng: data.lng,
        });
      }
    } catch (err) {
      console.error("Failed to get place details:", err);
    } finally {
      setIsSelectingPlace(false);
      setSearchQuery("");
      setIsSearchFocused(false);
      setPredictions([]);
    }
  };

  // Handle quick access city selection (from database)
  const handleCitySelect = (city: NonNullable<typeof cities>[0]) => {
    onLocationSelect({
      city: city.city,
      region: city.region,
      country: city.country,
    });
    setSearchQuery("");
    setIsSearchFocused(false);
    setPredictions([]);
  };

  // Use displayLocation if available, otherwise fall back to city/region/country
  const displayLocation = activeLocation?.displayLocation 
    || activeLocation?.city 
    || activeLocation?.region 
    || activeLocation?.country 
    || null;

  // Get user-friendly accuracy label
  const getAccuracyLabel = () => {
    switch (accuracyLevel) {
      case 'precise':
        return 'Precise location';
      case 'manual':
        return 'Manually set';
      case 'approximate':
      default:
        return 'Approximate location';
    }
  };

  const handleRequestLocation = async () => {
    if (onRequestPreciseLocation) {
      await onRequestPreciseLocation();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Location</h4>
        
        {/* GPS button - only show when not already precise/manual */}
        {onRequestPreciseLocation && accuracyLevel !== 'precise' && accuracyLevel !== 'manual' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRequestLocation}
            disabled={isRequestingPrecise}
            className="gap-1.5 h-7 text-xs"
          >
            {isRequestingPrecise ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Navigation className="h-3 w-3" />
                Use my location
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Current Location Badge */}
      {displayLocation && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={isManual ? "default" : "secondary"} 
            className="flex items-center gap-1.5 py-1.5 px-3"
          >
            {isManual ? (
              <Search className="w-3 h-3" />
            ) : accuracyLevel === 'precise' ? (
              <Navigation className="w-3 h-3" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            <span className="font-medium">{displayLocation}</span>
            {isManual && (
              <button
                onClick={onClearLocation}
                className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                aria-label="Clear location filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
          
          {/* Accuracy indicator */}
          <span className="text-xs text-muted-foreground">
            {getAccuracyLabel()}
          </span>
        </div>
      )}

      {/* No precise location - show CTA */}
      {!displayLocation && accuracyLevel === 'approximate' && onRequestPreciseLocation && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            Enable precise location for accurate nearby coaches
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestLocation}
            disabled={isRequestingPrecise}
            className="gap-1.5"
          >
            {isRequestingPrecise ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Use my location
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isAutoLocationLoading && !displayLocation && (
        <p className="text-xs text-muted-foreground">Detecting your location...</p>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search any location..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsSearchFocused(false), 200);
          }}
          autoFocus={false}
          className="pl-8 h-9 text-sm"
        />
        {(isSearchingPlaces || isSelectingPlace) && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Google Places Search Results Dropdown */}
      {isSearchFocused && searchQuery.trim() && (
        <div className="border border-border rounded-md bg-popover shadow-md">
          {isSearchingPlaces ? (
            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching locations...
            </div>
          ) : predictions.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">
              {searchQuery.length < 2 ? "Type at least 2 characters" : "No locations found"}
            </p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="p-1">
                {predictions.map((prediction) => (
                  <Button
                    key={prediction.place_id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handlePlaceSelect(prediction)}
                    disabled={isSelectingPlace}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{prediction.main_text}</span>
                      <span className="text-xs text-muted-foreground">
                        {prediction.secondary_text}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Quick Access to Popular Cities (shown when not searching) */}
      {!searchQuery && cities && cities.length > 0 && !isSearchFocused && (
        <div className="flex flex-wrap gap-1.5">
          {cities.slice(0, 4).map((city) => (
            <Button
              key={`quick-${city.city}`}
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => handleCitySelect(city)}
            >
              {city.city}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
