import { useGym } from "@/contexts/GymContext";
import { TodaysClassesList } from "../TodaysClassesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import {
  Bell,
  CheckSquare,
  ScanLine,
  ArrowRight,
} from "lucide-react";
import { useMyTasks, useUpdateTaskStatus } from "@/hooks/gym/useGymStaffTasks";
import { useGymStaffNotifications } from "@/hooks/gym/useGymStaffNotifications";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function StaffDashboard() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const { data: tasks } = useMyTasks();
  const { data: notifications } = useGymStaffNotifications(5);
  const updateTaskStatus = useUpdateTaskStatus();

  const handleTaskComplete = (taskId: string) => {
    updateTaskStatus.mutate({ taskId, status: 'completed' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to {gym?.name}. Here's your daily overview.
          </p>
        </div>
        <Button asChild>
          <Link to={`/gym-admin/${gymId}/check-ins`}>
            <ScanLine className="mr-2 h-4 w-4" />
            Check-in Members
          </Link>
        </Button>
      </div>

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
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg border"
                    >
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleTaskComplete(task.id)}
                      />
                      <div className="flex-1">
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
                        className="text-xs"
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

      {/* Quick Actions for Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Link
            to={`/gym-admin/${gymId}/check-ins`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScanLine className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Check-in Members</h4>
                <p className="text-xs text-muted-foreground">Scan or search to check in</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            to={`/gym-admin/${gymId}/schedule`}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">View Schedule</h4>
                <p className="text-xs text-muted-foreground">Today's classes and bookings</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
