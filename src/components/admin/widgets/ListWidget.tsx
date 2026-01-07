import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Shield, ArrowRight, Receipt, MessageSquare, Award, AlertTriangle, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  colorTheme: {
    bg: string;
    border: string;
    accent: string;
    iconBg: string;
    iconColor: string;
  };
}> = {
  pending_verifications: {
    icon: Shield,
    title: "Pending Verifications",
    link: "/dashboard/admin/verification",
    emptyMessage: "No pending verifications",
    colorTheme: {
      bg: "from-yellow-500/10 via-background to-amber-600/5",
      border: "border-yellow-500/20",
      accent: "from-yellow-400/60 via-amber-400/40",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
  },
  recent_signups: {
    icon: UserPlus,
    title: "Recent Signups",
    link: "/dashboard/admin/users",
    emptyMessage: "No recent signups",
    colorTheme: {
      bg: "from-blue-500/10 via-background to-blue-600/5",
      border: "border-blue-500/20",
      accent: "from-blue-400/60 via-blue-500/40",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
  },
  recent_transactions: {
    icon: Receipt,
    title: "Recent Transactions",
    link: "/dashboard/admin/revenue",
    emptyMessage: "No recent transactions",
    colorTheme: {
      bg: "from-primary/10 via-background to-primary/5",
      border: "border-primary/20",
      accent: "from-primary/60 via-accent/40",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
  },
  recent_reviews: {
    icon: MessageSquare,
    title: "Recent Reviews",
    link: "/dashboard/admin/reviews",
    emptyMessage: "No recent reviews",
    colorTheme: {
      bg: "from-yellow-500/10 via-background to-amber-600/5",
      border: "border-yellow-500/20",
      accent: "from-yellow-400/60 via-amber-400/40",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
  },
  top_coaches: {
    icon: Award,
    title: "Top Coaches",
    link: "/dashboard/admin/coaches",
    emptyMessage: "No coaches yet",
    colorTheme: {
      bg: "from-orange-500/10 via-background to-orange-600/5",
      border: "border-orange-500/20",
      accent: "from-orange-400/60 via-orange-500/40",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
  },
  flagged_documents: {
    icon: AlertTriangle,
    title: "AI Flagged Documents",
    link: "/dashboard/admin/verification",
    emptyMessage: "No flagged documents",
    colorTheme: {
      bg: "from-red-500/10 via-background to-pink-600/5",
      border: "border-red-500/20",
      accent: "from-red-400/60 via-pink-400/40",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },
  },
};

export const ListWidget = memo(function ListWidget({ type, items, title }: ListWidgetProps) {
  const config = configMap[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const { colorTheme } = config;

  const renderItem = (item: ListItem) => {
    switch (type) {
      case "pending_verifications":
        return (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {item.coach_profiles?.display_name || "Unknown Coach"}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {item.document_type?.replace(/_/g, " ")}
              </p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">Pending</Badge>
          </>
        );

      case "recent_signups":
        return (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {item.first_name || "New"} {item.last_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.created_at && formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">New</Badge>
          </>
        );

      case "recent_transactions":
        return (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground">
                £{(item.amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {item.type || "Payment"}
              </p>
            </div>
            <Badge 
              variant={item.status === "completed" ? "default" : "secondary"} 
              className="text-xs shrink-0"
            >
              {item.status || "Pending"}
            </Badge>
          </>
        );

      case "recent_reviews":
        return (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground flex items-center gap-1">
                {[...Array(item.rating || 0)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.review_text || "No comment"}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {item.client_profiles?.first_name || "Anonymous"}
            </span>
          </>
        );

      case "top_coaches":
        return (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {item.profile_image_url ? (
                <img 
                  src={item.profile_image_url} 
                  alt="" 
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-orange-400" />
                </div>
              )}
              <p className="font-medium text-sm text-foreground truncate">{item.display_name || "Coach"}</p>
            </div>
            <Badge variant="default" className="text-xs shrink-0">Top</Badge>
          </>
        );

      case "flagged_documents":
        return (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {item.coach_profiles?.display_name || "Unknown Coach"}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {item.document_type?.replace(/_/g, " ")}
              </p>
            </div>
            <Badge variant="destructive" className="text-xs shrink-0">Flagged</Badge>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "relative bg-gradient-to-br rounded-2xl border overflow-hidden",
      colorTheme.bg,
      colorTheme.border
    )}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r to-transparent", colorTheme.accent)} />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", colorTheme.iconBg)}>
            <Icon className={cn("h-4 w-4", colorTheme.iconColor)} />
          </div>
          <h3 className="font-semibold text-foreground text-base">{displayTitle}</h3>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">{items.length}</Badge>
          )}
        </div>
        <Link to={config.link}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item: ListItem) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors"
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
      </div>
    </div>
  );
});
