import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowRight, CheckCircle, Loader2, Users, Target, Globe, ShieldCheck } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useFeaturedCoaches } from "@/hooks/useFeaturedCoaches";
import { useCountry } from "@/hooks/useCountry";
import { getDisplayLocation } from "@/lib/location-utils";
import { BenefitCard } from "./BenefitCard";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { getCoachTypeDisplayLabel } from "@/constants/coachTypes";
import fallbackCoachImage from "@/assets/fallback-coach.webp";

const FeaturedCoaches = () => {
  const { t } = useTranslation('landing');
  const { location, isLoading: locationLoading } = useUserLocation();
  const { countryCode, isLoading: countryLoading } = useCountry();
  
  // Defer fetching until location is resolved to prevent double-render with reordering
  const isLocationReady = !locationLoading && !countryLoading;
  
  // Use dedicated hook for featured coaches with quality-based sorting
  // Pass countryCode to enforce strict country filtering based on user's selected location
  const { coaches: coachesToShow, isLoading: coachesLoading, locationLabel } = useFeaturedCoaches({
    userLocation: location,
    countryCode, // Strict filtering by selected country
    enabled: isLocationReady, // Only fetch when location is resolved
  });

  const isLoading = !isLocationReady || coachesLoading;

  return (
    <section className="relative py-24 md:py-32 bg-background">
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

        {/* Empty State - Benefits Grid */}
        {!isLoading && coachesToShow.length === 0 && (
          <div className="space-y-8">
            {/* Benefits Grid - Maintains same layout as coach cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BenefitCard 
                icon={<ShieldCheck className="w-6 h-6" />}
                title={t('featuredCoaches.benefits.verified.title')}
                description={t('featuredCoaches.benefits.verified.description')}
              />
              <BenefitCard 
                icon={<Target className="w-6 h-6" />}
                title={t('featuredCoaches.benefits.personalized.title')}
                description={t('featuredCoaches.benefits.personalized.description')}
              />
              <BenefitCard 
                icon={<Globe className="w-6 h-6" />}
                title={t('featuredCoaches.benefits.flexible.title')}
                description={t('featuredCoaches.benefits.flexible.description')}
              />
              <BenefitCard 
                icon={<Star className="w-6 h-6" />}
                title={t('featuredCoaches.benefits.quality.title')}
                description={t('featuredCoaches.benefits.quality.description')}
              />
            </div>
            
            {/* CTA Section */}
            <div className="text-center py-10 bg-gradient-to-br from-primary/5 to-secondary/30 rounded-2xl border border-border/50">
              <div className="max-w-md mx-auto px-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {t('featuredCoaches.noCoachesTitle')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('featuredCoaches.noCoachesMessage')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="rounded-xl">
                    <Link to="/for-coaches">{t('featuredCoaches.becomeCoach')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to="/coaches">{t('featuredCoaches.exploreAll')}</Link>
                  </Button>
                </div>
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
                className="group glass-card overflow-hidden hover-lift"
              >
                {/* Image - 3-tier fallback matching CoachCard */}
                <div className="relative aspect-square overflow-hidden">
                  {(coach.card_image_url || coach.profile_image_url) ? (
                    <img
                      src={coach.card_image_url || coach.profile_image_url || ""}
                      alt={coach.display_name || "Coach"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : coach.avatars?.slug ? (
                    <div className="w-full h-full overflow-hidden bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-400 group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={getAvatarImageUrl(coach.avatars.slug)} 
                        alt={coach.display_name || "Coach"} 
                        className="w-full h-[180%] object-contain object-top"
                      />
                    </div>
                  ) : (
                    <img 
                      src={fallbackCoachImage} 
                      alt={coach.display_name || "Coach"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
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
                    {getCoachTypeDisplayLabel(coach.coach_types?.[0] || "personal_training")}
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
