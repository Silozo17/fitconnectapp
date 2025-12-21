import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

export function ProfileCompletionProgress() {
  const { data, isLoading } = useProfileCompletion();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-muted shrink-0">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-2 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { percentage, completedCount, totalCount, incompleteItems } = data;
  const isComplete = percentage === 100;

  return (
    <Card className={cn(
      "border-border/50 overflow-hidden",
      isComplete && "border-green-500/30 bg-green-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-full shrink-0",
            isComplete ? "bg-green-500/20" : "bg-primary/10"
          )}>
            {isComplete ? (
              <Sparkles className="h-5 w-5 text-green-500" />
            ) : percentage >= 70 ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {isComplete ? (
                  "Profile complete!"
                ) : (
                  <>Profile completion: <span className="text-primary">{percentage}%</span></>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {totalCount} items
              </span>
            </div>
            
            <Progress 
              value={percentage} 
              className={cn("h-2", isComplete && "[&>div]:bg-green-500")}
            />
            
            {!isComplete && incompleteItems.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                <span className="text-foreground/70">Next:</span>{" "}
                {incompleteItems.slice(0, 2).map(i => i.label).join(", ")}
                {incompleteItems.length > 2 && ` +${incompleteItems.length - 2} more`}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
