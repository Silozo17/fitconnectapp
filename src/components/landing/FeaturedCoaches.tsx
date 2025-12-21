import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight, CheckCircle, Loader2, Users } from "lucide-react";
import { useCoachMarketplace } from "@/hooks/useCoachMarketplace";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getDisplayLocation } from "@/lib/location-utils";

const FeaturedCoaches = () => {
  const { t } = useTranslation('landing');
  const { location, isLoading: locationLoading } = useUserLocation();
  
  // Build location search string
  const locationSearch = location?.city || location?.region || location?.country || "";
  
  const { data: coaches, isLoading: coachesLoading } = useCoachMarketplace({
    location: locationSearch,
    limit: 4,
    featured: true,
    realCoachesOnly: true,
  });

  // Fallback to all coaches if no local coaches found
  const { data: fallbackCoaches } = useCoachMarketplace({
    limit: 4,
    featured: true,
    realCoachesOnly: true,
  });

  const displayCoaches = coaches?.length ? coaches : fallbackCoaches;
  const isLoading = locationLoading || coachesLoading;
  const locationLabel = location?.city || location?.region || location?.country || "Your Area";

  const coachesToShow = displayCoaches || [];

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-teal/10 text-gradient-teal font-medium text-sm mb-4">
              {t('featuredCoaches.badge')}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              {t('featuredCoaches.title')} <span className="gradient-text-teal">{t('featuredCoaches.titleHighlight')}</span>
            </h2>
            {!isLoading && coachesToShow.length > 0 && (
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('featuredCoaches.showingNear', { location: locationLabel })}
              </p>
            )}
          </div>
          <Button
            asChild
            variant="outline"
            className="border-border text-foreground hover:bg-secondary rounded-xl"
          >
            <Link to="/coaches">
              {t('featuredCoaches.viewAll')}
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

        {/* Empty State */}
        {!isLoading && coachesToShow.length === 0 && (
          <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-border/50">
            <div className="max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {t('featuredCoaches.noCoachesTitle')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('featuredCoaches.noCoachesMessage')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/for-coaches">{t('featuredCoaches.becomeCoach')}</Link>
                </Button>
                <Button asChild className="rounded-xl">
                  <Link to="/coaches">{t('featuredCoaches.exploreAll')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Coaches Grid */}
        {!isLoading && coachesToShow.length > 0 && (
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
                    src={coach.profile_image_url || coach.card_image_url || ""}
                    alt={coach.display_name || "Coach"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {coach.is_verified && (
                    <div className="absolute top-3 right-3">
                      <Badge className="gradient-bg-primary text-white border-0 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('featuredCoaches.verified')}
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
                      ({coach.reviews_count || 0} {t('featuredCoaches.reviews')})
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
                    {getDisplayLocation(coach)}
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
                      £{coach.hourly_rate || 50}{t('featuredCoaches.perSession')}
                    </span>
                    <span className="text-primary text-sm font-medium group-hover:underline">
                      {t('featuredCoaches.viewProfile')}
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
