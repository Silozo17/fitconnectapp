import { useState, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvailableCities } from "@/hooks/useAvailableCities";
import { LocationData } from "@/types/ranking";

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
}

export function LocationFilter({
  autoLocation,
  manualLocation,
  isAutoLocationLoading,
  onLocationSelect,
  onClearLocation,
}: LocationFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { data: cities, isLoading: citiesLoading } = useAvailableCities();

  // Determine active location (manual overrides auto)
  const activeLocation = manualLocation ?? autoLocation;
  const isManual = manualLocation !== null;

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!cities || !searchQuery.trim()) return cities ?? [];
    
    const query = searchQuery.toLowerCase();
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(query) ||
        c.region?.toLowerCase().includes(query) ||
        c.country?.toLowerCase().includes(query)
    );
  }, [cities, searchQuery]);

  const handleCitySelect = (city: typeof filteredCities[0]) => {
    onLocationSelect({
      city: city.city,
      region: city.region,
      country: city.country,
    });
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const displayLocation = activeLocation?.city 
    || activeLocation?.region 
    || activeLocation?.country 
    || null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Location</h4>
      
      {/* Current Location Badge */}
      {displayLocation && (
        <div className="flex items-center gap-2">
          <Badge 
            variant={isManual ? "default" : "secondary"} 
            className="flex items-center gap-1.5 py-1.5 px-3"
          >
            {isManual ? (
              <Search className="w-3 h-3" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            <span className="text-xs">
              {isManual ? "Filtered" : "Your Location"}:
            </span>
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
          placeholder="Search different location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsSearchFocused(false), 200);
          }}
          autoFocus={false}
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Search Results Dropdown */}
      {isSearchFocused && searchQuery.trim() && (
        <div className="border border-border rounded-md bg-popover shadow-md">
          {citiesLoading ? (
            <p className="text-xs text-muted-foreground p-3">Loading cities...</p>
          ) : filteredCities.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">No cities found</p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="p-1">
                {filteredCities.slice(0, 10).map((city) => (
                  <Button
                    key={`${city.city}-${city.region}`}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleCitySelect(city)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{city.city}</span>
                      <span className="text-xs text-muted-foreground">
                        {[city.region, city.country].filter(Boolean).join(", ")}
                        {city.coachCount > 0 && ` · ${city.coachCount} coach${city.coachCount !== 1 ? "es" : ""}`}
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
