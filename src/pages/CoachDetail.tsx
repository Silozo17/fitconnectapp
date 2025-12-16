import { useParams, Link } from "react-router-dom";
import { 
  Star, MapPin, Video, Users, BadgeCheck, ArrowLeft, 
  Clock, Award, Calendar, MessageSquare, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { useCoachById } from "@/hooks/useCoachMarketplace";
import RequestConnectionModal from "@/components/coaches/RequestConnectionModal";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const CoachDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: coach, isLoading, error } = useCoachById(id || "");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { user, role } = useAuth();

  const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;

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
        <div className="container mx-auto px-4 pt-6">
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
                      <img
                        src={coach.profile_image_url || defaultImage}
                        alt={coach.display_name || "Coach"}
                        className="h-32 w-32 rounded-2xl object-cover ring-4 ring-border"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-foreground">
                            {coach.display_name || "Coach"}
                          </h1>
                          {coach.location && (
                            <p className="text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4" />
                              {coach.location}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full">
                          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                          <span className="font-semibold text-amber-600">New</span>
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
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {coach.hourly_rate ? (
                      <>
                        <p className="text-3xl font-bold text-foreground">
                          ${coach.hourly_rate}
                        </p>
                        <p className="text-muted-foreground">per session</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Contact for pricing</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {user && role === "client" ? (
                      <>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => setShowRequestModal(true)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Connection
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Send a request to connect with this coach
                        </p>
                      </>
                    ) : user ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Sign in as a client to request a connection
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Flexible scheduling available</span>
                    </div>
                  </div>
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
    </PageLayout>
  );
};

export default CoachDetail;
