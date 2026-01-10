import { usePublicCoachShowcases, PublicShowcase } from "@/hooks/usePublicCoachShowcases";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { TrendingUp, TrendingDown, Clock, Percent } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  coachId: string;
}

function TransformationCard({ showcase }: { showcase: PublicShowcase }) {
  const [showDetail, setShowDetail] = useState(false);
  const stats = showcase.stats;

  const goalTypeLabels: Record<string, string> = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    strength: "Strength",
    endurance: "Endurance",
    general_fitness: "General Fitness",
  };

  const goalType = stats?.goalType || "general_fitness";

  return (
    <>
      <div 
        className="cursor-pointer hover:bg-muted/20 transition-colors duration-200 py-4 border-b border-border/30 last:border-b-0"
        onClick={() => setShowDetail(true)}
      >
        {/* Before/After Images */}
        {(showcase.before_photo_url || showcase.after_photo_url) && (
          <div className="relative h-48 grid grid-cols-2">
            {showcase.before_photo_url && (
              <div className="relative">
                <img 
                  src={showcase.before_photo_url} 
                  alt="Before" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-background/80 text-foreground">Before</span>
              </div>
            )}
            {showcase.after_photo_url && (
              <div className="relative">
                <img 
                  src={showcase.after_photo_url} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">After</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-foreground line-clamp-1">{showcase.title || showcase.display_name || "Transformation"}</h3>
            <span className="shrink-0 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {goalTypeLabels[goalType] || "Fitness"}
            </span>
          </div>

          {showcase.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {showcase.description}
            </p>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap gap-3 text-sm">
              {stats.weightLost && (
                <div className="flex items-center gap-1 text-primary">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">{stats.weightLost}kg</span>
                </div>
              )}
              {stats.durationWeeks && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{stats.durationWeeks} weeks</span>
                </div>
              )}
              {stats.bodyFatChange && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  <span>{Math.abs(stats.bodyFatChange)}% BF</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{showcase.title || showcase.display_name || "Transformation"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {/* Large Before/After */}
              {(showcase.before_photo_url || showcase.after_photo_url) && (
                <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                  {showcase.before_photo_url && (
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={showcase.before_photo_url} 
                        alt="Before" 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-background/80">Before</span>
                    </div>
                  )}
                  {showcase.after_photo_url && (
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={showcase.after_photo_url} 
                        alt="After" 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">After</span>
                    </div>
                  )}
                </div>
              )}

              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {goalTypeLabels[goalType] || "Fitness"}
              </span>

              {showcase.description && (
                <p className="text-muted-foreground">{showcase.description}</p>
              )}

              {/* Full Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                  {stats.weightLost && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats.weightLost}kg</p>
                      <p className="text-xs text-muted-foreground">Lost</p>
                    </div>
                  )}
                  {stats.durationWeeks && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{stats.durationWeeks}</p>
                      <p className="text-xs text-muted-foreground">Weeks</p>
                    </div>
                  )}
                  {stats.bodyFatChange && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{Math.abs(stats.bodyFatChange)}%</p>
                      <p className="text-xs text-muted-foreground">Body Fat</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CoachTransformationsSection({ coachId }: Props) {
  const { data: showcases = [], isLoading } = usePublicCoachShowcases(coachId);

  if (isLoading || showcases.length === 0) return null;

  return (
    <ContentSection colorTheme="green">
      <ContentSectionHeader
        icon={TrendingUp}
        title={`Client Transformations (${showcases.length})`}
      />
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        {showcases.map((showcase) => (
          <TransformationCard key={showcase.id} showcase={showcase} />
        ))}
      </div>
    </ContentSection>
  );
}
