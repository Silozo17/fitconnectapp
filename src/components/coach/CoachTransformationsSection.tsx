import { usePublicCoachShowcases, PublicShowcase } from "@/hooks/usePublicCoachShowcases";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Clock, Percent, TrendingUp } from "lucide-react";
import { ContentSectionHeader } from "@/components/shared/ContentSection";
import { ThemedCard } from "@/components/shared/ThemedCard";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";

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
      <ThemedCard 
        colorTheme="green"
        className="overflow-hidden h-full"
        onClick={() => setShowDetail(true)}
      >
        {/* Before/After Images */}
        {(showcase.before_photo_url || showcase.after_photo_url) && (
          <div className="relative aspect-square grid grid-cols-2 -mx-4 -mt-4 mb-4">
            {showcase.before_photo_url && (
              <div className="relative">
                <img 
                  src={showcase.before_photo_url} 
                  alt="Before" 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground">Before</Badge>
              </div>
            )}
            {showcase.after_photo_url && (
              <div className="relative">
                <img 
                  src={showcase.after_photo_url} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">After</Badge>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground line-clamp-1">{showcase.title || showcase.display_name || "Transformation"}</h3>
          <Badge variant="secondary" className="shrink-0">
            {goalTypeLabels[goalType] || "Fitness"}
          </Badge>
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
      </ThemedCard>

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
                      <Badge className="absolute bottom-2 left-2 bg-background/80">Before</Badge>
                    </div>
                  )}
                  {showcase.after_photo_url && (
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={showcase.after_photo_url} 
                        alt="After" 
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute bottom-2 right-2 bg-primary">After</Badge>
                    </div>
                  )}
                </div>
              )}

              <Badge variant="secondary">
                {goalTypeLabels[goalType] || "Fitness"}
              </Badge>

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
    <div className="space-y-4 overflow-x-clip">
      <ContentSectionHeader
        icon={TrendingUp}
        title="Client Transformations"
        badge={<Badge variant="secondary">{showcases.length}</Badge>}
      />
      <div className="-mx-5">
        <Carousel3D gap={16} showPagination={showcases.length > 2}>
          {showcases.map((showcase) => (
            <Carousel3DItem key={showcase.id} className="w-[320px]">
              <TransformationCard showcase={showcase} />
            </Carousel3DItem>
          ))}
        </Carousel3D>
      </div>
    </div>
  );
}
