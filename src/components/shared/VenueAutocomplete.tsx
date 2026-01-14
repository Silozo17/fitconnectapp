import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Check, X, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VenuePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface VenueData {
  place_id: string;
  formatted_address: string;
  name: string;
  lat: number;
  lng: number;
  street_address?: string;
  city?: string;
  region?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
}

interface VenueAutocompleteProps {
  value: string;
  onVenueChange: (location: string, data: VenueData | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function VenueAutocomplete({
  value,
  onVenueChange,
  placeholder = "Search for a gym, studio, park...",
  className,
  disabled = false,
}: VenueAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<VenuePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with external value
  useEffect(() => {
    if (value !== inputValue && !isOpen) {
      setInputValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchVenues = async (query: string) => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("places-venue-autocomplete", {
        body: { query },
      });

      if (error) throw error;
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Failed to search venues:", error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedVenue(null);
    onVenueChange(newValue, null);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchVenues(newValue);
    }, 300);

    setIsOpen(true);
  };

  const handleSelect = async (prediction: VenuePrediction) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("places-details", {
        body: { place_id: prediction.place_id },
      });

      if (error) throw error;

      // Use all the venue data from places-details
      const venueData: VenueData = {
        place_id: data.place_id,
        formatted_address: data.formatted_address,
        name: prediction.main_text,
        lat: data.lat,
        lng: data.lng,
        street_address: data.street_address,
        city: data.city,
        region: data.region,
        country: data.country,
        postal_code: data.postal_code,
        phone: data.phone,
      };
      
      // Display as "Venue Name, Address"
      const displayValue = `${prediction.main_text}, ${prediction.secondary_text}`;
      
      setInputValue(displayValue);
      setSelectedVenue(venueData);
      onVenueChange(displayValue, venueData);
      setPredictions([]);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to get venue details:", error);
      // Fallback to just using the description
      setInputValue(prediction.description);
      onVenueChange(prediction.description, null);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedVenue(null);
    onVenueChange("", null);
    setPredictions([]);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Allow free-text if no selection made
    setTimeout(() => {
      if (!selectedVenue && inputValue) {
        onVenueChange(inputValue, null);
      }
    }, 200);
  };

  return (
    <div className={cn("relative min-w-0 w-full", className)}>
      <div className="relative min-w-0">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 bg-background border-border text-foreground",
            selectedVenue && "border-green-500/50"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {selectedVenue && !isLoading && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {inputValue && !isLoading && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-secondary rounded"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-start gap-3"
            >
              <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {prediction.main_text}
                </p>
                {prediction.secondary_text && (
                  <p className="text-sm text-muted-foreground truncate">
                    {prediction.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected venue indicator */}
      {selectedVenue && (
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          {selectedVenue.name}
        </p>
      )}
    </div>
  );
}
