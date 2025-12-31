import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AtRiskClientsBadgeProps {
  riskStage?: number;
  isAtRisk?: boolean;
  compact?: boolean;
}

export function AtRiskClientsBadge({ riskStage = 0, isAtRisk = false, compact = false }: AtRiskClientsBadgeProps) {
  if (!isAtRisk || riskStage === 0) return null;

  const getRiskLevel = () => {
    if (riskStage >= 3) return { label: 'High Risk', color: 'bg-destructive/20 text-destructive border-destructive/30' };
    if (riskStage >= 2) return { label: 'At Risk', color: 'bg-warning/20 text-warning border-warning/30' };
    return { label: 'Watch', color: 'bg-muted text-muted-foreground border-muted' };
  };

  const { label, color } = getRiskLevel();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1 rounded ${riskStage >= 3 ? 'text-destructive' : 'text-warning'}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label} - Inactive client</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className={`text-xs gap-1 ${color}`}>
      <AlertTriangle className="h-3 w-3" />
      {label}
    </Badge>
  );
}
