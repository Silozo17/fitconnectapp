import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Loader2, Users, Target, Globe, ShieldCheck, Star } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useFeaturedCoaches, SimplifiedCoach } from "@/hooks/useFeaturedCoaches";
import { useCountry } from "@/hooks/useCountry";
import { BenefitCard } from "./BenefitCard";
import fallbackCoachImage from "@/assets/fallback-coach.webp";

const FeaturedCoaches = () => {
  const { t } = useTranslation('landing');
  const { location, isLoading: locationLoading } = useUserLocation();
  const { countryCode, isLoading: countryLoading } = useCountry();
  
  const isLocationReady = !locationLoading && !countryLoading;
  
  const { coaches: coachesToShow, isLoading: coachesLoading, locationLabel } = useFeaturedCoaches({
    userLocation: location,
    countryCode,
    enabled: isLocationReady,
  });

  const isLoading = !isLocationReady || coachesLoading;

  // Helper to get display location
  const getDisplayLocation = (coach: SimplifiedCoach) => {
    return coach.location_country || 'Unknown location';
  };

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

        {/* Coaches Grid - Minimal display */}
        {!isLoading && coachesToShow.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coachesToShow.map((coach) => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.username || coach.id}`}
                className="group glass-card overflow-hidden hover-lift"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={coach.card_image_url || coach.profile_image_url || fallbackCoachImage}
                    alt={coach.display_name || "Coach"}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    {coach.display_name || "Coach"}
                  </h3>

                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <MapPin className="w-3 h-3" />
                    {getDisplayLocation(coach)}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
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
