import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Shield, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ListWidgetProps {
  type: "pending_verifications" | "recent_signups";
  items: any[];
  title?: string;
}

export function ListWidget({ type, items, title }: ListWidgetProps) {
  const isVerifications = type === "pending_verifications";
  const Icon = isVerifications ? Shield : UserPlus;
  const displayTitle = title || (isVerifications ? "Pending Verifications" : "Recent Signups");
  const viewAllLink = isVerifications ? "/dashboard/admin/verification" : "/dashboard/admin/users";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {displayTitle}
          {items.length > 0 && (
            <Badge variant="secondary" className="ml-2">{items.length}</Badge>
          )}
        </CardTitle>
        <Link to={viewAllLink}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {isVerifications ? (
                    <>
                      <div>
                        <p className="font-medium text-sm">
                          {item.coach_profiles?.display_name || "Unknown Coach"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.document_type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-sm">
                          {item.first_name || "New"} {item.last_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                {isVerifications ? "No pending verifications" : "No recent signups"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
