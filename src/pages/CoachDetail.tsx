import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Star, MapPin, Video, Users, ArrowLeft, 
  Clock, Award, Calendar, MessageSquare, Loader2, Building 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { useCoachById } from "@/hooks/useCoachMarketplace";
import { useCoachAvailability, useSessionTypes } from "@/hooks/useCoachSchedule";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import BookSessionModal from "@/components/booking/BookSessionModal";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import CoachReviewsSection from "@/components/reviews/CoachReviewsSection";
import StarRating from "@/components/reviews/StarRating";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import CoachPricingSection from "@/components/packages/CoachPricingSection";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { useCoachReviews, calculateAverageRating } from "@/hooks/useReviews";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";

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
      // Get client profile ID
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) {
        toast.error("Please complete your profile first");
        return;
      }

      // Check if conversation already exists by looking for any messages
      const { data: existingMessages } = await supabase
        .from("messages")
        .select("id")
        .or(`and(sender_id.eq.${clientProfile.id},receiver_id.eq.${coach.id}),and(sender_id.eq.${coach.id},receiver_id.eq.${clientProfile.id})`)
        .limit(1);

      // Navigate to messages with this coach
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

  return (
    <PageLayout 
      title={`${coach.display_name || "Coach"} - Coach Profile`}
      description={coach.bio || `View ${coach.display_name}'s coaching profile and connect with them`}
    >
      <div className="min-h-screen bg-background">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-20 sm:pt-6">
          <Button variant="ghost" asChild size="sm">
            <Link to="/coaches">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Coaches
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative flex-shrink-0">
                      {coach.profile_image_url ? (
                        <img
                          src={coach.profile_image_url}
                          alt={coach.display_name || "Coach"}
                          className="h-32 w-32 rounded-2xl object-cover ring-4 ring-border"
                        />
                      ) : (
                        <UserAvatar
                          src={null}
                          name={coach.display_name}
                          className="h-32 w-32 text-4xl ring-4 ring-border rounded-2xl"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">
                              {coach.display_name || "Coach"}
                            </h1>
                            {coach.is_verified && (
                              <VerifiedBadge verifiedAt={coach.verified_at} size="md" />
                            )}
                          </div>
                          {coach.location && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {coach.location}
                            </p>
                          )}
                          {coach.gym_affiliation && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <Building className="h-4 w-4" />
                              {coach.gym_affiliation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating 
                            rating={averageRating} 
                            reviewCount={reviews.length} 
                            size="lg"
                          />
                          <FavouriteButton coachId={coach.id} />
                        </div>
                      </div>

                      {/* Coach Types */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {coach.coach_types?.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {coach.experience_years && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Award className="h-4 w-4" />
                            {coach.experience_years} years experience
                          </span>
                        )}
                        {coach.online_available && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Video className="h-4 w-4" />
                            Online Sessions
                          </span>
                        )}
                        {coach.in_person_available && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Users className="h-4 w-4" />
                            In-Person
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {coach.bio ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{coach.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio available</p>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Section */}
              <CoachPricingSection coachId={id || ""} />

              {/* Reviews Section */}
              <CoachReviewsSection coachId={id || ""} />
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {coach.hourly_rate ? (
                      <>
                        <p className="text-3xl font-bold text-foreground">
                          {formatCurrency(coach.hourly_rate, (coach.currency as CurrencyCode) || 'GBP')}
                        </p>
                        <p className="text-muted-foreground">per session</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Contact for pricing</p>
                    )}
                  </div>

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
                        <p className="text-xs text-muted-foreground text-center">
                          Or send a connection request first
                        </p>
                        <Button 
                          className="w-full" 
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRequestModal(true)}
                        >
                          Request Connection
                        </Button>
                      </>
                    ) : user ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Sign in as a client to connect with this coach
                      </p>
                    ) : (
                      <>
                        <Button className="w-full" size="lg" asChild>
                          <Link to="/auth?tab=register&role=client">
                            Sign Up to Connect
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Create an account to connect with coaches
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Usually responds within 24 hours</span>
                    </div>
                    {sessionTypes.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{sessionTypes.length} session type{sessionTypes.length > 1 ? 's' : ''} available</span>
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
                              className={dayAvail ? "" : "opacity-50"}
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
