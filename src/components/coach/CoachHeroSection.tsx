import { MapPin, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ShareButton } from "@/components/shared/ShareButton";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { CoachFeaturedBadges } from "@/components/coaches/CoachFeaturedBadges";
import StarRating from "@/components/reviews/StarRating";

interface CoachHeroSectionProps {
  coach: {
    id: string;
    display_name: string | null;
    profile_image_url: string | null;
    avatars?: { slug: string; rarity: string } | null;
    is_verified: boolean | null;
    verified_at: string | null;
    location: string | null;
    gym_affiliation: string | null;
    coach_types: string[] | null;
    bio: string | null;
  };
  averageRating: number;
  reviewCount: number;
}

export function CoachHeroSection({ coach, averageRating, reviewCount }: CoachHeroSectionProps) {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <UserAvatar
                src={coach.profile_image_url}
                avatarSlug={coach.avatars?.slug}
                avatarRarity={coach.avatars?.rarity as any}
                name={coach.display_name}
                variant="squircle"
                size="xl"
                className="ring-4 ring-background shadow-xl"
              />
            </div>
          </div>

          {/* Coach Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Name & Verified */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {coach.display_name || "Coach"}
              </h1>
              {coach.is_verified && (
                <VerifiedBadge verifiedAt={coach.verified_at} size="lg" />
              )}
            </div>

            {/* Location & Gym */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
              {coach.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {coach.location}
                </span>
              )}
              {coach.gym_affiliation && (
                <span className="flex items-center gap-1.5">
                  <Building className="h-4 w-4" />
                  {coach.gym_affiliation}
                </span>
              )}
            </div>

            {/* Rating - Prominent Display */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <StarRating 
                rating={averageRating} 
                reviewCount={reviewCount} 
                size="lg"
                showCount
              />
            </div>

            {/* Coach Types */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {coach.coach_types?.map((type) => (
                <Badge 
                  key={type} 
                  variant="secondary"
                  className="px-3 py-1 text-sm font-medium"
                >
                  {type}
                </Badge>
              ))}
            </div>

            {/* Featured Badges */}
            <div className="flex justify-center md:justify-start">
              <CoachFeaturedBadges coachId={coach.id} />
            </div>
          </div>

          {/* Actions - Top Right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <ShareButton
              title={`${coach.display_name} - Coach on FitConnect`}
              text={coach.bio || `Check out ${coach.display_name}'s coaching profile!`}
              url={window.location.href}
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm"
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
