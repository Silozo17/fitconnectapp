import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useCoachMarketplace } from "@/hooks/useCoachMarketplace";
import { useUserLocation } from "@/hooks/useUserLocation";

const FeaturedCoaches = () => {
  const { location, isLoading: locationLoading } = useUserLocation();
  
  // Build location search string
  const locationSearch = location?.city || location?.region || location?.country || "";
  
  const { data: coaches, isLoading: coachesLoading } = useCoachMarketplace({
    location: locationSearch,
    limit: 4,
    featured: true,
  });

  // Fallback to all coaches if no local coaches found
  const { data: fallbackCoaches } = useCoachMarketplace({
    limit: 4,
    featured: true,
  });

  const displayCoaches = coaches?.length ? coaches : fallbackCoaches;
  const isLoading = locationLoading || coachesLoading;
  const locationLabel = location?.city || location?.region || location?.country || "Your Area";

  // Mock data fallback when no database coaches exist
  const mockCoaches = [
    {
      id: "1",
      display_name: "Marcus Johnson",
      coach_types: ["Personal Trainer"],
      location: "London, UK",
      hourly_rate: 60,
      is_verified: true,
      profile_image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews_count: 127,
      tags: ["Weight Loss", "Strength"],
    },
    {
      id: "2",
      display_name: "Sarah Chen",
      coach_types: ["Nutritionist"],
      location: "Manchester, UK",
      hourly_rate: 45,
      is_verified: true,
      profile_image_url: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop",
      rating: 5.0,
      reviews_count: 89,
      tags: ["Meal Planning", "Vegan"],
    },
    {
      id: "3",
      display_name: "David Okonkwo",
      coach_types: ["Boxing Coach"],
      location: "Birmingham, UK",
      hourly_rate: 55,
      is_verified: true,
      profile_image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews_count: 156,
      tags: ["Boxing", "Conditioning"],
    },
    {
      id: "4",
      display_name: "Emma Williams",
      coach_types: ["MMA Coach"],
      location: "Leeds, UK",
      hourly_rate: 65,
      is_verified: true,
      profile_image_url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews_count: 72,
      tags: ["MMA", "Self Defense"],
    },
  ];

  const coachesToShow = displayCoaches?.length ? displayCoaches : mockCoaches;

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-teal/10 text-gradient-teal font-medium text-sm mb-4">
              TOP RATED
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Featured <span className="gradient-text-teal">Coaches</span>
            </h2>
            {!isLoading && (
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Showing coaches near {locationLabel}
              </p>
            )}
          </div>
          <Button
            asChild
            variant="outline"
            className="border-border text-foreground hover:bg-secondary rounded-xl"
          >
            <Link to="/coaches">
              View All Coaches
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Coaches Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachesToShow.map((coach) => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.username || coach.id}`}
                className="group card-elevated overflow-hidden hover-lift"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={coach.profile_image_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"}
                    alt={coach.display_name || "Coach"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {coach.is_verified && (
                    <div className="absolute top-3 right-3">
                      <Badge className="gradient-bg-primary text-white border-0 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">
                      {coach.rating || 4.8}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({coach.reviews_count || 0} reviews)
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    {coach.display_name || "Coach"}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">
                    {coach.coach_types?.[0] || "Personal Trainer"}
                  </p>

                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <MapPin className="w-3 h-3" />
                    {coach.location || "United Kingdom"}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(coach.tags || []).slice(0, 2).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground text-xs rounded-lg"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-display font-bold text-foreground">
                      £{coach.hourly_rate || 50}/session
                    </span>
                    <span className="text-primary text-sm font-medium group-hover:underline">
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCoaches;
