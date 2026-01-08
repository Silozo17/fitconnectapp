import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Clock, Calendar, MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
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
import { CoachDigitalProductsSection } from "@/components/coach/CoachDigitalProductsSection";
import { CoachQualificationsSection } from "@/components/coach/CoachQualificationsSection";
import { MobileBookingCard } from "@/components/coach/MobileBookingBar";

const ClientCoachProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: coach, isLoading, error } = useCoachById(username || "");
  
  const coachId = coach?.id;
  const { data: availability = [] } = useCoachAvailability(coachId || "");
  const { data: sessionTypes = [] } = useSessionTypes(coachId || "");
  const { data: reviews = [] } = useCoachReviews(coachId);
  const averageRating = calculateAverageRating(reviews);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const { user } = useAuth();
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
      <ClientDashboardLayout title="Loading Coach" description="Loading coach profile">
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  if (error || !coach) {
    return (
      <ClientDashboardLayout title="Coach Not Found" description="The requested coach profile could not be found">
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Coach not found</p>
          <Button asChild className="rounded-xl">
            <Link to="/dashboard/client/find-coaches">Browse Coaches</Link>
          </Button>
        </div>
      </ClientDashboardLayout>
    );
  }

  const isClient = user && (activeProfileType === "client" || activeProfileType === "admin");

  return (
    <ClientDashboardLayout 
      title={`${coach.display_name || "Coach"} - Coach Profile`}
      description={coach.bio || `View ${coach.display_name}'s coaching profile`}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="rounded-xl">
          <Link to="/dashboard/client/find-coaches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Find Coaches
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card className="rounded-3xl overflow-hidden border-0 shadow-lg">
            <CoachHeroSection 
              coach={coach}
              averageRating={averageRating}
              reviewCount={reviews.length}
            />
          </Card>

          {/* Quick Stats */}
          <CoachQuickStats
            experienceYears={coach.experience_years}
            onlineAvailable={coach.online_available}
            inPersonAvailable={coach.in_person_available}
            reviewCount={reviews.length}
            averageRating={averageRating}
          />

          {/* About Section */}
          <CoachAboutSection 
            bio={coach.bio}
            whoIWorkWith={coach.who_i_work_with}
          />

          {/* Qualifications & Certifications */}
          <CoachQualificationsSection coachId={coach.id} />

          {/* Social Media Links */}
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

          {/* Gallery Section */}
          <CoachGallerySection coachId={coach.id} />

          {/* Pricing & Packages */}
          <CoachPricingSection coachId={coach.id} />

          {/* Group Classes */}
          <CoachGroupClassesSection coachId={coach.id} />

          {/* Digital Products */}
          <CoachDigitalProductsSection coachId={coach.id} />

          {/* Reviews Section */}
          <CoachReviewsSection coachId={coach.id} />

          {/* Mobile Booking Card - shows at bottom of content on mobile */}
          <MobileBookingCard
            hourlyRate={coach.hourly_rate}
            currency={(coach.currency as any) || 'GBP'}
            onMessage={handleMessageCoach}
            onBook={() => setShowBookingModal(true)}
            isMessageLoading={startingConversation}
            isClient={isClient}
          />
        </div>

        {/* Sidebar - Booking Card (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-1 order-first lg:order-last">
          <Card className="rounded-3xl lg:sticky lg:top-24 shadow-lg border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl">
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
                {isClient && (
                  <>
                    <Button 
                      className="w-full rounded-2xl h-12" 
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
                      className="w-full rounded-2xl h-12" 
                      size="lg"
                      variant="outline"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <div className="pt-2">
                      <Button 
                        className="w-full rounded-xl" 
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRequestModal(true)}
                      >
                        Request Connection
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Info Section */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">Usually responds within 24 hours</span>
                </div>
                {sessionTypes.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted">
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
                          className={`rounded-lg ${dayAvail ? "" : "opacity-40"}`}
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
    </ClientDashboardLayout>
  );
};

export default ClientCoachProfile;
