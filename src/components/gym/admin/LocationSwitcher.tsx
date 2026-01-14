import { useState, useEffect } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Building2 } from "lucide-react";

interface LocationSwitcherProps {
  compact?: boolean;
}

/**
 * Location switcher component for gym admin sidebar
 * - Owners see all locations + "All Locations" option
 * - Staff only see their assigned locations
 * - Single location users see a static badge instead of dropdown
 */
export function LocationSwitcher({ compact = false }: LocationSwitcherProps) {
  const { isOwner, staffRecord } = useGym();
  const { data: allLocations = [], isLoading } = useGymLocations();
  
  // Get current location from localStorage
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(() => {
    return localStorage.getItem("selectedGymLocationId");
  });

  // Filter locations based on role
  const availableLocations = isOwner
    ? allLocations
    : allLocations.filter((loc) => {
        const assignedIds = (staffRecord as any)?.assigned_location_ids || [];
        return assignedIds.length === 0 || assignedIds.includes(loc.id);
      });

  // Auto-select if only one location available
  useEffect(() => {
    if (availableLocations.length === 1 && !currentLocationId) {
      handleLocationChange(availableLocations[0].id);
    }
  }, [availableLocations, currentLocationId]);

  const handleLocationChange = (locationId: string) => {
    if (locationId === "all") {
      localStorage.removeItem("selectedGymLocationId");
      setCurrentLocationId(null);
    } else {
      localStorage.setItem("selectedGymLocationId", locationId);
      setCurrentLocationId(locationId);
    }
    // Trigger a custom event for other components to react
    window.dispatchEvent(new CustomEvent("gymLocationChange", { detail: locationId }));
  };

  const currentLocation = allLocations.find((loc) => loc.id === currentLocationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  // No locations configured
  if (allLocations.length === 0) {
    return null;
  }

  // Single location - show static badge
  if (availableLocations.length === 1) {
    const location = availableLocations[0];
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{location.name}</span>
      </div>
    );
  }

  // Multiple locations - show dropdown
  return (
    <Select
      value={currentLocationId || "all"}
      onValueChange={handleLocationChange}
    >
      <SelectTrigger className={compact ? "h-8 text-xs" : ""}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <SelectValue>
            {currentLocation ? currentLocation.name : "All Locations"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {isOwner && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>All Locations</span>
            </div>
          </SelectItem>
        )}
        {availableLocations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{location.name}</span>
                {location.city && (
                  <span className="text-xs text-muted-foreground">
                    {location.city}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Hook to get current selected location
 */
export function useCurrentGymLocation() {
  const { data: locations = [] } = useGymLocations();
  const [locationId, setLocationId] = useState<string | null>(() => {
    return localStorage.getItem("selectedGymLocationId");
  });

  useEffect(() => {
    const handleChange = (event: CustomEvent) => {
      setLocationId(event.detail === "all" ? null : event.detail);
    };

    window.addEventListener("gymLocationChange", handleChange as EventListener);
    return () => {
      window.removeEventListener("gymLocationChange", handleChange as EventListener);
    };
  }, []);

  const currentLocation = locations.find((loc) => loc.id === locationId);

  return {
    locationId,
    location: currentLocation,
    isAllLocations: !locationId,
  };
}

export default LocationSwitcher;
