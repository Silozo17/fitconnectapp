import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  CalendarX,
} from "lucide-react";

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  is_online: boolean | null;
  location: string | null;
  notes: string | null;
  coach: {
    display_name: string | null;
  };
}

const ClientSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
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
          coach:coach_profiles!coaching_sessions_coach_id_fkey (
            display_name
          )
        `)
        .eq("client_id", profile.id)
        .order("scheduled_at", { ascending: true });

      setSessions((data as unknown as Session[]) || []);
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

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
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const SessionCard = ({ session }: { session: Session }) => (
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
              {format(new Date(session.scheduled_at), "p")} ({session.duration_minutes} min)
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {session.is_online ? (
              <>
                <Video className="w-4 h-4" />
                <span>Online Session</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>{session.location || "In Person"}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
      title="Sessions"
      description="View and manage your coaching sessions"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
        <p className="text-muted-foreground">
          Manage your coaching sessions
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
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingSessions.length === 0 ? (
              <EmptyState message="No upcoming sessions scheduled" />
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
              <EmptyState message="No past sessions" />
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
    </ClientDashboardLayout>
  );
};

export default ClientSessions;
