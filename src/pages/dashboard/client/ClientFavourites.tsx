import { Link } from "react-router-dom";
import { Heart, Loader2, MapPin, Video, Users } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavouriteCoaches } from "@/hooks/useFavourites";
import { calculateAverageRating, Review } from "@/hooks/useReviews";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import StarRating from "@/components/reviews/StarRating";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { getDisplayLocation } from "@/lib/location-utils";
// Batch fetch reviews for all coaches at once
const useBatchCoachReviews = (coachIds: string[]) => {
  return useQuery({
    queryKey: ["batch-coach-reviews", coachIds],
    queryFn: async () => {
      if (coachIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from("reviews")
        .select("coach_id, rating")
        .in("coach_id", coachIds)
        .eq("is_public", true);
      
      if (error) throw error;
      
      // Group reviews by coach_id
      const reviewsByCoach: Record<string, { ratings: number[]; count: number; average: number }> = {};
      
      data?.forEach((review) => {
        if (!reviewsByCoach[review.coach_id]) {
          reviewsByCoach[review.coach_id] = { ratings: [], count: 0, average: 0 };
        }
        reviewsByCoach[review.coach_id].ratings.push(review.rating);
        reviewsByCoach[review.coach_id].count++;
      });
      
      // Calculate averages
      Object.keys(reviewsByCoach).forEach((coachId) => {
        const { ratings } = reviewsByCoach[coachId];
        reviewsByCoach[coachId].average = ratings.length > 0 
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
          : 0;
      });
      
      return reviewsByCoach;
    },
    enabled: coachIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

interface FavouriteCoachCardProps {
  coach: any;
  reviewData?: { count: number; average: number };
  linkPrefix: string;
}

const FavouriteCoachCard = ({ coach, reviewData, linkPrefix }: FavouriteCoachCardProps) => {
  const averageRating = reviewData?.average || 0;
  const reviewCount = reviewData?.count || 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          {coach.profile_image_url ? (
            <img
              src={coach.profile_image_url}
              alt={coach.display_name || "Coach"}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <UserAvatar
                src={null}
                name={coach.display_name}
                className="h-20 w-20 text-3xl"
              />
            </div>
          )}
          
          {/* Favourite Button */}
          <div className="absolute top-3 right-3">
            <FavouriteButton coachId={coach.id} />
          </div>

          {/* Availability Badges */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {coach.online_available && (
              <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                <Video className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
            {coach.in_person_available && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white border-0">
                <Users className="h-3 w-3 mr-1" />
                In-Person
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground">
                {coach.display_name || "Coach"}
              </h3>
              {(coach.location || coach.location_city) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getDisplayLocation(coach)}
                </p>
              )}
            </div>
            <StarRating rating={averageRating} reviewCount={reviewCount} size="sm" />
          </div>

          {/* Coach Types */}
          {coach.coach_types && coach.coach_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {coach.coach_types.slice(0, 2).map((type: string) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
              {coach.coach_types.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{coach.coach_types.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {coach.hourly_rate ? (
              <p className="font-semibold text-foreground">
                {formatCurrency(coach.hourly_rate, (coach.currency as CurrencyCode) || 'GBP')}<span className="text-sm text-muted-foreground font-normal">/session</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            )}
            <Button size="sm" asChild>
              <Link to={`${linkPrefix}/${coach.username || coach.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ClientFavourites = () => {
  const { data: coaches = [], isLoading } = useFavouriteCoaches();
  const linkPrefix = useCoachLinkPrefix();
  
  // Batch fetch all reviews for favourite coaches
  const coachIds = coaches.map((c) => c.id);
  const { data: reviewsMap = {} } = useBatchCoachReviews(coachIds);

  return (
    <ClientDashboardLayout
      title="Favourite Coaches"
      description="Your saved favourite coaches"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Favourite Coaches</h1>
        <p className="text-muted-foreground">
          Quick access to coaches you've saved
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coaches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No favourites yet</h3>
            <p className="text-muted-foreground mb-4">
              Save coaches to your favourites for quick access
            </p>
            <Button asChild>
              <Link to={linkPrefix}>Browse Coaches</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <FavouriteCoachCard 
              key={coach.id} 
              coach={coach} 
              reviewData={reviewsMap[coach.id]}
              linkPrefix={linkPrefix}
            />
          ))}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientFavourites;
