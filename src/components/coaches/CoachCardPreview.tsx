import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { getCurrencySymbol, CurrencyCode } from "@/lib/currency";

interface CoachCardPreviewProps {
  displayName: string | null;
  cardImageUrl: string | null;
  profileImageUrl: string | null;
  location: string | null;
  bio: string | null;
  coachTypes: string[] | null;
  hourlyRate: number | null;
  currency: string | null;
  isVerified?: boolean;
}

export function CoachCardPreview({
  displayName,
  cardImageUrl,
  profileImageUrl,
  location,
  bio,
  coachTypes,
  hourlyRate,
  currency,
  isVerified = false,
}: CoachCardPreviewProps) {
  const imageUrl = cardImageUrl || profileImageUrl;
  const currencySymbol = getCurrencySymbol((currency as CurrencyCode) || "GBP");

  return (
    <Card className="overflow-hidden group pointer-events-none w-full max-w-xs">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={displayName || "Coach"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl font-bold text-primary/30">
              {displayName?.charAt(0) || "C"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name and Verified */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate">
              {displayName || "Your Name"}
            </h3>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">5.0</span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Coach Types */}
        {coachTypes && coachTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coachTypes.slice(0, 2).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {coachTypes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{coachTypes.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bio}
          </p>
        )}

        {/* Price */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">
              {currencySymbol}{hourlyRate || 0}
            </span>
            <span className="text-sm text-muted-foreground">/session</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
