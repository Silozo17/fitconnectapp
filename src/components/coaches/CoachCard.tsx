import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Video, User, Heart } from "lucide-react";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";

interface CoachCardProps {
  coach: MarketplaceCoach;
}

const CoachCard = ({ coach }: CoachCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group card-elevated overflow-hidden hover-lift relative">
      {/* Favorite Button */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorite ? "fill-accent text-accent" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {coach.profile_image_url ? (
          <img
            src={coach.profile_image_url}
            alt={coach.display_name || "Coach"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserAvatar
              src={null}
              name={coach.display_name}
              className="w-24 h-24 text-3xl"
            />
          </div>
        )}
        {/* Session Type Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {coach.in_person_available && (
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
              <User className="w-3 h-3 mr-1" />
              In-Person
            </Badge>
          )}
          {coach.online_available && (
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
              <Video className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">New</span>
          </div>
        </div>

        {/* Name & Specialty */}
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">
          {coach.display_name || "Coach"}
        </h3>
        {coach.coach_types && coach.coach_types.length > 0 && (
          <p className="text-primary text-sm font-medium mb-2">
            {coach.coach_types[0]}
          </p>
        )}

        {/* Location */}
        {coach.location && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
            <MapPin className="w-3 h-3" />
            {coach.location}
          </div>
        )}

        {/* Bio Preview */}
        {coach.bio && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {coach.bio}
          </p>
        )}

        {/* Tags - Coach Types */}
        {coach.coach_types && coach.coach_types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {coach.coach_types.slice(0, 3).map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="bg-secondary text-secondary-foreground text-xs"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {coach.hourly_rate ? (
              <>
                <span className="font-display font-bold text-xl text-foreground">
                  £{coach.hourly_rate}
                </span>
                <span className="text-muted-foreground text-sm">/session</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Contact for pricing</span>
            )}
          </div>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={`/coaches/${coach.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
