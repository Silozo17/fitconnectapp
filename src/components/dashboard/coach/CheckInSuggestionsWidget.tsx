import { MessageCircle, Zap, Clock, Send, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartCheckInSuggestions, CheckInPriority, CheckInSuggestion } from "@/hooks/useSmartCheckInSuggestions";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const priorityConfig: Record<CheckInPriority, { color: string; bgColor: string; icon: typeof Zap }> = {
  urgent: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: Zap,
  },
  suggested: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: MessageCircle,
  },
  routine: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: Clock,
  },
};

function CheckInItem({ suggestion }: { suggestion: CheckInSuggestion }) {
  const navigate = useNavigate();
  const config = priorityConfig[suggestion.priority];
  const Icon = config.icon;

  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to messages with pre-filled template
    navigate(`/dashboard/messages?to=${suggestion.clientId}&template=${encodeURIComponent(suggestion.messageTemplate)}`);
    toast.success("Opening message composer...");
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => navigate(`/dashboard/clients/${suggestion.clientId}`)}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={suggestion.avatarUrl || undefined} alt={suggestion.clientName} />
          <AvatarFallback className="text-xs">
            {suggestion.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
          config.bgColor
        )}>
          <Icon className={cn("w-3 h-3", config.color)} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{suggestion.clientName}</span>
          <Badge variant="outline" className={cn("text-xs", config.color, config.bgColor)}>
            {suggestion.reasonLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {suggestion.context}
        </p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleSendMessage}
      >
        <Send className="w-4 h-4" />
      </Button>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:hidden" />
    </div>
  );
}

export function CheckInSuggestionsWidget() {
  const { data: suggestions, isLoading } = useSmartCheckInSuggestions();
  const navigate = useNavigate();

  const displaySuggestions = suggestions?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Smart Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (displaySuggestions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Smart Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No check-ins suggested right now. Your clients are all engaged!
          </p>
        </CardContent>
      </Card>
    );
  }

  const urgentCount = displaySuggestions.filter((s) => s.priority === "urgent").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Smart Check-ins
          </CardTitle>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displaySuggestions.map((suggestion) => (
          <CheckInItem key={`${suggestion.clientId}-${suggestion.reason}`} suggestion={suggestion} />
        ))}

        {suggestions && suggestions.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate("/dashboard/clients")}
          >
            View all {suggestions.length} suggestions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
