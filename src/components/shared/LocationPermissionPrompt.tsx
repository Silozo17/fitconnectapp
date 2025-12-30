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
        "relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5",
        className
      )}>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/15 p-3 shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="pr-6 sm:pr-0">
              <h4 className="text-base font-semibold">Get accurate local results</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We'll find your exact city to show you relevant competitors and coaches nearby. 
                <span className="block sm:inline"> We never track your location.</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-0 sm:ml-4 shrink-0">
            {error ? (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <Button
                onClick={handleClick}
                disabled={isLoading}
                size="default"
                className="gap-2 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding location...
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
