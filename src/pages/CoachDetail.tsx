import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Clock, Calendar, MessageSquare, Loader2, Badge as BadgeIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { SEOHead, createLocalBusinessSchema, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import { useCoachById } from "@/hooks/useCoachMarketplace";
import { useCoachAvailability, useSessionTypes } from "@/hooks/useCoachSchedule";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import BookSessionModal from "@/components/booking/BookSessionModal";
import CoachReviewsSection from "@/components/reviews/CoachReviewsSection";
import CoachPricingSection from "@/components/packages/CoachPricingSection";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

const CoachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coach, isLoading, error } = useCoachById(id || "");
  const { data: availability = [] } = useCoachAvailability(id || "");
  const { data: sessionTypes = [] } = useSessionTypes(id || "");
  const { data: reviews = [] } = useCoachReviews(id);
  const averageRating = calculateAverageRating(reviews);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const { user, role } = useAuth();

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
      <PageLayout title="Loading Coach" description="Loading coach profile">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (error || !coach) {
    return (
      <PageLayout title="Coach Not Found" description="The requested coach profile could not be found">
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Coach not found</p>
          <Button asChild>
            <Link to="/coaches">Browse Coaches</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Generate SEO schema
  const coachSchema = createLocalBusinessSchema({
    name: coach.display_name || "Fitness Coach",
    description: coach.bio || undefined,
    image: coach.profile_image_url || undefined,
    url: `/coaches/${coach.username}`,
    location: coach.location || undefined,
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

  const locationKeywords = coach.location 
    ? [`personal trainer ${coach.location}`, `fitness coach ${coach.location}`] 
    : [];

  const primaryCoachType = coach.coach_types?.[0] || "Fitness";

  return (
    <>
      <SEOHead
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
      />
      <PageLayout 
        title={`${coach.display_name || "Coach"} - Coach Profile`}
        description={coach.bio || `View ${coach.display_name}'s coaching profile and connect with them`}
      >
        <div className="min-h-screen bg-background">
          {/* Back Button */}
          <div className="container mx-auto px-4 pt-24 pb-4">
            <Button variant="ghost" asChild size="sm">
              <Link to="/coaches">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Coaches
              </Link>
            </Button>
          </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* 4. Social Media Links */}
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

              {/* 5. Gallery Section */}
              <CoachGallerySection coachId={id || ""} />

              {/* 6. Pricing & Packages */}
              <CoachPricingSection coachId={id || ""} />

              {/* 7. Group Classes */}
              <CoachGroupClassesSection coachId={id || ""} />

              {/* 8. Digital Products */}
              <CoachDigitalProductsSection coachId={id || ""} />

              {/* 9. Reviews Section */}
              <CoachReviewsSection coachId={id || ""} />
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="lg:sticky lg:top-24 shadow-lg border-border/50">
                <CardContent className="p-6">
                  {/* Price Display */}
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    {coach.hourly_rate ? (
                      <>
                        <p className="text-4xl font-bold text-foreground">
                          {formatCurrency(coach.hourly_rate, (coach.currency as CurrencyCode) || 'GBP')}
                        </p>
                        <p className="text-muted-foreground mt-1">per session</p>
                      </>
                    ) : (
                      <p className="text-lg text-muted-foreground">Contact for pricing</p>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    {user && (role === "client" || role === "admin") ? (
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
                          Message Coach
                        </Button>
                        <Button 
                          className="w-full" 
                          size="lg"
                          variant="outline"
                          onClick={() => setShowBookingModal(true)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                        <div className="pt-2">
                          <Button 
                            className="w-full" 
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRequestModal(true)}
                          >
                            Request Connection
                          </Button>
                        </div>
                      </>
                    ) : user ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sign in as a client to connect with this coach
                      </p>
                    ) : (
                      <>
                        <Button className="w-full" size="lg" asChild>
                          <Link to="/auth?tab=register&role=client">
                            Sign Up to Connect
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Create an account to connect with coaches
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
                      <span className="text-muted-foreground">Usually responds within 24 hours</span>
                    </div>
                    {sessionTypes.length > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">
                          {sessionTypes.length} session type{sessionTypes.length > 1 ? 's' : ''} available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mini Availability Preview */}
                  {availability.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-3">Available Days</p>
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
    </>
  );
};

export default CoachDetail;
