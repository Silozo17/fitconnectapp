import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Package,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Utensils,
  Camera,
} from "lucide-react";
import { ClientMealLogs } from "@/components/coach/ClientMealLogs";
import { ClientTrainingLogs } from "@/components/coach/ClientTrainingLogs";
import { ClientWearableData } from "@/components/coach/ClientWearableData";
import { ClientProgressPhotos } from "@/components/coach/ClientProgressPhotos";
import { ClientReportsTab } from "@/components/coach/ClientReportsTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ScheduleSessionModal } from "@/components/dashboard/clients/ScheduleSessionModal";
import { SessionDetailModal } from "@/components/dashboard/clients/SessionDetailModal";
import { AddNoteModal } from "@/components/dashboard/clients/AddNoteModal";
import { AddProgressModal } from "@/components/dashboard/clients/AddProgressModal";
import { AssignPlanModal } from "@/components/dashboard/clients/AssignPlanModal";
import { PlanAssignmentActionsModal } from "@/components/dashboard/clients/PlanAssignmentActionsModal";
import { ProgressChart } from "@/components/dashboard/clients/ProgressChart";
import { GoalProgressCard } from "@/components/dashboard/clients/GoalProgressCard";
import { NoteCard } from "@/components/dashboard/clients/NoteCard";
import { SessionCalendar } from "@/components/dashboard/clients/SessionCalendar";
import { HealthProfileCard } from "@/components/dashboard/clients/HealthProfileCard";
import { PackageCreditsInfo } from "@/components/dashboard/clients/PackageCreditsInfo";
import HabitManager from "@/components/dashboard/clients/HabitManager";
import { FeatureGate } from "@/components/FeatureGate";
import { 
  useClientDetail, 
  useClientSessions, 
  useClientNotes, 
  useClientProgress,
  useClientPlanAssignments,
  useCoachProfile,
  useUpdatePlanAssignment,
  useRemovePlanAssignment
} from "@/hooks/useCoachClients";
import { useClientActivePackage } from "@/hooks/usePackages";
import { notifyClientAboutPlanChange } from "@/utils/notifications";
import { format } from "date-fns";
import { enGB, pl } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import i18n from "@/i18n";

const CoachClientDetail = () => {
  const { t } = useTranslation("coach");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Get locale for date formatting
  const getDateLocale = () => {
    return i18n.language === 'pl' ? pl : enGB;
  };

  // Fetch real data
  const { data: coachProfile, isLoading: isLoadingCoachProfile } = useCoachProfile();
  const { data: clientData, isLoading: isLoadingClient } = useClientDetail(id);
  const { data: sessions = [], isLoading: isLoadingSessions } = useClientSessions(id);
  const { data: notes = [], isLoading: isLoadingNotes } = useClientNotes(id);
  const { data: progressData = [], isLoading: isLoadingProgress } = useClientProgress(id);
  const { data: planAssignments = [], isLoading: isLoadingPlans } = useClientPlanAssignments(id);
  const { data: activePackage, isLoading: isLoadingPackage } = useClientActivePackage(id, coachProfile?.id);

  // Mutation hooks for plan actions
  const updatePlanAssignment = useUpdatePlanAssignment();
  const removePlanAssignment = useRemovePlanAssignment();

  // Modal states
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [isPlanActionsOpen, setIsPlanActionsOpen] = useState(false);
  const [selectedPlanAssignment, setSelectedPlanAssignment] = useState<typeof planAssignments[0] | null>(null);

  // Plan action handlers
  const handlePlanAction = (assignment: typeof planAssignments[0]) => {
    setSelectedPlanAssignment(assignment);
    setIsPlanActionsOpen(true);
  };

  const handleUpdatePlanAssignment = async (data: { status: string; startDate?: Date; endDate?: Date }) => {
    if (!selectedPlanAssignment || !client?.user_id) return;
    
    const previousStatus = selectedPlanAssignment.status;
    
    await updatePlanAssignment.mutateAsync({
      assignmentId: selectedPlanAssignment.id,
      status: data.status,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    });

    // Notify client if status changed
    if (data.status !== previousStatus) {
      const action = data.status === 'paused' ? 'paused' : 
                     data.status === 'active' ? 'reactivated' : 'updated';
      await notifyClientAboutPlanChange({
        clientUserId: client.user_id,
        planName: selectedPlanAssignment.training_plan?.name || 'Plan',
        action,
        coachName: coachProfile?.display_name || 'Your Coach',
      });
    }

    setIsPlanActionsOpen(false);
    setSelectedPlanAssignment(null);
  };

  const handleRemovePlanAssignment = async () => {
    if (!selectedPlanAssignment || !client?.user_id) return;
    
    await removePlanAssignment.mutateAsync(selectedPlanAssignment.id);
    
    await notifyClientAboutPlanChange({
      clientUserId: client.user_id,
      planName: selectedPlanAssignment.training_plan?.name || 'Plan',
      action: 'removed',
      coachName: coachProfile?.display_name || 'Your Coach',
    });

    setIsPlanActionsOpen(false);
    setSelectedPlanAssignment(null);
  };

  const handleQuickPauseResume = async (assignment: typeof planAssignments[0]) => {
    if (!client?.user_id) return;
    
    const newStatus = assignment.status === 'active' ? 'paused' : 'active';
    await updatePlanAssignment.mutateAsync({
      assignmentId: assignment.id,
      status: newStatus,
    });

    await notifyClientAboutPlanChange({
      clientUserId: client.user_id,
      planName: assignment.training_plan?.name || 'Plan',
      action: newStatus === 'paused' ? 'paused' : 'reactivated',
      coachName: coachProfile?.display_name || 'Your Coach',
    });
  };
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
    if (!client) return t('common.client');
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || t('common.client');
  }, [client, t]);

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
      date: format(new Date(p.recorded_at), 'd MMM', { locale: getDateLocale() }),
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
      current: t('clientDetail.progress.inProgress') || "In progress",
      target: "100",
      progress: 50,
      unit: "%",
      isCompleted: false,
    }));
  }, [client, t]);

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

  const isLoading = isLoadingCoachProfile || isLoadingClient || isLoadingSessions || isLoadingNotes || isLoadingProgress || isLoadingPlans || isLoadingPackage;

  // Status translations
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': t('clients.active'),
      'pending': t('clients.pending'),
      'inactive': t('clients.inactive'),
    };
    return statusMap[status] || status;
  };

  const getSessionStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'scheduled': t('sessionDetailModal.status.scheduled'),
      'completed': t('sessionDetailModal.status.completed'),
      'cancelled': t('sessionDetailModal.status.cancelled'),
      'no_show': t('sessionDetailModal.status.noShow'),
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('clientDetail.pageTitle')} description={t('loading.default')}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!clientData) {
    return (
      <DashboardLayout title={t('clientDetail.clientNotFound')} description="">
        <Link to="/dashboard/coach/clients">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('clientDetail.backToClients')}
          </Button>
        </Link>
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground">{t('clientDetail.noAccessMessage')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={fullName} description={t('clientDetail.pageDescription')}>
      <div className="overflow-x-hidden">
      {/* Back Button */}
      <Link to="/dashboard/coach/clients">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('clientDetail.backToClients')}
        </Button>
      </Link>

      {/* Client Header */}
      <div className="glass-card p-6 mb-6">
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
                {getStatusLabel(clientRelation?.status || t('clientDetail.unknown'))}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {client?.height_cm && `${client.height_cm}cm`}
              {client?.height_cm && client?.weight_kg && ' • '}
              {client?.weight_kg && `${client.weight_kg}kg`}
              {client?.age && ` • ${client.age} ${t('clientDetail.yearsOld')}`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('clientDetail.clientSince')} {clientRelation?.start_date ? format(new Date(clientRelation.start_date), 'd MMM yyyy', { locale: getDateLocale() }) : 'N/A'}
              {clientRelation?.plan_type && ` • ${clientRelation.plan_type}`}
            </p>
          </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => navigate(`/dashboard/coach/messages/${id}`)}
                >
                  <MessageSquare className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('clients.message')}</span>
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 sm:flex-none bg-primary text-primary-foreground"
                  onClick={() => setIsScheduleSessionOpen(true)}
                >
                  <Calendar className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('clients.scheduleSession')}</span>
                </Button>
              </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="glass-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('clientDetail.stats.sessionsDone')}</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{sessionStats.completed}</p>
        </div>
        <div className="glass-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-foreground">{t('clientDetail.stats.upcoming')}</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{sessionStats.upcoming}</p>
        </div>
        <div className="glass-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t('packageCredits.credits')}</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {activePackage ? (
              <span className={(activePackage.sessions_total - (activePackage.sessions_used || 0)) <= 2 ? "text-warning" : ""}>
                {activePackage.sessions_total - (activePackage.sessions_used || 0)}/{activePackage.sessions_total}
              </span>
            ) : (
              <span className="text-muted-foreground text-lg">-</span>
            )}
          </p>
        </div>
        <div className="glass-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">{t('clientDetail.stats.currentWeight')}</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {progressData.length > 0 ? `${progressData[progressData.length - 1].weight_kg || '-'} kg` : `${client?.weight_kg || '-'} kg`}
          </p>
        </div>
        <div className="glass-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">{t('clientDetail.stats.notes')}</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{notes.length}</p>
        </div>
      </div>

      {/* Package Credits Card (if active) */}
      {activePackage && (
        <div className="mb-6">
          <PackageCreditsInfo activePackage={activePackage} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('clientDetail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs sm:text-sm">{t('clientDetail.tabs.sessions')}</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm">{t('clientDetail.tabs.progress')}</TabsTrigger>
          <TabsTrigger value="data" className="text-xs sm:text-sm">{t('clientDetail.tabs.data', 'Data')}</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs sm:text-sm">{t('clientDetail.tabs.photos', 'Photos')}</TabsTrigger>
          <TabsTrigger value="plans" className="text-xs sm:text-sm">{t('clientDetail.tabs.plans')}</TabsTrigger>
          <TabsTrigger value="habits" className="text-xs sm:text-sm">{t('clientDetail.tabs.habits')}</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">{t('clientDetail.tabs.reports', 'Reports')}</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs sm:text-sm">{t('clientDetail.tabs.notes')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">{t('clientDetail.overview.fitnessGoals')}</h3>
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
                <p className="text-muted-foreground">{t('clientDetail.overview.noGoalsSet')}</p>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">{t('clientDetail.overview.upcomingSessions')}</h3>
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
                          {format(new Date(session.scheduled_at), 'd MMM yyyy', { locale: getDateLocale() })} {t('common.at')} {format(new Date(session.scheduled_at), 'HH:mm', { locale: getDateLocale() })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      {session.duration_minutes} min
                    </Badge>
                  </div>
                ))}
                {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">{t('clientDetail.overview.noUpcomingSessions')}</p>
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
            <ProgressChart title={t('clients.progressOverview')} data={chartData} />
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <SessionCalendar 
                sessions={calendarSessions}
                onDateClick={() => {}}
                onSessionClick={handleCalendarSessionClick}
              />
            </div>

            {/* Session List */}
            <div className="lg:col-span-2 glass-card">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">{t('clientDetail.sessions.sessionHistory')}</h3>
                <Button size="sm" onClick={() => setIsScheduleSessionOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('clients.scheduleSession')}
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
                          {format(new Date(session.scheduled_at), 'd MMM yyyy', { locale: getDateLocale() })}
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
                        {getSessionStatusLabel(session.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    {t('clientDetail.sessions.noSessionsYet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <FeatureGate feature="client_progress_tracking">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddProgressOpen(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                {t('clientDetail.progress.logProgress')}
              </Button>
            </div>

            {chartData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart title={t('clientDetail.progress.weightAndBodyComposition')} data={chartData} />
                <ProgressChart title={t('clientDetail.progress.bodyFatTrend')} data={chartData} />
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('clientDetail.progress.noProgressData')}</p>
                <Button onClick={() => setIsAddProgressOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('clientDetail.progress.logFirstProgress')}
                </Button>
              </div>
            )}

            {/* Goals Progress */}
            {goals.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-foreground mb-4">{t('clientDetail.progress.goalProgress')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goals.map((goal) => (
                    <GoalProgressCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </div>
            )}
          </FeatureGate>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAssignPlanOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('clientDetail.plans.assignPlan')}
            </Button>
          </div>

          {planAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planAssignments.map((assignment) => (
                <div key={assignment.id} className="glass-card p-6">
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
                          {assignment.training_plan?.plan_type === 'workout' 
                            ? t('clientDetail.plans.workoutPlan') 
                            : t('clientDetail.plans.nutritionPlan')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        assignment.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                        assignment.status === 'paused' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-muted text-muted-foreground'
                      }>
                        {t(`clientDetail.planActions.statusOptions.${assignment.status}`)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePlanAction(assignment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('clientDetail.planActions.editAssignment')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickPauseResume(assignment)}>
                            {assignment.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                {t('clientDetail.planActions.pausePlan')}
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {t('clientDetail.planActions.reactivatePlan')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handlePlanAction(assignment)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('clientDetail.planActions.removePlan')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {assignment.training_plan?.description && (
                    <p className="text-sm text-muted-foreground mb-3">{assignment.training_plan.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('clientDetail.plans.assigned')}: {format(new Date(assignment.assigned_at), 'd MMM yyyy', { locale: getDateLocale() })}
                    {assignment.training_plan?.duration_weeks && ` • ${assignment.training_plan.duration_weeks} ${t('clientDetail.plans.weeks')}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{t('clientDetail.plans.noPlansAssigned')}</p>
              <Button onClick={() => setIsAssignPlanOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t('clientDetail.plans.assignFirstPlan')}
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
              {t('clientDetail.notes.addNote')}
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
            <div className="glass-card p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{t('clientDetail.notes.noNotesYet')}</p>
              <Button onClick={() => setIsAddNoteOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t('clientDetail.notes.addFirstNote')}
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

      <PlanAssignmentActionsModal
        open={isPlanActionsOpen}
        onOpenChange={setIsPlanActionsOpen}
        assignment={selectedPlanAssignment}
        onUpdate={handleUpdatePlanAssignment}
        onRemove={handleRemovePlanAssignment}
        isUpdating={updatePlanAssignment.isPending}
        isRemoving={removePlanAssignment.isPending}
      />
      </div>
    </DashboardLayout>
  );
};

export default CoachClientDetail;
