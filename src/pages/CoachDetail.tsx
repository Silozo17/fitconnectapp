import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Clock, Calendar, MessageSquare, Loader2, Badge as BadgeIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { createLocalBusinessSchema, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import { useCoachById } from "@/hooks/useCoachMarketplace";
import { useCoachAvailability, useSessionTypes } from "@/hooks/useCoachSchedule";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import BookSessionModal from "@/components/booking/BookSessionModal";
import CoachReviewsSection from "@/components/reviews/CoachReviewsSection";
import CoachPricingSection from "@/components/packages/CoachPricingSection";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CoachGallerySection } from "@/components/coach/CoachGallerySection";
import { CoachGroupClassesSection } from "@/components/coach/CoachGroupClassesSection";
import { CoachHeroSection } from "@/components/coach/CoachHeroSection";
import { CoachQuickStats } from "@/components/coach/CoachQuickStats";
import { CoachAboutSection } from "@/components/coach/CoachAboutSection";
import { CoachSocialLinksDisplay } from "@/components/coach/CoachSocialLinksDisplay";
import { CoachSocialLinksSection } from "@/components/coach/CoachSocialLinksSection";
import { CoachDigitalProductsSection } from "@/components/coach/CoachDigitalProductsSection";
import { CoachQualificationsSection } from "@/components/coach/CoachQualificationsSection";
import { CoachTransformationsSection } from "@/components/coach/CoachTransformationsSection";
import { CoachCaseStudiesSection } from "@/components/coach/CoachCaseStudiesSection";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { getDisplayLocation } from "@/lib/location-utils";
import { useTranslation } from "@/hooks/useTranslation";

const CoachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('coaches');
  const { data: coach, isLoading, error } = useCoachById(id || "");
  const { convertForViewer } = useExchangeRates();
  
  // Use coach.id (UUID) for all queries - only run after coach is loaded
  const coachId = coach?.id;
  const { data: availability = [] } = useCoachAvailability(coachId || "");
  const { data: sessionTypes = [] } = useSessionTypes(coachId || "");
  const { data: reviews = [] } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const { user, allRoles } = useAuth();
  const { activeProfileType } = useAdminView();

  const handleMessageCoach = async () => {
    if (!user || !coach) return;
    
    setStartingConversation(true);
    try {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) {
        toast.error("Please complete your profile first");
        return;
      }

      navigate(`/dashboard/client/messages/${coach.id}`);
    } catch (error) {
      toast.error("Failed to start conversation");
    } finally {
      setStartingConversation(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title={t('detail.loading')} description={t('detail.loading')} noIndex={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !coach) {
    return (
      <PageLayout title={t('detail.coachNotFound')} description={t('detail.coachNotFound')}>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{t('detail.coachNotFound')}</p>
          <Button asChild>
            <Link to="/coaches">{t('detail.browseCoaches')}</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Convert coach's hourly rate for viewer
  const coachCurrency = (coach.currency as CurrencyCode) || 'GBP';
  const convertedRate = coach.hourly_rate 
    ? convertForViewer(coach.hourly_rate, coachCurrency)
    : null;

  // Generate SEO schema - use unified location display
  const displayLocation = getDisplayLocation(coach);
  const coachSchema = createLocalBusinessSchema({
    name: coach.display_name || "Fitness Coach",
    description: coach.bio || undefined,
    image: coach.profile_image_url || undefined,
    url: `/coaches/${coach.username}`,
    location: displayLocation !== "Location not set" ? displayLocation : undefined,
    priceRange: coach.hourly_rate ? (coach.hourly_rate > 80 ? "£££" : coach.hourly_rate > 40 ? "££" : "£") : "££",
    rating: averageRating > 0 ? averageRating : undefined,
    reviewCount: reviews.length > 0 ? reviews.length : undefined,
    coachTypes: coach.coach_types || undefined,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Coaches", url: "/coaches" },
    { name: coach.display_name || "Coach", url: `/coaches/${coach.username}` },
  ]);

  const coachTypeKeywords = coach.coach_types?.map(type => 
    `${type.toLowerCase()} coach UK`
  ) || [];

  const locationKeywords = displayLocation !== "Location not set"
    ? [`personal trainer ${displayLocation}`, `fitness coach ${displayLocation}`] 
    : [];

  const primaryCoachType = coach.coach_types?.[0] || "Fitness";

  return (
    <PageLayout 
      title={`${coach.display_name || "Coach"} - ${primaryCoachType} Coach`}
      description={coach.bio?.slice(0, 155) || `Connect with ${coach.display_name}, a verified ${primaryCoachType.toLowerCase()} coach on FitConnect. Book sessions, view reviews, and start your fitness journey.`}
      canonicalPath={`/coaches/${coach.username}`}
      ogType="profile"
      ogImage={coach.profile_image_url || undefined}
      keywords={[
        ...coachTypeKeywords,
        ...locationKeywords,
        "book personal trainer",
        "fitness coaching",
        "verified coach",
      ]}
      schema={[coachSchema, breadcrumbSchema]}
    >
        <div className="min-h-screen bg-background pt-safe-status">
          {/* Back Button */}
          <div className="container mx-auto px-4 pt-16 md:pt-24 pb-4">
            <Button variant="ghost" asChild size="sm">
              <Link to="/coaches">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('detail.backToCoaches')}
              </Link>
            </Button>
          </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6 overflow-hidden">
              {/* 1. Hero Section */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CoachHeroSection 
                  coach={coach}
                  averageRating={averageRating}
                  reviewCount={reviews.length}
                />
              </Card>

              {/* 2. Quick Stats Bar */}
              <CoachQuickStats
                experienceYears={coach.experience_years}
                onlineAvailable={coach.online_available}
                inPersonAvailable={coach.in_person_available}
                reviewCount={reviews.length}
                averageRating={averageRating}
              />

              {/* 3. About Section (Combined) */}
              <CoachAboutSection 
                bio={coach.bio}
                whoIWorkWith={coach.who_i_work_with}
              />

              {/* 4. Qualifications & Certifications */}
              <CoachQualificationsSection coachId={coach.id} />

              {/* 5. Social Media Links */}
              <CoachSocialLinksDisplay 
                socialLinks={{
                  facebook_url: coach.facebook_url,
                  instagram_url: coach.instagram_url,
                  tiktok_url: coach.tiktok_url,
                  x_url: coach.x_url,
                  threads_url: coach.threads_url,
                  linkedin_url: coach.linkedin_url,
                  youtube_url: coach.youtube_url,
                }}
              />

              {/* 6. Gallery Section */}
              <CoachGallerySection coachId={coach.id} />

              {/* 7. Transformations Section */}
              <CoachTransformationsSection coachId={coach.id} />

              {/* 8. Case Studies Section */}
              <CoachCaseStudiesSection coachId={coach.id} />

              {/* 9. Pricing & Packages */}
              <CoachPricingSection coachId={coach.id} />

              {/* 10. Group Classes */}
              <CoachGroupClassesSection coachId={coach.id} />

              {/* 11. Digital Products */}
              <CoachDigitalProductsSection coachId={coach.id} />

              {/* 12. Reviews Section */}
              <CoachReviewsSection coachId={coach.id} />
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="lg:sticky lg:top-24 shadow-lg border-border/50">
                <CardContent className="p-6">
                  {/* Price Display */}
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    {convertedRate ? (
                      <>
                        <p className="text-4xl font-bold text-foreground">
                          {formatCurrency(convertedRate.amount, convertedRate.currency)}
                        </p>
                        <p className="text-muted-foreground mt-1">{t('detail.perSession')}</p>
                        {convertedRate.wasConverted && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ({formatCurrency(convertedRate.originalAmount, convertedRate.originalCurrency)})
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg text-muted-foreground">{t('detail.contactForPricing')}</p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    {user && (activeProfileType === "client" || activeProfileType === "admin" || allRoles.includes("client")) ? (
                      <>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleMessageCoach}
                          disabled={startingConversation}
                        >
                          {startingConversation ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4 mr-2" />
                          )}
                          {t('detail.messageCoach')}
                        </Button>
                        <Button 
                          className="w-full" 
                          size="lg"
                          variant="outline"
                          onClick={() => setShowBookingModal(true)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('detail.bookSession')}
                        </Button>
                        <div className="pt-2">
                          <Button 
                            className="w-full" 
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRequestModal(true)}
                          >
                            {t('detail.requestConnection')}
                          </Button>
                        </div>
                      </>
                    ) : user ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t('detail.signInAsClient')}
                      </p>
                    ) : (
                      <>
                        <Button className="w-full" size="lg" asChild>
                          <Link to="/auth?tab=register&role=client">
                            {t('detail.signUpToConnect')}
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          {t('detail.createAccountToConnect')}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{t('detail.respondsWithin')}</span>
                    </div>
                    {sessionTypes.length > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">
                          {t('detail.sessionTypesAvailable', { count: sessionTypes.length, plural: sessionTypes.length > 1 ? 's' : '' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mini Availability Preview */}
                  {availability.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-3">{t('detail.availableDays')}</p>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                          const dayAvail = availability.find(a => a.day_of_week === index && a.is_active);
                          return (
                            <Badge 
                              key={day} 
                              variant={dayAvail ? "default" : "secondary"}
                              className={dayAvail ? "" : "opacity-40"}
                            >
                              {day}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

        <RequestConnectionModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          coach={coach}
        />

        <BookSessionModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          coach={coach}
          onMessageFirst={handleMessageCoach}
        />
    </PageLayout>
  );
};

export default CoachDetail;