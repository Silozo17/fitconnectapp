import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface LocationData {
  place_id?: string;
  formatted_address?: string;
  formattedAddress?: string;
  city?: string;
  region?: string;
  county?: string;
  country?: string;
  country_code?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
}

interface LocationAutocompleteProps {
  value: string;
  onLocationChange: (location: string, data: LocationData | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onLocationChange,
  placeholder = "Search for a city...",
  required = false,
  className,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
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

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("places-autocomplete", {
        body: { query },
      });

      if (error) throw error;
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Failed to search places:", error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedLocation(null);
    onLocationChange(newValue, null);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);

    setIsOpen(true);
  };

  const handleSelect = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    console.log('[LocationAutocomplete] handleSelect called with prediction:', prediction);
    try {
      const { data, error } = await supabase.functions.invoke("places-details", {
        body: { place_id: prediction.place_id },
      });

      console.log('[LocationAutocomplete] Edge function response:', { data, error });

      if (error) throw error;

      const locationData: LocationData = data;
      const displayValue = `${locationData.city}${locationData.country ? `, ${locationData.country}` : ""}`;
      
      console.log('[LocationAutocomplete] Parsed locationData:', locationData);
      console.log('[LocationAutocomplete] Calling onLocationChange with:', { displayValue, locationData });
      
      setInputValue(displayValue);
      setSelectedLocation(locationData);
      onLocationChange(displayValue, locationData);
      setPredictions([]);
      setIsOpen(false);
    } catch (error) {
      console.error("[LocationAutocomplete] Failed to get place details:", error);
      // Fallback to just using the description
      setInputValue(prediction.description);
      onLocationChange(prediction.description, null);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedLocation(null);
    onLocationChange("", null);
    setPredictions([]);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 bg-secondary border-border text-foreground",
            selectedLocation && "border-green-500/50"
          )}
          required={required}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {selectedLocation && !isLoading && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {inputValue && !isLoading && (
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
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
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

      {/* Selected location indicator */}
      {selectedLocation && (
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          {selectedLocation.city}, {selectedLocation.region && `${selectedLocation.region}, `}{selectedLocation.country}
        </p>
      )}
    </div>
  );
}
