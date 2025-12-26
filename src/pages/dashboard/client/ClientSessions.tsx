import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  CalendarX,
  Star,
  ExternalLink,
  Check,
  CalendarDays,
  XCircle,
} from "lucide-react";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";
import { useHasReviewed } from "@/hooks/useReviews";
import { RescheduleSessionModal } from "@/components/dashboard/clients/RescheduleSessionModal";
import { CancelSessionModal } from "@/components/dashboard/clients/CancelSessionModal";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { ShimmerSkeleton } from "@/components/ui/premium-skeleton";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  is_online: boolean | null;
  location: string | null;
  notes: string | null;
  coach_id: string;
  video_meeting_url: string | null;
  coach: {
    display_name: string | null;
  };
}

const ClientSessions = () => {
  const { user } = useAuth();
  const { t } = useTranslation('booking');
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    coachId: string;
    coachName: string;
    sessionId: string;
  }>({ open: false, coachId: "", coachName: "", sessionId: "" });
  
  // Session management states
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  
  const {
    cancelSession,
    rescheduleSession,
    DEFAULT_CANCELLATION_NOTICE_HOURS,
  } = useSessionManagement();

  const fetchSessions = useCallback(async (profileId: string) => {
    const { data } = await supabase
      .from("coaching_sessions")
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        session_type,
        status,
        is_online,
        location,
        notes,
        coach_id,
        video_meeting_url,
        coach:coach_profiles!coaching_sessions_coach_id_fkey (
          display_name
        )
      `)
      .eq("client_id", profileId)
      .order("scheduled_at", { ascending: true });

    setSessions((data as unknown as Session[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      setClientProfileId(profile.id);
      await fetchSessions(profile.id);
    };

    init();
  }, [user, fetchSessions]);

  // REAL-TIME UPDATES: Subscribe to session changes
  useEffect(() => {
    if (!clientProfileId) return;

    const channel = supabase
      .channel(`client-sessions-${clientProfileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coaching_sessions",
          filter: `client_id=eq.${clientProfileId}`,
        },
        () => {
          // Refetch sessions on any change
          fetchSessions(clientProfileId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientProfileId, fetchSessions]);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" && new Date(s.scheduled_at) >= new Date()
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || new Date(s.scheduled_at) < new Date()
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "secondary" | "destructive" | "outline"> = {
      scheduled: "success",
      completed: "secondary",
      cancelled: "destructive",
    };
    const statusLabels: Record<string, string> = {
      scheduled: t('status.scheduled'),
      completed: t('status.completed'),
      cancelled: t('status.cancelled'),
    };
    return <Badge variant={variants[status] || "outline"}>{statusLabels[status] || status}</Badge>;
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const isCompleted = session.status === "completed";
    const isScheduled = session.status === "scheduled";
    const isUpcoming = new Date(session.scheduled_at) >= new Date();
    const canModify = isScheduled && isUpcoming;
    const { data: hasReviewed } = useHasReviewed(isCompleted ? session.id : undefined);

    const handleWriteReview = () => {
      setReviewModal({
        open: true,
        coachId: session.coach_id,
        coachName: session.coach.display_name || "Coach",
        sessionId: session.id,
      });
    };
    
    const handleRescheduleClick = () => {
      setSelectedSession(session);
      setShowReschedule(true);
    };
    
    const handleCancelClick = () => {
      setSelectedSession(session);
      setShowCancel(true);
    };

    return (
      <Card className="rounded-3xl hover:shadow-float transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-lg text-foreground">
                {session.coach.display_name || "Coach"}
              </h4>
              <p className="text-muted-foreground">{session.session_type}</p>
            </div>
            {getStatusBadge(session.status)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">{format(new Date(session.scheduled_at), "PPP")}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">
                {format(new Date(session.scheduled_at), "p")} ({t('sessions.minutes', { count: session.duration_minutes })})
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {session.is_online ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="font-medium">{t('sessions.online')}</span>
                  </div>
                  {session.video_meeting_url && session.status === "scheduled" && (
                    <a
                      href={session.video_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('sessions.joinSession')}
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="font-medium">{session.location || t('sessions.inPerson')}</span>
                </>
              )}
            </div>
          </div>
          
          {isCompleted && !hasReviewed && (
            <Button
              variant="outline"
              className="w-full mt-5 rounded-2xl h-12"
              onClick={handleWriteReview}
            >
              <Star className="w-5 h-5 mr-2" />
              {t('clientSessions.leaveReview')}
            </Button>
          )}
          {isCompleted && hasReviewed && (
            <p className="text-sm text-muted-foreground text-center mt-5 flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-success" />
              {t('clientSessions.reviewSubmitted')}
            </p>
          )}
          {canModify && (
            <div className="flex gap-3 mt-5">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12"
                onClick={handleRescheduleClick}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                {t('clientSessions.reschedule', 'Reschedule')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleCancelClick}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t('clientSessions.cancel', 'Cancel')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="rounded-3xl border-dashed">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
          <CalendarX className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <ClientDashboardLayout
      title={t('clientSessions.title')}
      description={t('clientSessions.description')}
    >
      <PageHelpBanner
        pageKey="client_sessions"
        title="Manage Sessions"
        description="View upcoming appointments, reschedule, or leave reviews for completed sessions"
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">{t('clientSessions.title')}</h1>
        <p className="text-muted-foreground text-lg mt-1">
          {t('clientSessions.description')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-3xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <ShimmerSkeleton className="h-6 w-32" />
                    <ShimmerSkeleton className="h-4 w-24" />
                  </div>
                  <ShimmerSkeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-3">
                  <ShimmerSkeleton className="h-10 w-full rounded-xl" />
                  <ShimmerSkeleton className="h-10 w-full rounded-xl" />
                  <ShimmerSkeleton className="h-10 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-secondary/50 rounded-2xl p-1.5 h-auto">
            <TabsTrigger value="upcoming" className="rounded-xl px-6 py-2.5">
              {t('clientSessions.upcoming')} ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-6 py-2.5">
              {t('clientSessions.past')} ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingSessions.length === 0 ? (
              <EmptyState message={t('clientSessions.noUpcoming')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastSessions.length === 0 ? (
              <EmptyState message={t('clientSessions.noPast')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pastSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <WriteReviewModal
        open={reviewModal.open}
        onOpenChange={(open) => setReviewModal((prev) => ({ ...prev, open }))}
        coachId={reviewModal.coachId}
        coachName={reviewModal.coachName}
        sessionId={reviewModal.sessionId}
      />
      
      {selectedSession && (
        <>
          <RescheduleSessionModal
            open={showReschedule}
            onOpenChange={setShowReschedule}
            currentDate={new Date(selectedSession.scheduled_at)}
            onReschedule={async (newDateTime) => {
              await rescheduleSession.mutateAsync({ 
                sessionId: selectedSession.id, 
                newDateTime 
              });
              toast({
                title: t('clientSessions.rescheduled', 'Session rescheduled'),
                description: t('clientSessions.rescheduledDesc', 'Your session has been rescheduled successfully.'),
              });
              if (clientProfileId) {
                fetchSessions(clientProfileId);
              }
            }}
            isLoading={rescheduleSession.isPending}
          />

          <CancelSessionModal
            open={showCancel}
            onOpenChange={setShowCancel}
            sessionDate={new Date(selectedSession.scheduled_at)}
            onCancel={async (reason, forceCancel) => {
              await cancelSession.mutateAsync({ 
                sessionId: selectedSession.id, 
                reason, 
                forceCancel 
              });
              toast({
                title: t('clientSessions.cancelled', 'Session cancelled'),
                description: t('clientSessions.cancelledDesc', 'Your session has been cancelled.'),
              });
              if (clientProfileId) {
                fetchSessions(clientProfileId);
              }
            }}
            isLoading={cancelSession.isPending}
            cancellationNoticeHours={DEFAULT_CANCELLATION_NOTICE_HOURS}
          />
        </>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientSessions;
