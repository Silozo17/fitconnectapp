import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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

// Mock client data
const mockClientDetail = {
  id: "1",
  name: "John Smith",
  email: "john@example.com",
  phone: "+44 7700 900123",
  avatar: "JS",
  status: "active",
  plan: "Personal Training",
  startDate: "Oct 15, 2024",
  sessionsCompleted: 24,
  sessionsRemaining: 6,
  goals: [
    { id: "1", name: "Build muscle mass", current: "65", target: "100", progress: 65, unit: "%", isCompleted: false },
    { id: "2", name: "Improve endurance", current: "8", target: "10", progress: 80, unit: "km", isCompleted: false },
    { id: "3", name: "Lose 5kg", current: "3", target: "5", progress: 60, unit: "kg", isCompleted: false },
  ],
  currentWeight: 82,
  targetWeight: 77,
  startingWeight: 85,
  height: 180,
  age: 32,
  notes: [
    { id: "1", content: "Good progress on deadlifts, increased weight to 100kg. Client is highly motivated and showing consistent improvement.", category: "progress" as const, isPinned: true, createdAt: "2024-12-10T10:00:00Z" },
    { id: "2", content: "Slight shoulder discomfort - modified exercises to avoid overhead movements. Will reassess next session.", category: "injury" as const, isPinned: false, createdAt: "2024-12-05T14:30:00Z" },
    { id: "3", content: "Started new nutrition plan. Client reports feeling more energized.", category: "general" as const, isPinned: false, createdAt: "2024-11-28T09:00:00Z" },
  ],
  progressData: [
    { date: "Oct 1", weight: 85, bodyFat: 22 },
    { date: "Oct 15", weight: 84.5, bodyFat: 21.5 },
    { date: "Nov 1", weight: 84, bodyFat: 21 },
    { date: "Nov 15", weight: 83, bodyFat: 20 },
    { date: "Dec 1", weight: 82.5, bodyFat: 19 },
    { date: "Dec 15", weight: 82, bodyFat: 18 },
  ],
  upcomingSessions: [
    { id: "1", date: "Today", time: "2:00 PM", type: "Strength Training", duration: 60, status: "scheduled" },
    { id: "2", date: "Thu, Dec 14", time: "2:00 PM", type: "Cardio & Core", duration: 45, status: "scheduled" },
    { id: "3", date: "Sat, Dec 16", time: "10:00 AM", type: "Full Body", duration: 60, status: "scheduled" },
  ],
  sessionHistory: [
    { id: "h1", date: new Date(2024, 11, 10), type: "Strength Training", duration: 60, status: "completed" as const, notes: "Great session, hit new PR on squats" },
    { id: "h2", date: new Date(2024, 11, 7), type: "HIIT Session", duration: 45, status: "completed" as const, notes: "High intensity, client performed well" },
    { id: "h3", date: new Date(2024, 11, 5), type: "Upper Body", duration: 60, status: "completed" as const, notes: "Modified due to shoulder issue" },
    { id: "h4", date: new Date(2024, 11, 3), type: "Cardio", duration: 30, status: "cancelled" as const, notes: "Client sick" },
  ],
  calendarSessions: [
    { id: "c1", date: new Date(2024, 11, 10), type: "Strength Training", status: "completed" as const },
    { id: "c2", date: new Date(2024, 11, 7), type: "HIIT Session", status: "completed" as const },
    { id: "c3", date: new Date(2024, 11, 5), type: "Upper Body", status: "completed" as const },
    { id: "c4", date: new Date(2024, 11, 14), type: "Cardio & Core", status: "scheduled" as const },
    { id: "c5", date: new Date(2024, 11, 16), type: "Full Body", status: "scheduled" as const },
    { id: "c6", date: new Date(2024, 11, 19), type: "Strength Training", status: "scheduled" as const },
  ],
  assignedPlans: [
    { id: "p1", name: "12-Week Strength Program", type: "workout", status: "active", progress: 67, startDate: "Oct 15, 2024" },
    { id: "p2", name: "High Protein Meal Plan", type: "nutrition", status: "active", progress: 80, startDate: "Nov 1, 2024" },
  ],
};

const CoachClientDetail = () => {
  const { id } = useParams();
  const client = mockClientDetail;

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
  } | null>(null);

  const handleViewSession = (session: typeof mockClientDetail.sessionHistory[0]) => {
    setSelectedSession({
      id: session.id,
      clientName: client.name,
      sessionType: session.type,
      scheduledAt: session.date.toISOString(),
      duration: session.duration,
      status: session.status,
      isOnline: false,
      notes: session.notes,
    });
    setIsSessionDetailOpen(true);
  };

  const handleCalendarSessionClick = (session: { id: string; date: Date; type: string; status: "scheduled" | "completed" | "cancelled" }) => {
    setSelectedSession({
      id: session.id,
      clientName: client.name,
      sessionType: session.type,
      scheduledAt: session.date.toISOString(),
      duration: 60,
      status: session.status,
      isOnline: false,
    });
    setIsSessionDetailOpen(true);
  };

  const weightProgress = ((client.startingWeight - client.currentWeight) / (client.startingWeight - client.targetWeight)) * 100;

  return (
    <DashboardLayout title={client.name} description="View and manage client details.">
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
            {client.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-2xl font-bold text-foreground">{client.name}</h1>
              <Badge className="bg-success/20 text-success border-success/30">{client.status}</Badge>
            </div>
            <p className="text-muted-foreground">{client.email} • {client.phone}</p>
            <p className="text-sm text-muted-foreground mt-1">Client since {client.startDate} • {client.plan}</p>
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
          <p className="text-2xl font-display font-bold text-foreground">{client.sessionsCompleted}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-foreground">Remaining</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{client.sessionsRemaining}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Current Weight</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{client.currentWeight} kg</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Target Weight</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{client.targetWeight} kg</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goals */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Goals Progress</h3>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {client.goals.map((goal) => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
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
                {client.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.type}</p>
                        <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      {session.duration} min
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weight Progress */}
          <div className="card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Weight Progress</h3>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-muted-foreground">Starting: {client.startingWeight}kg</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground font-medium">Current: {client.currentWeight}kg</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-primary font-medium">Target: {client.targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {client.currentWeight - client.targetWeight}kg to go • {Math.round(weightProgress)}% progress
            </p>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <SessionCalendar 
                sessions={client.calendarSessions}
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
                {client.sessionHistory.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => handleViewSession(session)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.status === 'completed' ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        <Activity className={`w-5 h-5 ${
                          session.status === 'completed' ? 'text-success' : 'text-destructive'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.type}</p>
                        <p className="text-sm text-muted-foreground">{session.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{session.duration} min</span>
                      <Badge className={
                        session.status === 'completed' ? 'bg-success/20 text-success border-success/30' :
                        'bg-destructive/20 text-destructive border-destructive/30'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
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

          {/* Progress Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart 
              title="Weight & Body Composition" 
              data={client.progressData} 
            />
            <ProgressChart 
              title="Body Fat Trend" 
              data={client.progressData} 
            />
          </div>

          {/* Goals Progress */}
          <div className="card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Goal Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {client.goals.map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAssignPlanOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Assign Plan
            </Button>
          </div>

          {client.assignedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.assignedPlans.map((plan) => (
                <div key={plan.id} className="card-elevated p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        plan.type === 'workout' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {plan.type === 'workout' ? (
                          <Dumbbell className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{plan.type} Plan</p>
                      </div>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30">{plan.status}</Badge>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">Started: {plan.startDate}</p>
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

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddNoteOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>

          <div className="space-y-4">
            {client.notes
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
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ScheduleSessionModal 
        open={isScheduleSessionOpen} 
        onOpenChange={setIsScheduleSessionOpen}
        clientName={client.name}
      />

      <SessionDetailModal 
        open={isSessionDetailOpen} 
        onOpenChange={(open) => {
          setIsSessionDetailOpen(open);
          if (!open) setSelectedSession(null);
        }}
        session={selectedSession}
      />

      <AddNoteModal 
        open={isAddNoteOpen} 
        onOpenChange={setIsAddNoteOpen}
        clientName={client.name}
      />

      <AddProgressModal 
        open={isAddProgressOpen} 
        onOpenChange={setIsAddProgressOpen}
        clientName={client.name}
      />

      <AssignPlanModal 
        open={isAssignPlanOpen} 
        onOpenChange={setIsAssignPlanOpen}
        clientName={client.name}
      />
    </DashboardLayout>
  );
};

export default CoachClientDetail;