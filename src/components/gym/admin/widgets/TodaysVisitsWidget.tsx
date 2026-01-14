import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScanLine, Clock } from "lucide-react";
import { format } from "date-fns";
import { useTodaysCheckIns } from "@/hooks/gym/useGymDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

interface TodaysVisitsWidgetProps {
  limit?: number;
}

export function TodaysVisitsWidget({ limit = 10 }: TodaysVisitsWidgetProps) {
  const { data: checkIns, isLoading } = useTodaysCheckIns(limit);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="h-5 w-5" />
          Today's Visits
        </CardTitle>
        <Badge variant="secondary">{checkIns?.length || 0}</Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] px-4 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : checkIns && checkIns.length > 0 ? (
            <div className="space-y-2">
              {checkIns.map((checkIn) => {
                const member = checkIn.member as {
                  first_name?: string;
                  last_name?: string;
                  avatar_url?: string;
                } | null;
                const classBooking = checkIn.class_booking as {
                  class_session?: {
                    class_type?: { name?: string };
                  };
                } | null;
                
                const memberName = member
                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown Member'
                  : 'Unknown Member';
                const initials = member
                  ? `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`
                  : '?';
                const className = classBooking?.class_session?.class_type?.name;
                
                return (
                  <div
                    key={checkIn.id}
                    className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member?.avatar_url || undefined} alt={memberName} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{memberName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(checkIn.checked_in_at), "h:mm a")}
                        {className && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="truncate">{className}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {checkIn.checked_out_at ? (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Out
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        In
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ScanLine className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No check-ins yet today</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
