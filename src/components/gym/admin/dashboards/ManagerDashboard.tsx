import { useGym } from "@/contexts/GymContext";
import { GymStatsGrid } from "../GymStatsGrid";
import { TodaysClassesList } from "../TodaysClassesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  UserPlus,
  Bell,
  CheckSquare,
  FileText,
  Plus,
} from "lucide-react";
import { useMyTasks } from "@/hooks/gym/useGymStaffTasks";
import { useGymStaffNotifications } from "@/hooks/gym/useGymStaffNotifications";
import { useGymRefundRequests } from "@/hooks/gym/useGymRefundRequests";
import { useManagerCommission } from "@/hooks/gym/useGymDashboardStats";
import { useDateRangeAnalytics } from "@/hooks/useDateRangeAnalytics";
import { format } from "date-fns";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { ManagerCommissionWidget } from "../widgets";
import { RequestRefundDialog } from "../dialogs/RequestRefundDialog";

export function ManagerDashboard() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, staffRecord } = useGym();
  const { data: tasks } = useMyTasks();
  const { data: notifications } = useGymStaffNotifications(5);
  const { data: myRequests } = useGymRefundRequests({ limit: 10 });
  const { data: commission } = useManagerCommission(staffRecord?.id);
  
  const dateRange = useDateRangeAnalytics("thisMonth", "previousPeriod");

  // Filter to only show requests made by this manager
  const myPendingRequests = myRequests?.filter(
    r => r.requested_by === staffRecord?.id && r.status === 'pending'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your location at {gym?.name}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RequestRefundDialog>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Request Refund
            </Button>
          </RequestRefundDialog>
          <Button variant="outline" asChild size="sm">
            <Link to={`/gym-admin/${gymId}/members/new`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/gym-admin/${gymId}/schedule`}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        preset={dateRange.preset}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        compareMode={dateRange.compareMode}
        dateRangeLabel={dateRange.dateRangeLabel}
        comparisonLabel={dateRange.comparisonLabel}
        onPresetChange={dateRange.setPreset}
        onCustomRangeChange={dateRange.setCustomRange}
        onCompareModeChange={dateRange.setCompareMode}
        showComparison={false}
      />

      {/* Commission Widget for Manager */}
      {commission && commission.commissionRate > 0 && (
        <ManagerCommissionWidget />
      )}

      {/* Stats Grid - Limited view */}
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

      {/* My Refund Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Refund Requests
          </CardTitle>
          <div className="flex items-center gap-2">
            {myPendingRequests.length > 0 && (
              <Badge variant="secondary">{myPendingRequests.length} pending</Badge>
            )}
            <RequestRefundDialog>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </RequestRefundDialog>
          </div>
        </CardHeader>
        <CardContent>
          {myRequests && myRequests.filter(r => r.requested_by === staffRecord?.id).length > 0 ? (
            <div className="space-y-2">
              {myRequests
                .filter(r => r.requested_by === staffRecord?.id)
                .slice(0, 5)
                .map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {request.member?.first_name} {request.member?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.request_type?.replace(/_/g, ' ')} - {request.reason_category?.replace(/_/g, ' ')}
                    </p>
                    {request.amount && (
                      <p className="text-xs font-medium">£{request.amount.toFixed(2)}</p>
                    )}
                  </div>
                  <Badge
                    variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'rejected' ? 'destructive' : 'outline'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No refund requests submitted yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
