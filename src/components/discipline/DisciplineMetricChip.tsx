/**
 * DisciplineMetricChip - Compact metric display with source indicator
 */

import { cn } from "@/lib/utils";
import { ComputedMetric } from "@/config/disciplines/types";
import { getFormatterUnit } from "@/services/discipline/metricResolvers";
import { Watch, Pencil, Layers, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DisciplineMetricChipProps {
  metric: ComputedMetric;
  accentClass?: string;
}

function SourceIndicator({ source }: { source: ComputedMetric['source'] }) {
  if (!source) return null;
  
  const icons = {
    wearable: <Watch className="w-3 h-3" />,
    manual: <Pencil className="w-3 h-3" />,
    mixed: <Layers className="w-3 h-3" />,
  };

  const labels = {
    wearable: 'Wearable',
    manual: 'Manual',
    mixed: 'Mixed',
  };

  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      {icons[source]}
      <span>{labels[source]}</span>
    </div>
  );
}

function TrendArrow({ trend }: { trend?: ComputedMetric['trend'] }) {
  if (!trend || trend.direction === 'stable') return null;

  return (
    <div className={cn(
      "flex items-center gap-0.5 text-xs font-medium",
      trend.direction === 'up' ? "text-green-500" : "text-red-500"
    )}>
      {trend.direction === 'up' ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      <span>{trend.percent}%</span>
    </div>
  );
}

function TimeframeBadge({ timeframe }: { timeframe: string }) {
  const labels: Record<string, string> = {
    '7d': '7d',
    '30d': '30d',
    '90d': '90d',
    'all-time': 'All',
  };

  return (
    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
      {labels[timeframe] || timeframe}
    </Badge>
  );
}

export function DisciplineMetricChip({ metric, accentClass }: DisciplineMetricChipProps) {
  const unit = getFormatterUnit(metric.formatter);
  const hasValue = metric.value > 0;

  return (
    <div className={cn(
      "p-3 rounded-xl bg-muted/40 border border-border/50",
      "transition-all duration-300 ease-out",
      "animate-in fade-in-50 zoom-in-95",
      "hover:bg-muted/60 hover:border-border"
    )}>
      {/* Header: Label + Timeframe */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-medium truncate">
          {metric.label}
        </span>
        <TimeframeBadge timeframe={metric.timeframe} />
      </div>

      {/* Value Row */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className={cn(
          "text-xl font-bold tracking-tight",
          hasValue ? "text-foreground" : "text-muted-foreground"
        )}>
          {metric.formattedValue}
        </span>
        {hasValue && unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
        <TrendArrow trend={metric.trend} />
      </div>

      {/* Source Indicator */}
      <SourceIndicator source={metric.source} />
    </div>
  );
}
