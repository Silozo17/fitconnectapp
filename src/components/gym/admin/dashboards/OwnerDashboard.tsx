import { useGym } from "@/contexts/GymContext";
import { GymStatsGrid } from "../GymStatsGrid";
import { TodaysClassesList } from "../TodaysClassesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CreditCard,
  UserPlus,
  ClipboardList,
  Bell,
  CheckSquare,
} from "lucide-react";
import { useMyTasks } from "@/hooks/gym/useGymStaffTasks";
import { useGymStaffNotifications } from "@/hooks/gym/useGymStaffNotifications";
import { usePendingRefundRequestsCount } from "@/hooks/gym/useGymRefundRequests";
import { format } from "date-fns";

export function OwnerDashboard() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const { data: tasks } = useMyTasks();
  const { data: notifications } = useGymStaffNotifications(5);
  const { data: pendingRefunds } = usePendingRefundRequestsCount();

  const needsStripeSetup = !gym?.stripe_account_id || gym?.stripe_account_status === "pending";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Full overview of {gym?.name} across all locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/gym-admin/${gymId}/members/new`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/gym-admin/${gymId}/schedule`}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stripe Setup Alert */}
      {needsStripeSetup && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Complete your payment setup
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Connect your Stripe account to start accepting membership payments.
              </p>
            </div>
            <Button asChild>
              <Link to={`/gym-admin/${gymId}/billing`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Set Up Payments
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Approvals Alert */}
      {pendingRefunds && pendingRefunds > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">
                {pendingRefunds} pending refund request{pendingRefunds > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Manager requests awaiting your approval.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/gym-admin/${gymId}/refund-requests`}>
                Review Requests
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <GymStatsGrid />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <TodaysClassesList />

        {/* Tasks & Notifications */}
        <div className="space-y-6">
          {/* My Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                My Tasks
              </CardTitle>
              <Badge variant="secondary">{tasks?.length || 0}</Badge>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(task.due_date), "MMM d")}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'default' : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending tasks
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-lg border ${!notification.read ? 'bg-muted/50' : ''}`}
                    >
                      <p className="font-medium text-sm">{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notifications
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Link
            to={`/gym-admin/${gymId}/members`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Add Member</h4>
                <p className="text-xs text-muted-foreground">Register new member</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to={`/gym-admin/${gymId}/activity-log`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Activity Log</h4>
                <p className="text-xs text-muted-foreground">View all staff actions</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to={`/gym-admin/${gymId}/analytics`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Analytics</h4>
                <p className="text-xs text-muted-foreground">View business insights</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
