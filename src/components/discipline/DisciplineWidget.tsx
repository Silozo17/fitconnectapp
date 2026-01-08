/**
 * DisciplineWidget - Compact discipline tracking card
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, MessageSquarePlus, Trophy } from "lucide-react";
import { useDisciplineWidgetData } from "@/hooks/useDisciplineWidgetData";
import { DisciplineMetricChip } from "./DisciplineMetricChip";
import { DisciplineLogModal } from "./DisciplineLogModal";
import { DisciplineDetailsDrawer } from "./DisciplineDetailsDrawer";
import { RequestDisciplineModal } from "./RequestDisciplineModal";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisciplineIcon, getMilestoneIcon } from "@/config/disciplines/icons";
import { formatMilestoneDisplay } from "@/utils/formatMilestoneDisplay";

interface DisciplineWidgetProps {
  disciplineId: string;
  className?: string;
}

export function DisciplineWidget({ disciplineId, className }: DisciplineWidgetProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDisciplineWidgetData(disciplineId);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  if (isLoading) {
    return <DisciplineWidgetSkeleton className={className} />;
  }

  if (error || !data) {
    return null;
  }

  const { config, metrics, milestone, highlight } = data;
  const IconComponent = getDisciplineIcon(disciplineId);
  const MilestoneIcon = getMilestoneIcon(milestone.type);

  return (
    <>
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all duration-300",
        className
      )}>
        {/* Theme accent line */}
        <div className={cn("h-1 bg-gradient-to-r", config.theme.gradient)} />

        <div className="p-5">
          {/* Header: Icon + Name + Add Button */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-gradient-to-br",
              config.theme.gradient
            )}>
              <IconComponent className={cn("w-5 h-5", config.theme.accent)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{config.name}</h3>
            </div>
            <button
              onClick={() => navigate('/dashboard/client/discipline-setup')}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                "hover:bg-primary/10 text-muted-foreground hover:text-primary"
              )}
              title="Add another discipline"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Highlight */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {highlight}
          </p>

          {/* 2x2 Metric Chips */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {metrics.map((metric) => (
              <DisciplineMetricChip 
                key={metric.id} 
                metric={metric}
                accentClass={config.theme.accent}
              />
            ))}
          </div>

          {/* Milestone Strip */}
          <div className={cn(
            "flex items-center gap-2.5 p-3 rounded-xl mb-4",
            "bg-gradient-to-r",
            config.theme.gradient,
            "border border-border/50"
          )}>
            <div className={cn("p-1.5 rounded-lg", config.theme.bgAccent)}>
              <MilestoneIcon className={cn("w-4 h-4", config.theme.accent)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{milestone.label}</p>
              <p className="text-sm font-medium truncate">
                {formatMilestoneDisplay(milestone.value, milestone.type)}
              </p>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => setLogModalOpen(true)}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Log
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setDetailsDrawerOpen(true)}
              className="flex-1"
            >
              Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setRequestModalOpen(true)}
              className="shrink-0"
              title="Request more disciplines"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <DisciplineLogModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        config={config}
      />
      <DisciplineDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        disciplineId={disciplineId}
      />
      <RequestDisciplineModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
      />
    </>
  );
}

function DisciplineWidgetSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card overflow-hidden",
      className
    )}>
      <Skeleton className="h-1 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}
