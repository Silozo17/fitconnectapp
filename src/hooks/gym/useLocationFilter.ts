import { useState, useEffect, useCallback } from "react";
import { useGymLocations, GymLocation } from "@/hooks/gym/useGymLocations";
import { useGym } from "@/contexts/GymContext";

/**
 * Hook for managing location-based filtering across gym admin pages.
 * 
 * - Owners see all locations + "All Locations" option
 * - Staff only see their assigned locations
 * - Returns the current location ID and helper functions for filtering queries
 */
export function useLocationFilter() {
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

  // Listen for location changes from LocationSwitcher
  useEffect(() => {
    const handleChange = (event: CustomEvent) => {
      setCurrentLocationId(event.detail === "all" ? null : event.detail);
    };

    window.addEventListener("gymLocationChange", handleChange as EventListener);
    return () => {
      window.removeEventListener("gymLocationChange", handleChange as EventListener);
    };
  }, []);

  // Auto-select if only one location available
  useEffect(() => {
    if (availableLocations.length === 1 && !currentLocationId) {
      setLocationId(availableLocations[0].id);
    }
  }, [availableLocations, currentLocationId]);

  const setLocationId = useCallback((locationId: string | null) => {
    if (locationId === null || locationId === "all") {
      localStorage.removeItem("selectedGymLocationId");
      setCurrentLocationId(null);
    } else {
      localStorage.setItem("selectedGymLocationId", locationId);
      setCurrentLocationId(locationId);
    }
    // Trigger event for other components
    window.dispatchEvent(
      new CustomEvent("gymLocationChange", { detail: locationId || "all" })
    );
  }, []);

  const currentLocation = allLocations.find((loc) => loc.id === currentLocationId);

  /**
   * Apply location filter to a Supabase query builder
   * @param query - Supabase query builder
   * @param columnName - The column to filter on (default: "location_id")
   * @returns The filtered query (or original if "All Locations" selected)
   */
  const applyLocationFilter = useCallback(
    <T extends { eq: (column: string, value: string) => T }>(
      query: T,
      columnName: string = "location_id"
    ): T => {
      if (currentLocationId) {
        return query.eq(columnName, currentLocationId);
      }
      return query;
    },
    [currentLocationId]
  );

  /**
   * Get location name by ID for display purposes
   */
  const getLocationName = useCallback(
    (locationId: string | null | undefined): string => {
      if (!locationId) return "All Locations";
      const location = allLocations.find((loc) => loc.id === locationId);
      return location?.name || "Unknown Location";
    },
    [allLocations]
  );

  /**
   * Check if a specific location ID matches the current filter
   * (useful for showing/hiding items in "All Locations" view)
   */
  const matchesCurrentFilter = useCallback(
    (locationId: string | null | undefined): boolean => {
      if (!currentLocationId) return true; // "All Locations" matches everything
      return locationId === currentLocationId;
    },
    [currentLocationId]
  );

  return {
    // Current state
    locationId: currentLocationId,
    location: currentLocation,
    isAllLocations: !currentLocationId,
    isLoading,

    // Available locations (filtered by permissions)
    availableLocations,
    allLocations,

    // Actions
    setLocationId,
    
    // Query helpers
    applyLocationFilter,
    getLocationName,
    matchesCurrentFilter,
  };
}

export type LocationFilterResult = ReturnType<typeof useLocationFilter>;
