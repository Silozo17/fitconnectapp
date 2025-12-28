import { GraduationCap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface QualifiedCoachBadgeProps {
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export function QualifiedCoachBadge({ 
  count, 
  size = "md", 
  className,
  showTooltip = true 
}: QualifiedCoachBadgeProps) {
  if (count < 1) return null;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const badge = (
    <div 
      className={cn(
        "inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400",
        className
      )}
    >
      <GraduationCap className={sizeClasses[size]} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Qualified Coach</p>
          <p className="text-xs text-muted-foreground">
            {count} verified qualification{count !== 1 ? 's' : ''}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
