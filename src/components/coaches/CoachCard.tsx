import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Video, User, MessageSquare, Calendar, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import StarRating from "@/components/reviews/StarRating";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";

interface CoachCardProps {
  coach: MarketplaceCoach;
  onBook?: (coach: MarketplaceCoach) => void;
  onRequestConnection?: (coach: MarketplaceCoach) => void;
}

const CoachCard = ({ coach, onBook, onRequestConnection }: CoachCardProps) => {
  const { data: reviews = [] } = useCoachReviews(coach.id);
  const averageRating = calculateAverageRating(reviews);
  const { user, role } = useAuth();
  const { formatCurrency } = useLocale();
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
    <div className="group card-glow rounded-2xl overflow-hidden hover-lift relative">
      <div className="absolute top-3 right-3 z-10">
        <FavouriteButton coachId={coach.id} />
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {coach.profile_image_url ? (
          <img src={coach.profile_image_url} alt={coach.display_name || "Coach"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <UserAvatar src={null} name={coach.display_name} className="w-24 h-24 text-3xl" />
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

        <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
          {coach.display_name || "Coach"}
        </h3>
        {coach.coach_types && coach.coach_types.length > 0 && (
          <p className="text-primary text-sm font-medium mb-2">{coach.coach_types[0]}</p>
        )}

        {coach.location && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
            <MapPin className="w-3 h-3" />{coach.location}
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
                <span className="font-display font-bold text-xl text-foreground">{formatCurrency(coach.hourly_rate)}</span>
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
                  <Link to={`/coaches/${coach.id}`}>View</Link>
                </Button>
              </div>
            </TooltipProvider>
          ) : !isAuthenticated ? (
            <Button variant="lime" size="sm" onClick={handleSignUp}>
              Sign Up to Connect
            </Button>
          ) : (
            <Button asChild variant="lime-outline" size="sm">
              <Link to={`/coaches/${coach.id}`}>View Profile</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
