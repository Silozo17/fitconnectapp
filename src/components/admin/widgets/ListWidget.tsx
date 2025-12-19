import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Shield, ArrowRight, Receipt, MessageSquare, Award, AlertTriangle, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

type ListWidgetType = 
  | "pending_verifications" 
  | "recent_signups" 
  | "recent_transactions" 
  | "recent_reviews" 
  | "top_coaches" 
  | "flagged_documents";

interface ListItem {
  id: string;
  document_type?: string;
  coach_profiles?: { display_name?: string };
  first_name?: string;
  last_name?: string;
  created_at?: string;
  amount?: number;
  type?: string;
  status?: string;
  rating?: number;
  review_text?: string;
  client_profiles?: { first_name?: string };
  display_name?: string;
  profile_image_url?: string;
}

interface ListWidgetProps {
  type: ListWidgetType;
  items: ListItem[];
  title?: string;
}

const configMap: Record<ListWidgetType, { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  link: string;
  emptyMessage: string;
}> = {
  pending_verifications: {
    icon: Shield,
    title: "Pending Verifications",
    link: "/dashboard/admin/verification",
    emptyMessage: "No pending verifications",
  },
  recent_signups: {
    icon: UserPlus,
    title: "Recent Signups",
    link: "/dashboard/admin/users",
    emptyMessage: "No recent signups",
  },
  recent_transactions: {
    icon: Receipt,
    title: "Recent Transactions",
    link: "/dashboard/admin/revenue",
    emptyMessage: "No recent transactions",
  },
  recent_reviews: {
    icon: MessageSquare,
    title: "Recent Reviews",
    link: "/dashboard/admin/reviews",
    emptyMessage: "No recent reviews",
  },
  top_coaches: {
    icon: Award,
    title: "Top Coaches",
    link: "/dashboard/admin/coaches",
    emptyMessage: "No coaches yet",
  },
  flagged_documents: {
    icon: AlertTriangle,
    title: "AI Flagged Documents",
    link: "/dashboard/admin/verification",
    emptyMessage: "No flagged documents",
  },
};

export function ListWidget({ type, items, title }: ListWidgetProps) {
  const config = configMap[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;

  const renderItem = (item: ListItem) => {
    switch (type) {
      case "pending_verifications":
        return (
          <>
            <div>
              <p className="font-medium text-sm">
                {item.coach_profiles?.display_name || "Unknown Coach"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {item.document_type?.replace(/_/g, " ")}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">Pending</Badge>
          </>
        );

      case "recent_signups":
        return (
          <>
            <div>
              <p className="font-medium text-sm">
                {item.first_name || "New"} {item.last_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.created_at && formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">New</Badge>
          </>
        );

      case "recent_transactions":
        return (
          <>
            <div>
              <p className="font-medium text-sm">
                £{(item.amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {item.type || "Payment"}
              </p>
            </div>
            <Badge 
              variant={item.status === "completed" ? "default" : "secondary"} 
              className="text-xs"
            >
              {item.status || "Pending"}
            </Badge>
          </>
        );

      case "recent_reviews":
        return (
          <>
            <div>
              <p className="font-medium text-sm flex items-center gap-1">
                {[...Array(item.rating || 0)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.review_text || "No comment"}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {item.client_profiles?.first_name || "Anonymous"}
            </span>
          </>
        );

      case "top_coaches":
        return (
          <>
            <div className="flex items-center gap-2">
              {item.profile_image_url ? (
                <img 
                  src={item.profile_image_url} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary" />
                </div>
              )}
              <p className="font-medium text-sm">{item.display_name || "Coach"}</p>
            </div>
            <Badge variant="default" className="text-xs">Top</Badge>
          </>
        );

      case "flagged_documents":
        return (
          <>
            <div>
              <p className="font-medium text-sm">
                {item.coach_profiles?.display_name || "Unknown Coach"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {item.document_type?.replace(/_/g, " ")}
              </p>
            </div>
            <Badge variant="destructive" className="text-xs">Flagged</Badge>
          </>
        );

      default:
        return null;
    }
  };

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
        <Link to={config.link}>
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item: ListItem) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {renderItem(item)}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                {config.emptyMessage}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
