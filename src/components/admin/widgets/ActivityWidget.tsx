import { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserPlus, Shield, Star, DollarSign, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ContentSection } from "@/components/shared/ContentSection";

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

const actionColors: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "bg-green-500/20", text: "text-green-400" },
  UPDATE: { bg: "bg-blue-500/20", text: "text-blue-400" },
  DELETE: { bg: "bg-red-500/20", text: "text-red-400" },
  VERIFY: { bg: "bg-purple-500/20", text: "text-purple-400" },
  REVIEW: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  PAYMENT: { bg: "bg-primary/20", text: "text-primary" },
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

export const ActivityWidget = memo(function ActivityWidget({ 
  activities, 
  title = "Recent Activity" 
}: ActivityWidgetProps) {
  return (
    <ContentSection colorTheme="purple" padding="none">
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Activity className="h-4 w-4 text-purple-400" />
        </div>
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <ScrollArea className="h-[280px]">
          <div className="space-y-2">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const actionType = getActionType(activity.action);
                const Icon = actionIcons[actionType] || Activity;
                const colors = actionColors[actionType] || { bg: "bg-muted", text: "text-muted-foreground" };

                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formatAction(activity.action, activity.entity_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
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
      </div>
    </ContentSection>
  );
});
