import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

interface StaffActivityLogWidgetProps {
  limit?: number;
  filterByRole?: 'all' | 'front_desk' | 'manager';
}

export function StaffActivityLogWidget({ 
  limit = 10, 
  filterByRole = 'all',
}: StaffActivityLogWidgetProps) {
  const { gymId } = useParams<{ gymId: string }>();

  // Placeholder - activity log table needs to be created
  const activityLogs: { id: string; action: string; staffName: string; entityType: string; createdAt: string }[] = [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5" />
          Staff Activity
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/gym-admin/${gymId}/activity-log`}>
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4 pb-4">
          {activityLogs.length > 0 ? (
            <div className="space-y-2">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-lg border text-sm"
                >
                  <Badge variant="secondary" className="shrink-0">
                    {log.action}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.staffName}</span>
                      {' '}
                      <span className="text-muted-foreground">
                        {log.action} {log.entityType}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity logged yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}