import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserPlus, Shield, Star, DollarSign, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  created_at: string | null;
  old_values?: any;
  new_values?: any;
}

interface ActivityWidgetProps {
  activities: ActivityItem[];
  title?: string;
}

const actionIcons: Record<string, React.ComponentType<any>> = {
  CREATE: UserPlus,
  UPDATE: Settings,
  DELETE: Activity,
  VERIFY: Shield,
  REVIEW: Star,
  PAYMENT: DollarSign,
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-500",
  UPDATE: "bg-blue-500/10 text-blue-500",
  DELETE: "bg-red-500/10 text-red-500",
  VERIFY: "bg-purple-500/10 text-purple-500",
  REVIEW: "bg-yellow-500/10 text-yellow-500",
  PAYMENT: "bg-primary/10 text-primary",
};

function getActionType(action: string): string {
  if (action.includes("CREATE") || action.includes("ADD")) return "CREATE";
  if (action.includes("DELETE") || action.includes("REMOVE")) return "DELETE";
  if (action.includes("VERIFY") || action.includes("APPROVE")) return "VERIFY";
  if (action.includes("REVIEW")) return "REVIEW";
  if (action.includes("PAYMENT") || action.includes("SUBSCRIBE")) return "PAYMENT";
  return "UPDATE";
}

function formatAction(action: string, entityType: string): string {
  const actionMap: Record<string, string> = {
    "CREATE_USER": "New user registered",
    "DELETE_USER": "User deleted",
    "UPDATE_USER": "User profile updated",
    "CREATE_COACH": "New coach registered",
    "DELETE_COACH": "Coach deleted",
    "UPDATE_COACH": "Coach profile updated",
    "VERIFY_COACH": "Coach verified",
    "RESET_PASSWORD": "Password reset sent",
    "GRANT_FREE_PLAN": "Free plan granted",
    "REVOKE_PLAN": "Plan revoked",
  };
  return actionMap[action] || action.replace(/_/g, " ").toLowerCase();
}

export function ActivityWidget({ activities, title = "Recent Activity" }: ActivityWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const actionType = getActionType(activity.action);
                const Icon = actionIcons[actionType] || Activity;
                const colorClass = actionColors[actionType] || "bg-muted text-muted-foreground";

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {formatAction(activity.action, activity.entity_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
