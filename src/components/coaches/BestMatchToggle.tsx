/**
 * "Best match" toggle for opt-in location-based ranking
 * 
 * ⚠️ STABILITY: This toggle controls ranking activation.
 * When OFF: Standard order (get_simple_coaches or get_filtered_coaches_v1)
 * When ON: Ranked order (get_ranked_coaches_v1) - requires location
 */

import { useState, useCallback } from "react";
import { Sparkles, MapPin, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BestMatchToggleProps {
  /** Whether ranking is currently enabled */
  isEnabled: boolean;
  /** Called when user toggles ranking on/off */
  onToggle: (enabled: boolean) => void;
  /** Whether location is being resolved */
  isLoading?: boolean;
  /** Whether user has location (GPS or IP) */
  hasLocation?: boolean;
  /** Current location display (e.g., "London, UK") */
  locationDisplay?: string | null;
}

export function BestMatchToggle({
  isEnabled,
  onToggle,
  isLoading = false,
  hasLocation = false,
  locationDisplay,
}: BestMatchToggleProps) {
  const handleToggle = useCallback((checked: boolean) => {
    onToggle(checked);
  }, [onToggle]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles className={`h-4 w-4 flex-shrink-0 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex flex-col min-w-0">
            <Label 
              htmlFor="best-match-toggle" 
              className="text-sm font-medium cursor-pointer"
            >
              Best match
            </Label>
            {isEnabled && locationDisplay && (
              <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationDisplay}
              </span>
            )}
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id="best-match-toggle"
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px]">
            <p className="text-xs">
              Uses your location to show the most relevant coaches nearby.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
