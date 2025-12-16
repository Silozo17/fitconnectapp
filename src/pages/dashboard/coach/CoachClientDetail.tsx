import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Target,
  Clock,
  Scale,
  Activity,
  Plus,
  Edit,
  FileText,
  Dumbbell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ScheduleSessionModal } from "@/components/dashboard/clients/ScheduleSessionModal";
import { SessionDetailModal } from "@/components/dashboard/clients/SessionDetailModal";
import { AddNoteModal } from "@/components/dashboard/clients/AddNoteModal";
import { AddProgressModal } from "@/components/dashboard/clients/AddProgressModal";
import { AssignPlanModal } from "@/components/dashboard/clients/AssignPlanModal";
import { ProgressChart } from "@/components/dashboard/clients/ProgressChart";
import { GoalProgressCard } from "@/components/dashboard/clients/GoalProgressCard";
import { NoteCard } from "@/components/dashboard/clients/NoteCard";
import { SessionCalendar } from "@/components/dashboard/clients/SessionCalendar";
import { HealthProfileCard } from "@/components/dashboard/clients/HealthProfileCard";
import HabitManager from "@/components/dashboard/clients/HabitManager";
import { 
  useClientDetail, 
  useClientSessions, 
  useClientNotes, 
  useClientProgress,
  useClientPlanAssignments,
  useCoachProfile
} from "@/hooks/useCoachClients";
import { format } from "date-fns";

const CoachClientDetail = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  // Fetch real data
  const { data: coachProfile } = useCoachProfile();
  const { data: clientData, isLoading: isLoadingClient } = useClientDetail(id);
  const { data: sessions = [], isLoading: isLoadingSessions } = useClientSessions(id);
  const { data: notes = [], isLoading: isLoadingNotes } = useClientNotes(id);
  const { data: progressData = [], isLoading: isLoadingProgress } = useClientProgress(id);
  const { data: planAssignments = [], isLoading: isLoadingPlans } = useClientPlanAssignments(id);

  // Modal states
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    id: string;
    clientName: string;
    sessionType: string;
    scheduledAt: string;
    duration: number;
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    isOnline: boolean;
    notes?: string;
    videoMeetingUrl?: string;
    rescheduledFrom?: string;
  } | null>(null);

  const client = clientData?.client_profile;
  const clientRelation = clientData;

  const fullName = useMemo(() => {
    if (!client) return "Client";
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || "Client";
  }, [client]);

  const initials = useMemo(() => {
    if (!client) return "?";
    const first = client.first_name?.[0] || '';
    const last = client.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  }, [client]);

  // Transform sessions for calendar
  const calendarSessions = useMemo(() => {
    return sessions.map(s => ({
      id: s.id,
      date: new Date(s.scheduled_at),
      type: s.session_type,
      status: s.status as "scheduled" | "completed" | "cancelled",
    }));
  }, [sessions]);

  // Transform notes for NoteCard
  const formattedNotes = useMemo(() => {
    return notes.map(n => ({
      id: n.id,
      content: n.content,
      category: (n.category || 'general') as "general" | "progress" | "injury" | "feedback" | "goal",
      isPinned: n.is_pinned || false,
      createdAt: n.created_at,
    }));
  }, [notes]);

  // Transform progress data for chart
  const chartData = useMemo(() => {
    return progressData.map(p => ({
      date: format(new Date(p.recorded_at), 'MMM d'),
      weight: p.weight_kg || undefined,
      bodyFat: p.body_fat_percentage || undefined,
    }));
  }, [progressData]);

  // Session stats
  const sessionStats = useMemo(() => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const upcoming = sessions.filter(s => s.status === 'scheduled').length;
    return { completed, upcoming };
  }, [sessions]);

  // Goals from client profile
  const goals = useMemo(() => {
    if (!client?.fitness_goals) return [];
    return client.fitness_goals.map((goal, i) => ({
      id: String(i),
      name: goal,
      current: "In progress",
      target: "100",
      progress: 50,
      unit: "%",
      isCompleted: false,
    }));
  }, [client]);

  const handleViewSession = (session: typeof sessions[0]) => {
    setSelectedSession({
      id: session.id,
      clientName: fullName,
      sessionType: session.session_type,
      scheduledAt: session.scheduled_at,
      duration: session.duration_minutes,
      status: session.status as "scheduled" | "completed" | "cancelled" | "no_show",
      isOnline: session.is_online || false,
      notes: session.notes || undefined,
      videoMeetingUrl: (session as any).video_meeting_url || undefined,
      rescheduledFrom: (session as any).rescheduled_from || undefined,
    });
    setIsSessionDetailOpen(true);
  };

  const handleCalendarSessionClick = (session: { id: string; date: Date; type: string; status: "scheduled" | "completed" | "cancelled" }) => {
    const fullSession = sessions.find(s => s.id === session.id);
    if (fullSession) {
      handleViewSession(fullSession);
    }
  };

  const isLoading = isLoadingClient || isLoadingSessions || isLoadingNotes || isLoadingProgress || isLoadingPlans;

  if (isLoading) {
    return (
      <DashboardLayout title="Client Details" description="Loading...">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!clientData) {
    return (
      <DashboardLayout title="Client Not Found" description="">
        <Link to="/dashboard/coach/clients">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground">Client not found or you don't have access.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={fullName} description="View and manage client details.">
      {/* Back Button */}
      <Link to="/dashboard/coach/clients">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </Link>

      {/* Client Header */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{fullName}</h1>
              <Badge className={
                clientRelation?.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                clientRelation?.status === 'pending' ? 'bg-warning/20 text-warning border-warning/30' :
                'bg-muted text-muted-foreground'
              }>
                {clientRelation?.status || 'unknown'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {client?.height_cm && `${client.height_cm}cm`}
              {client?.height_cm && client?.weight_kg && ' • '}
              {client?.weight_kg && `${client.weight_kg}kg`}
              {client?.age && ` • ${client.age} years old`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Client since {clientRelation?.start_date ? format(new Date(clientRelation.start_date), 'MMM d, yyyy') : 'N/A'}
              {clientRelation?.plan_type && ` • ${clientRelation.plan_type}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button onClick={() => setIsScheduleSessionOpen(true)} className="bg-primary text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Sessions Done</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{sessionStats.completed}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-foreground">Upcoming</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{sessionStats.upcoming}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Current Weight</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {progressData.length > 0 ? `${progressData[progressData.length - 1].weight_kg || '-'} kg` : `${client?.weight_kg || '-'} kg`}
          </p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Notes</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{notes.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Fitness Goals</h3>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <GoalProgressCard key={goal.id} goal={goal} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No goals set yet.</p>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Upcoming Sessions</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsScheduleSessionOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {sessions.filter(s => s.status === 'scheduled').slice(0, 3).map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
                    onClick={() => handleViewSession(session)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.session_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.scheduled_at), 'MMM d, yyyy')} at {format(new Date(session.scheduled_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      {session.duration_minutes} min
                    </Badge>
                  </div>
                ))}
                {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No upcoming sessions</p>
                )}
              </div>
            </div>
          </div>

          {/* Health Profile */}
          <HealthProfileCard
            dietaryRestrictions={client?.dietary_restrictions}
            allergies={client?.allergies}
            medicalConditions={client?.medical_conditions}
          />

          {/* Recent Progress */}
          {chartData.length > 0 && (
            <ProgressChart title="Recent Progress" data={chartData} />
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <SessionCalendar 
                sessions={calendarSessions}
                onDateClick={(date) => console.log("Date clicked:", date)}
                onSessionClick={handleCalendarSessionClick}
              />
            </div>

            {/* Session List */}
            <div className="lg:col-span-2 card-elevated">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">Session History</h3>
                <Button size="sm" onClick={() => setIsScheduleSessionOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
              <div className="divide-y divide-border">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => handleViewSession(session)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.status === 'completed' ? 'bg-success/10' : 
                        session.status === 'cancelled' ? 'bg-destructive/10' : 'bg-primary/10'
                      }`}>
                        <Activity className={`w-5 h-5 ${
                          session.status === 'completed' ? 'text-success' : 
                          session.status === 'cancelled' ? 'text-destructive' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.session_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.scheduled_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{session.duration_minutes} min</span>
                      <Badge className={
                        session.status === 'completed' ? 'bg-success/20 text-success border-success/30' :
                        session.status === 'cancelled' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                        'bg-primary/20 text-primary border-primary/30'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No sessions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddProgressOpen(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Log Progress
            </Button>
          </div>

          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressChart title="Weight & Body Composition" data={chartData} />
              <ProgressChart title="Body Fat Trend" data={chartData} />
            </div>
          ) : (
            <div className="card-elevated p-12 text-center">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No progress data logged yet</p>
              <Button onClick={() => setIsAddProgressOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Log First Progress Entry
              </Button>
            </div>
          )}

          {/* Goals Progress */}
          {goals.length > 0 && (
            <div className="card-elevated p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Goal Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAssignPlanOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Assign Plan
            </Button>
          </div>

          {planAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planAssignments.map((assignment) => (
                <div key={assignment.id} className="card-elevated p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        assignment.training_plan?.plan_type === 'workout' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {assignment.training_plan?.plan_type === 'workout' ? (
                          <Dumbbell className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{assignment.training_plan?.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {assignment.training_plan?.plan_type} Plan
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      assignment.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                      'bg-muted text-muted-foreground'
                    }>
                      {assignment.status}
                    </Badge>
                  </div>
                  {assignment.training_plan?.description && (
                    <p className="text-sm text-muted-foreground mb-3">{assignment.training_plan.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                    {assignment.training_plan?.duration_weeks && ` • ${assignment.training_plan.duration_weeks} weeks`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No plans assigned yet</p>
              <Button onClick={() => setIsAssignPlanOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Assign First Plan
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          {coachProfile?.id && id && (
            <HabitManager coachId={coachProfile.id} clientId={id} />
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddNoteOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>

          {formattedNotes.length > 0 ? (
            <div className="space-y-4">
              {formattedNotes
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                .map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={() => {}} 
                    onDelete={() => {}} 
                  />
                ))}
            </div>
          ) : (
            <div className="card-elevated p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No notes yet</p>
              <Button onClick={() => setIsAddNoteOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Note
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ScheduleSessionModal 
        open={isScheduleSessionOpen} 
        onOpenChange={setIsScheduleSessionOpen}
        clientName={fullName}
        clientId={id}
      />

      <SessionDetailModal 
        open={isSessionDetailOpen} 
        onOpenChange={(open) => {
          setIsSessionDetailOpen(open);
          if (!open) setSelectedSession(null);
        }}
        session={selectedSession}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ["client-sessions"] });
        }}
      />

      <AddNoteModal 
        open={isAddNoteOpen} 
        onOpenChange={setIsAddNoteOpen}
        clientName={fullName}
        clientId={id}
      />

      <AddProgressModal 
        open={isAddProgressOpen} 
        onOpenChange={setIsAddProgressOpen}
        clientName={fullName}
        clientId={id}
      />

      <AssignPlanModal 
        open={isAssignPlanOpen} 
        onOpenChange={setIsAssignPlanOpen}
        clientName={fullName}
        clientId={id}
      />
    </DashboardLayout>
  );
};

export default CoachClientDetail;