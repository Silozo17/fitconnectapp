import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompletionProgressProps {
  profile: {
    bio?: string | null;
    card_image_url?: string | null;
    coach_types?: string[] | null;
    experience_years?: number | null;
    location?: string | null;
    online_available?: boolean | null;
    in_person_available?: boolean | null;
    who_i_work_with?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
    linkedin_url?: string | null;
    threads_url?: string | null;
  };
  galleryCount?: number;
  groupClassCount?: number;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  weight: number;
}

export function ProfileCompletionProgress({ 
  profile, 
  galleryCount = 0,
  groupClassCount = 0 
}: ProfileCompletionProgressProps) {
  const completionItems = useMemo<CompletionItem[]>(() => {
    const hasSocialLinks = !!(
      profile.instagram_url || 
      profile.facebook_url || 
      profile.youtube_url || 
      profile.tiktok_url ||
      profile.x_url ||
      profile.linkedin_url ||
      profile.threads_url
    );

    return [
      { label: "Profile photo", completed: !!profile.card_image_url, weight: 15 },
      { label: "Bio", completed: !!profile.bio && profile.bio.length > 50, weight: 15 },
      { label: "Coach specialisations", completed: !!(profile.coach_types && profile.coach_types.length > 0), weight: 10 },
      { label: "Years of experience", completed: profile.experience_years !== null && profile.experience_years !== undefined, weight: 5 },
      { label: "Location", completed: !!profile.location, weight: 10 },
      { label: "Session availability", completed: !!(profile.online_available || profile.in_person_available), weight: 10 },
      { label: "Who you work with", completed: !!profile.who_i_work_with && profile.who_i_work_with.length > 20, weight: 10 },
      { label: "Gallery images", completed: galleryCount >= 1, weight: 10 },
      { label: "Social media links", completed: hasSocialLinks, weight: 10 },
      { label: "Group classes", completed: groupClassCount >= 1, weight: 5 },
    ];
  }, [profile, galleryCount, groupClassCount]);

  const { percentage, incompleteItems } = useMemo(() => {
    const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = completionItems
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    
    const pct = Math.round((completedWeight / totalWeight) * 100);
    const incomplete = completionItems.filter(item => !item.completed);
    
    return { percentage: pct, incompleteItems: incomplete };
  }, [completionItems]);

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
                {completionItems.filter(i => i.completed).length} / {completionItems.length} items
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
