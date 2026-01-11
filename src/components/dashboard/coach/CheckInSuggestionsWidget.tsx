import { useState, memo } from "react";
import { MessageCircle, Zap, Clock, Send, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartCheckInSuggestions, CheckInPriority, CheckInSuggestion } from "@/hooks/useSmartCheckInSuggestions";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AICheckInComposer } from "@/components/coach/AICheckInComposer";
import { ClientContext } from "@/hooks/useAICheckInComposer";
import { isFeatureEnabled } from "@/lib/coach-feature-flags";

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

interface CheckInItemProps {
  suggestion: CheckInSuggestion;
  onAICompose?: (suggestion: CheckInSuggestion) => void;
}

const CheckInItem = memo(function CheckInItem({ suggestion, onAICompose }: CheckInItemProps) {
  const navigate = useNavigate();
  const config = priorityConfig[suggestion.priority];
  const Icon = config.icon;
  const aiEnabled = isFeatureEnabled("AI_CHECKIN_COMPOSER");

  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to messages with pre-filled template
    navigate(`/dashboard/messages?to=${suggestion.clientId}&template=${encodeURIComponent(suggestion.messageTemplate)}`);
    toast.success("Opening message composer...");
  };

  const handleAICompose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAICompose?.(suggestion);
  };

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={() => navigate(`/dashboard/coach/clients/${suggestion.clientId}`)}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={suggestion.avatarUrl || undefined} alt={suggestion.clientName} />
          <AvatarFallback className="text-xs">
            {suggestion.clientName.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center",
          config.bgColor
        )}>
          <Icon className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", config.color)} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm truncate">{suggestion.clientName}</span>
          <Badge variant="outline" className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 h-4 sm:h-5 flex-shrink-0 max-w-[80px] sm:max-w-none truncate", config.color, config.bgColor)}>
            {suggestion.reasonLabel}
          </Badge>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5 break-words">
          {suggestion.context}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {aiEnabled && (
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:flex h-8 w-8 p-0"
            onClick={handleAICompose}
            title="AI Compose"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="hidden sm:flex h-8 w-8 p-0"
          onClick={handleSendMessage}
          title="Use template"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 sm:group-hover:hidden" />
    </div>
  );
});

export const CheckInSuggestionsWidget = memo(function CheckInSuggestionsWidget() {
  const { data: suggestions, isLoading } = useSmartCheckInSuggestions();
  const navigate = useNavigate();
  const [aiComposerOpen, setAiComposerOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CheckInSuggestion | null>(null);

  const displaySuggestions = suggestions?.slice(0, 5) || [];

  const handleAICompose = (suggestion: CheckInSuggestion) => {
    setSelectedSuggestion(suggestion);
    setAiComposerOpen(true);
  };

  const handleSendAIMessage = (message: string) => {
    if (!selectedSuggestion) return;
    // Navigate to messages with the AI-generated message
    navigate(`/dashboard/messages?to=${selectedSuggestion.clientId}&template=${encodeURIComponent(message)}`);
    toast.success("Opening message composer with AI message...");
  };

  // Convert suggestion to ClientContext for the AI composer
  const getClientContext = (suggestion: CheckInSuggestion): ClientContext => ({
    clientId: suggestion.clientId,
    clientName: suggestion.clientName,
    reason: suggestion.reason,
    reasonContext: suggestion.context,
  });

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
    <>
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
            <CheckInItem 
              key={`${suggestion.clientId}-${suggestion.reason}`} 
              suggestion={suggestion}
              onAICompose={handleAICompose}
            />
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

      {/* AI Check-In Composer Modal */}
      {selectedSuggestion && (
        <AICheckInComposer
          open={aiComposerOpen}
          onOpenChange={setAiComposerOpen}
          clientContext={getClientContext(selectedSuggestion)}
          onSend={handleSendAIMessage}
        />
      )}
    </>
  );
});
