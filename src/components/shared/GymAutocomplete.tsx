import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Dumbbell, Loader2, Check, X, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GymPrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface GymAutocompleteProps {
  value: string;
  onChange: (gymName: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  locationBias?: { lat: number; lng: number } | null;
}

export function GymAutocomplete({
  value,
  onChange,
  placeholder = "Search for a gym or studio...",
  className,
  disabled = false,
  locationBias = null,
}: GymAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<GymPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSelectingRef = useRef(false);

  // Sync input value with external value
  useEffect(() => {
    if (value !== inputValue && !isOpen) {
      setInputValue(value);
      // If there's a value, assume it was previously selected
      setIsSelected(!!value);
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

  const searchGyms = async (query: string) => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const body: { query: string; lat?: number; lng?: number } = { query };
      
      // Add location bias if available
      if (locationBias?.lat && locationBias?.lng) {
        body.lat = locationBias.lat;
        body.lng = locationBias.lng;
      }

      const { data, error } = await supabase.functions.invoke("places-venue-autocomplete", {
        body,
      });

      if (error) throw error;
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Failed to search gyms:", error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsSelected(false);
    onChange(newValue);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchGyms(newValue);
    }, 300);

    setIsOpen(true);
  };

  const handleSelect = (prediction: GymPrediction) => {
    isSelectingRef.current = true;
    const gymName = prediction.main_text;
    
    setInputValue(gymName);
    setIsSelected(true);
    onChange(gymName);
    setPredictions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    setIsSelected(false);
    onChange("");
    setPredictions([]);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!isSelectingRef.current && !isSelected && inputValue) {
        onChange(inputValue);
      }
      isSelectingRef.current = false;
    }, 200);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
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
            "pl-10 pr-10 bg-background border-border text-foreground",
            isSelected && "border-green-500/50"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {isSelected && !isLoading && (
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
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(prediction);
              }}
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

      {/* Selected gym indicator */}
      {isSelected && inputValue && (
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          {inputValue}
        </p>
      )}
    </div>
  );
}
