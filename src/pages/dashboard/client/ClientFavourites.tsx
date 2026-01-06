import React from "react";
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
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { getCoachTypeDisplayLabel } from "@/constants/coachTypes";

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

const FavouriteCoachCard = React.memo(({ coach, reviewData, linkPrefix }: FavouriteCoachCardProps) => {
  const averageRating = reviewData?.average || 0;
  const reviewCount = reviewData?.count || 0;

  return (
    <Card className="group overflow-hidden hover:shadow-float transition-all rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
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
              <Badge variant="secondary" className="bg-green-500/90 text-white border-0 rounded-full">
                <Video className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
            {coach.in_person_available && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white border-0 rounded-full">
                <Users className="h-3 w-3 mr-1" />
                In-Person
              </Badge>
            )}
          </div>
        </div>

        <div className="p-5">
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
            <div className="flex flex-wrap gap-1.5 mb-3">
              {coach.coach_types.slice(0, 2).map((type: string) => (
                <Badge key={type} variant="outline" className="text-xs rounded-full">
                  {getCoachTypeDisplayLabel(type)}
                </Badge>
              ))}
              {coach.coach_types.length > 2 && (
                <Badge variant="outline" className="text-xs rounded-full">
                  +{coach.coach_types.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {coach.hourly_rate ? (
              <p className="font-semibold text-foreground">
                {formatCurrency(coach.hourly_rate, (coach.currency as CurrencyCode) || 'GBP')}<span className="text-sm text-muted-foreground font-normal">/session</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Contact for pricing</p>
            )}
            <Button size="sm" asChild className="rounded-xl">
              <Link to={`${linkPrefix}/${coach.username || coach.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if coach.id or reviewData changes
  return prevProps.coach.id === nextProps.coach.id && 
         prevProps.reviewData?.average === nextProps.reviewData?.average &&
         prevProps.reviewData?.count === nextProps.reviewData?.count &&
         prevProps.linkPrefix === nextProps.linkPrefix;
});

FavouriteCoachCard.displayName = 'FavouriteCoachCard';

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
      <PageHelpBanner
        pageKey="client_favourites"
        title="Saved Coaches"
        description="Quick access to coaches you've bookmarked"
      />
      <div className="mb-11">
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
          Favourite <span className="gradient-text">Coaches</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Quick access to coaches you've saved
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coaches.length === 0 ? (
        <Card className="rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-pink-500/70" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No favourites yet</h3>
            <p className="text-muted-foreground mb-4">
              Save coaches to your favourites for quick access
            </p>
            <Button asChild className="rounded-xl">
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
