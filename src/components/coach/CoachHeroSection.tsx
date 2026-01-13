import { MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ShareButton } from "@/components/shared/ShareButton";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { QualifiedCoachBadge } from "@/components/verification/QualifiedCoachBadge";
import { CoachFeaturedBadges } from "@/components/coaches/CoachFeaturedBadges";
import StarRating from "@/components/reviews/StarRating";
import { getDisplayLocation } from "@/lib/location-utils";
import { getCoachTypeDisplayLabel } from "@/constants/coachTypes";

interface CoachHeroSectionProps {
  coach: {
    id: string;
    display_name: string | null;
    profile_image_url: string | null;
    card_image_url?: string | null;
    avatars?: { slug: string; rarity: string } | null;
    is_verified?: boolean | null;
    verified_at?: string | null;
    location?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    gym_affiliation?: string | null;
    coach_types?: string[] | null;
    bio?: string | null;
    verified_qualification_count?: number;
  };
  averageRating: number;
  reviewCount: number;
}

export function CoachHeroSection({ coach, averageRating, reviewCount }: CoachHeroSectionProps) {
  return (
    <div className="relative">
      {/* Background gradient with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 backdrop-blur-xl rounded-2xl" />
      
      <div className="relative p-4 md:p-6 pt-12 md:pt-14">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start shrink-0">
            <UserAvatar
              src={coach.card_image_url || coach.profile_image_url}
              avatarSlug={coach.avatars?.slug}
              avatarRarity={coach.avatars?.rarity as any}
              name={coach.display_name}
              variant="squircle"
              size="xl"
              className="ring-4 ring-background shadow-xl"
            />
          </div>

          {/* Coach Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            {/* Name & Verified */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {coach.display_name || "Coach"}
              </h1>
              {coach.is_verified && (
                <VerifiedBadge verifiedAt={coach.verified_at} size="lg" />
              )}
              {(coach.verified_qualification_count ?? 0) >= 1 && (
                <QualifiedCoachBadge count={coach.verified_qualification_count!} size="lg" />
              )}
            </div>

            {/* Location & Gym + Rating inline */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-muted-foreground mb-2">
              {(coach.location || coach.location_city) && (
                <span className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {getDisplayLocation(coach)}
                </span>
              )}
              {coach.gym_affiliation && (
                <span className="flex items-center gap-1.5 text-sm">
                  <Building className="h-3.5 w-3.5" />
                  {coach.gym_affiliation}
                </span>
              )}
              <StarRating 
                rating={averageRating} 
                reviewCount={reviewCount} 
                size="sm"
                showCount
              />
            </div>

            {/* Coach Types + Featured Badges inline */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {coach.coach_types?.map((type) => (
                <Badge 
                  key={type} 
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs font-medium"
                >
                  {getCoachTypeDisplayLabel(type)}
                </Badge>
              ))}
              <CoachFeaturedBadges coachId={coach.id} />
            </div>
          </div>

          {/* Actions - Top Right */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <ShareButton
              title={`${coach.display_name} - Coach on FitConnect`}
              text={coach.bio || `Check out ${coach.display_name}'s coaching profile!`}
              url={window.location.href}
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm h-8 w-8"
            />
            <FavouriteButton 
              coachId={coach.id} 
              className="bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
