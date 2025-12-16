import { Link } from "react-router-dom";
import { Heart, Loader2, MapPin, Star, Video, Users } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavouriteCoaches } from "@/hooks/useFavourites";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import StarRating from "@/components/reviews/StarRating";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

const FavouriteCoachCard = ({ coach }: { coach: any }) => {
  const { data: reviews = [] } = useCoachReviews(coach.id);
  const averageRating = calculateAverageRating(reviews);

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
              {coach.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {coach.location}
                </p>
              )}
            </div>
            <StarRating rating={averageRating} reviewCount={reviews.length} size="sm" />
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
              <Link to={`/coaches/${coach.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ClientFavourites = () => {
  const { data: coaches = [], isLoading } = useFavouriteCoaches();

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
              <Link to="/coaches">Browse Coaches</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <FavouriteCoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientFavourites;
