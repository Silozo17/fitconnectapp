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
} from "lucide-react";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";
import { useHasReviewed } from "@/hooks/useReviews";

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    coachId: string;
    coachName: string;
    sessionId: string;
  }>({ open: false, coachId: "", coachName: "", sessionId: "" });

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
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
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
    const { data: hasReviewed } = useHasReviewed(isCompleted ? session.id : undefined);

    const handleWriteReview = () => {
      setReviewModal({
        open: true,
        coachId: session.coach_id,
        coachName: session.coach.display_name || "Coach",
        sessionId: session.id,
      });
    };

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-foreground">
                {session.coach.display_name || "Coach"}
              </h4>
              <p className="text-sm text-muted-foreground">{session.session_type}</p>
            </div>
            {getStatusBadge(session.status)}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(session.scheduled_at), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(session.scheduled_at), "p")} ({t('sessions.minutes', { count: session.duration_minutes })})
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {session.is_online ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>{t('sessions.online')}</span>
                  </div>
                  {session.video_meeting_url && session.status === "scheduled" && (
                    <a
                      href={session.video_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('sessions.joinSession')}
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>{session.location || t('sessions.inPerson')}</span>
                </>
              )}
            </div>
          </div>
          {isCompleted && !hasReviewed && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={handleWriteReview}
            >
              <Star className="w-4 h-4 mr-2" />
              {t('clientSessions.leaveReview')}
            </Button>
          )}
          {isCompleted && hasReviewed && (
            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              <Check className="w-3 h-3" />
              {t('clientSessions.reviewSubmitted')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="py-12 text-center">
        <CalendarX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <ClientDashboardLayout
      title={t('clientSessions.title')}
      description={t('clientSessions.description')}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('clientSessions.title')}</h1>
        <p className="text-muted-foreground">
          {t('clientSessions.description')}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              {t('clientSessions.upcoming')} ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t('clientSessions.past')} ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingSessions.length === 0 ? (
              <EmptyState message={t('clientSessions.noUpcoming')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </ClientDashboardLayout>
  );
};

export default ClientSessions;
