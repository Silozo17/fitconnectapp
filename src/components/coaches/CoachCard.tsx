import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Video, User, MessageSquare, Calendar, UserPlus, Building, Rocket } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import StarRating from "@/components/reviews/StarRating";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";

interface CoachCardProps {
  coach: MarketplaceCoach;
  onBook?: (coach: MarketplaceCoach) => void;
  onRequestConnection?: (coach: MarketplaceCoach) => void;
  linkPrefix?: string;
}

const CoachCard = ({ coach, onBook, onRequestConnection, linkPrefix = "/coaches" }: CoachCardProps) => {
  const { data: reviews = [] } = useCoachReviews(coach.id);
  const averageRating = calculateAverageRating(reviews);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isClient = user && (role === "client" || role === "admin");
  const isAuthenticated = !!user;

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    // Navigate to messages with this coach
    navigate(`/dashboard/client/messages/${coach.id}`);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    onBook?.(coach);
  };

  const handleRequestConnection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    onRequestConnection?.(coach);
  };

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/auth?tab=register&role=client");
  };

  return (
    <div className={`group card-glow rounded-2xl overflow-hidden hover-lift relative ${coach.is_sponsored ? "ring-2 ring-primary/50" : ""}`}>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {coach.is_sponsored && (
          <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
            <Rocket className="w-3 h-3 mr-1" />
            Sponsored
          </Badge>
        )}
        <FavouriteButton coachId={coach.id} />
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {(coach.card_image_url || coach.profile_image_url) ? (
          // Priority 1: Uploaded card or profile image
          <img src={coach.card_image_url || coach.profile_image_url || ""} alt={coach.display_name || "Coach"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : coach.avatars?.slug ? (
          // Priority 2: Selected character avatar displayed full-width
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-400 overflow-hidden">
            <img 
              src={getAvatarImageUrl(coach.avatars.slug)} 
              alt={coach.display_name || "Coach"} 
              className="h-[200%] object-contain object-bottom"
            />
          </div>
        ) : (
          // Priority 3: Fallback to initials
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <UserAvatar 
              src={null} 
              name={coach.display_name} 
              variant="squircle"
              size="lg"
            />
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {coach.in_person_available && (
            <Badge className="bg-accent/90 text-accent-foreground border-0 backdrop-blur-sm"><User className="w-3 h-3 mr-1" />In-Person</Badge>
          )}
          {coach.online_available && (
            <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm"><Video className="w-3 h-3 mr-1" />Online</Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={averageRating} reviewCount={reviews.length} size="sm" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {coach.display_name || "Coach"}
          </h3>
          {coach.is_verified && (
            <VerifiedBadge verifiedAt={coach.verified_at} size="sm" />
          )}
        </div>
        {coach.coach_types && coach.coach_types.length > 0 && (
          <p className="text-primary text-sm font-medium mb-2">{coach.coach_types[0]}</p>
        )}

        {(coach.location || coach.gym_affiliation) && (
          <div className="flex flex-col gap-1 text-muted-foreground text-sm mb-4">
            {coach.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{coach.location}
              </div>
            )}
            {coach.gym_affiliation && (
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />{coach.gym_affiliation}
              </div>
            )}
          </div>
        )}

        {coach.bio && <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{coach.bio}</p>}

        {coach.coach_types && coach.coach_types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {coach.coach_types.slice(0, 3).map((type) => (
              <Badge key={type} variant="secondary" className="bg-secondary/80 text-xs">{type}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {coach.hourly_rate ? (
              <>
                <span className="font-display font-bold text-xl text-foreground">{formatCurrency(coach.hourly_rate, (coach.currency as CurrencyCode) || 'GBP')}</span>
                <span className="text-muted-foreground text-sm">/session</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Contact for pricing</span>
            )}
          </div>
          
          {/* Action Buttons */}
          {isClient ? (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Message</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleBook}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Book Session</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleRequestConnection}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Request Connection</TooltipContent>
                </Tooltip>

                <Button asChild variant="lime-outline" size="sm">
                  <Link to={`${linkPrefix}/${coach.username || coach.id}`}>View</Link>
                </Button>
              </div>
            </TooltipProvider>
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="lime-outline" size="sm">
                <Link to={`${linkPrefix}/${coach.username || coach.id}`}>View</Link>
              </Button>
              <Button variant="lime" size="sm" onClick={handleSignUp}>
                Connect
              </Button>
            </div>
          ) : (
            <Button asChild variant="lime-outline" size="sm">
              <Link to={`${linkPrefix}/${coach.username || coach.id}`}>View Profile</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
