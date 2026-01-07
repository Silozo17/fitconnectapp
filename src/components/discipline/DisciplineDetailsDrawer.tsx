/**
 * Discipline Details Drawer - Full details view with styled cards
 */

import { useState } from "react";
import { Plus, Trophy, History, X, Swords, Users, PersonStanding, Waves, Bike, Medal, Dumbbell, Flame, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDisciplineWidgetData } from "@/hooks/useDisciplineWidgetData";
import { DisciplineMetricCard } from "./DisciplineMetricCard";
import { DisciplineLogModal } from "./DisciplineLogModal";
import { getDisciplineDetailConfig } from "@/config/disciplines/detailConfigs";

interface DisciplineDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disciplineId: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords, Users, PersonStanding, Waves, Bike, Medal, Dumbbell, Flame, Mountain,
};

export function DisciplineDetailsDrawer({
  open,
  onOpenChange,
  disciplineId,
}: DisciplineDetailsDrawerProps) {
  const { data, isLoading } = useDisciplineWidgetData(disciplineId);
  const [logModalOpen, setLogModalOpen] = useState(false);
  
  const detailConfig = getDisciplineDetailConfig(disciplineId);

  if (!data) return null;

  const { config, metrics, milestone, highlight } = data;
  const IconComponent = iconMap[config.icon] || Dumbbell;

  // Generate placeholder weekly data for demo
  const generateWeeklyData = () => 
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      value: Math.floor(Math.random() * 100),
    }));

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", config.theme.gradient)}>
                  <IconComponent className={cn("w-5 h-5", config.theme.accent)} />
                </div>
                <DrawerTitle>{config.name}</DrawerTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setLogModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Log
                </Button>
                <DrawerClose asChild>
                  <Button size="icon" variant="ghost">
                    <X className="w-4 h-4" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{highlight}</p>
          </DrawerHeader>

          <ScrollArea className="flex-1 px-5 py-4">
            {/* Metrics Grid - Styled Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {metrics.map((metric) => (
                <DisciplineMetricCard
                  key={metric.id}
                  metric={metric}
                  theme={config.theme}
                  weeklyData={generateWeeklyData()}
                />
              ))}
            </div>

            {/* Milestone Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className={cn("w-4 h-4", config.theme.accent)} />
                <h4 className="font-semibold">Milestone</h4>
              </div>
              <div className={cn(
                "p-4 rounded-xl border bg-gradient-to-br",
                config.theme.gradient,
                "border-border/30"
              )}>
                <p className="text-sm text-muted-foreground mb-1">{milestone.label}</p>
                <p className="text-lg font-semibold">{milestone.value || "Not set yet"}</p>
                {milestone.achievedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Achieved: {new Date(milestone.achievedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Detail Fields Preview */}
            {detailConfig && detailConfig.milestoneFields.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <History className={cn("w-4 h-4", config.theme.accent)} />
                  <h4 className="font-semibold">Tracking</h4>
                </div>
                <div className="space-y-2">
                  {detailConfig.milestoneFields.slice(0, 3).map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <span className="text-sm">{field.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {field.type === 'belt_with_stripes' ? 'Set belt' :
                         field.type === 'fight_record' ? 'Set record' :
                         field.type === 'race_time' ? 'Set time' :
                         'Set value'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <DisciplineLogModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        config={config}
      />
    </>
  );
}
