import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Video, User, Heart } from "lucide-react";
import { useState } from "react";

export interface Coach {
  id: number;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  tags: string[];
  image: string;
  verified: boolean;
  online: boolean;
  inPerson: boolean;
  bio: string;
  sponsored?: boolean;
}

interface CoachCardProps {
  coach: Coach;
}

const CoachCard = ({ coach }: CoachCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group card-elevated overflow-hidden hover-lift relative">
      {/* Sponsored Badge */}
      {coach.sponsored && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-accent text-accent-foreground">
            Sponsored
          </Badge>
        </div>
      )}

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
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coach.image}
          alt={coach.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Session Type Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {coach.inPerson && (
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
              <User className="w-3 h-3 mr-1" />
              In-Person
            </Badge>
          )}
          {coach.online && (
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
              <Video className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Rating & Verified */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{coach.rating}</span>
            <span className="text-muted-foreground text-sm">
              ({coach.reviews})
            </span>
          </div>
          {coach.verified && (
            <Badge className="bg-success/20 text-success border-0">
              Verified
            </Badge>
          )}
        </div>

        {/* Name & Specialty */}
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">
          {coach.name}
        </h3>
        <p className="text-primary text-sm font-medium mb-2">{coach.specialty}</p>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <MapPin className="w-3 h-3" />
          {coach.location}
        </div>

        {/* Bio Preview */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {coach.bio}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {coach.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary text-secondary-foreground text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="font-display font-bold text-xl text-foreground">
              £{coach.price}
            </span>
            <span className="text-muted-foreground text-sm">/session</span>
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
