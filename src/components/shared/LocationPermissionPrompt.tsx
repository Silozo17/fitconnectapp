import { MapPin, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocationPermissionPromptProps {
  onRequestLocation: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  variant?: 'inline' | 'banner' | 'compact';
  className?: string;
  onDismiss?: () => void;
}

/**
 * Privacy-first location permission prompt component.
 * Only triggers browser geolocation on explicit user action.
 * 
 * Variants:
 * - inline: Button with text for use in lists/cards
 * - banner: Full-width banner with explanation
 * - compact: Small button/icon for tight spaces
 */
export function LocationPermissionPrompt({
  onRequestLocation,
  isLoading,
  error,
  variant = 'inline',
  className,
  onDismiss,
}: LocationPermissionPromptProps) {
  const handleClick = async () => {
    await onRequestLocation();
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={cn("gap-1.5 text-muted-foreground hover:text-foreground", className)}
        title="Use my location"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        <span className="sr-only">Use my location</span>
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "relative rounded-lg border border-border/50 bg-muted/30 p-4",
        className
      )}>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Enable precise location</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                See competitors near you. Your exact location stays private.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-10 sm:ml-0">
            {error ? (
              <div className="flex items-center gap-1.5 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            ) : (
              <Button
                onClick={handleClick}
                disabled={isLoading}
                size="sm"
                className="gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Use my location
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Detecting location...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Use my location
          </>
        )}
      </Button>
      
      {error && (
        <div className="flex items-center gap-1.5 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Badge to show current location accuracy level
 */
export function LocationAccuracyBadge({ 
  accuracy,
  className,
}: { 
  accuracy: 'approximate' | 'precise' | 'manual' | null;
  className?: string;
}) {
  if (!accuracy) return null;

  const config = {
    approximate: {
      label: 'Approximate location',
      icon: MapPin,
      className: 'text-muted-foreground bg-muted/50',
    },
    precise: {
      label: 'Precise location',
      icon: CheckCircle2,
      className: 'text-primary bg-primary/10',
    },
    manual: {
      label: 'Manually set',
      icon: MapPin,
      className: 'text-accent-foreground bg-accent/10',
    },
  };

  const { label, icon: Icon, className: badgeClass } = config[accuracy];

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      badgeClass,
      className
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
