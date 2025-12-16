import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConnectionRequests from "@/components/dashboard/coach/ConnectionRequests";

// Mock data for demonstration
const upcomingSessions = [
  { id: 1, client: "John Smith", type: "Personal Training", time: "Today, 2:00 PM", avatar: "JS" },
  { id: 2, client: "Sarah Johnson", type: "Nutrition Consultation", time: "Today, 4:30 PM", avatar: "SJ" },
  { id: 3, client: "Mike Davis", type: "Boxing Session", time: "Tomorrow, 10:00 AM", avatar: "MD" },
];

const recentActivity = [
  { id: 1, action: "New booking request", details: "Emma Wilson - Personal Training", time: "5 min ago", type: "booking" },
  { id: 2, action: "Message received", details: "From John Smith", time: "1 hour ago", type: "message" },
  { id: 3, action: "Payment received", details: "£75 from Sarah Johnson", time: "2 hours ago", type: "payment" },
  { id: 4, action: "Review received", details: "5 stars from Mike Davis", time: "Yesterday", type: "review" },
];

const CoachOverview = () => {
  return (
    <DashboardLayout title="Overview" description="Manage your coaching business from your dashboard.">
      {/* Welcome & Quick Stats */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back! 💪
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your coaching business today.</p>
      </div>

      {/* Profile Completion */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Profile Completion</span>
          <span className="text-sm text-primary font-bold">75%</span>
        </div>
        <Progress value={75} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">Complete your profile to attract more clients</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">24</p>
          <p className="text-sm text-muted-foreground">Active Clients</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> This week
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">18</p>
          <p className="text-sm text-muted-foreground">Sessions Scheduled</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-warning" />
            </div>
            <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
              3
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">12</p>
          <p className="text-sm text-muted-foreground">Unread Messages</p>
        </div>

        <div className="card-elevated p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <span className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">£2,450</p>
          <p className="text-sm text-muted-foreground">Revenue This Month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Client</span>
        </Button>
        <Link to="/dashboard/coach/schedule">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Set Availability</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/plans">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Create Plan</span>
          </Button>
        </Link>
        <Link to="/dashboard/coach/messages">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-dashed">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Send Message</span>
          </Button>
        </Link>
      </div>

      {/* Connection Requests */}
      <div className="mb-6">
        <ConnectionRequests />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Upcoming Sessions</h2>
            <Link to="/dashboard/coach/schedule">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {session.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{session.client}</p>
                  <p className="text-sm text-muted-foreground">{session.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{session.time}</p>
                </div>
              </div>
            ))}
          </div>
          {upcomingSessions.length === 0 && (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card-elevated">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'booking' ? 'bg-primary' :
                  activity.type === 'message' ? 'bg-warning' :
                  activity.type === 'payment' ? 'bg-success' :
                  'bg-accent'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Summary */}
      <div className="card-elevated p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-foreground">Your Reviews</h2>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-warning fill-warning" />
            <span className="text-xl font-bold text-foreground">4.9</span>
            <span className="text-muted-foreground">(127 reviews)</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{stars}</span>
                <Star className="w-3 h-3 text-warning fill-warning" />
              </div>
              <Progress value={stars === 5 ? 85 : stars === 4 ? 12 : stars === 3 ? 2 : 1} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachOverview;
