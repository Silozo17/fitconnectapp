import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  Target,
  Clock,
  Scale,
  Ruler,
  Activity,
  Plus,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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
  goals: ["Build muscle mass", "Improve endurance", "Lose 5kg"],
  currentWeight: 82,
  targetWeight: 77,
  height: 180,
  age: 32,
  notes: [
    { id: 1, date: "Dec 10, 2024", content: "Good progress on deadlifts, increased weight to 100kg" },
    { id: 2, date: "Dec 5, 2024", content: "Slight shoulder discomfort - modified exercises" },
  ],
  measurements: {
    weight: [{ date: "Oct", value: 85 }, { date: "Nov", value: 83 }, { date: "Dec", value: 82 }],
    bodyFat: [{ date: "Oct", value: 22 }, { date: "Nov", value: 20 }, { date: "Dec", value: 18 }],
  },
  upcomingSessions: [
    { id: 1, date: "Today", time: "2:00 PM", type: "Strength Training" },
    { id: 2, date: "Thu, Dec 14", time: "2:00 PM", type: "Cardio & Core" },
  ],
  sessionHistory: [
    { id: 1, date: "Dec 10, 2024", type: "Strength Training", duration: "60 min", status: "completed" },
    { id: 2, date: "Dec 7, 2024", type: "HIIT Session", duration: "45 min", status: "completed" },
    { id: 3, date: "Dec 5, 2024", type: "Upper Body", duration: "60 min", status: "completed" },
  ],
};

const CoachClientDetail = () => {
  const { id } = useParams();
  const client = mockClientDetail; // In real app, fetch by id

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
            <Button className="bg-primary text-primary-foreground">
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
                <h3 className="font-display font-bold text-foreground">Goals</h3>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <ul className="space-y-3">
                {client.goals.map((goal, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Sessions */}
            <div className="card-elevated p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Upcoming Sessions</h3>
              <div className="space-y-3">
                {client.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{session.type}</p>
                      <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weight Progress */}
          <div className="card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Weight Progress</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-muted-foreground">Starting: 85kg</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground font-medium">Current: {client.currentWeight}kg</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-primary font-medium">Target: {client.targetWeight}kg</span>
            </div>
            <Progress value={((85 - client.currentWeight) / (85 - client.targetWeight)) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {client.currentWeight - client.targetWeight}kg to go • 37.5% progress
            </p>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Session History</h3>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
            <div className="divide-y divide-border">
              {client.sessionHistory.map((session) => (
                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.type}</p>
                      <p className="text-sm text-muted-foreground">{session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{session.duration}</span>
                    <Badge className="bg-success/20 text-success border-success/30">{session.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <div className="card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Progress Tracking</h3>
            <p className="text-muted-foreground">Charts and detailed progress tracking will be displayed here.</p>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Assigned Plans</h3>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Assign Plan
              </Button>
            </div>
            <p className="text-muted-foreground">No plans assigned yet.</p>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Coach Notes</h3>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
            <div className="divide-y divide-border">
              {client.notes.map((note) => (
                <div key={note.id} className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">{note.date}</p>
                  <p className="text-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CoachClientDetail;
