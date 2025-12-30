import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricExplanation } from "@/lib/metric-explanations";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  explanation: MetricExplanation;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({
  explanation,
  className,
  iconClassName,
  side = "top",
}: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              className
            )}
            aria-label={`Learn more about ${explanation.title}`}
          >
            <Info className={cn("h-3.5 w-3.5", iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[280px] p-3 space-y-2"
        >
          <div className="font-semibold text-foreground text-sm">
            {explanation.title}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {explanation.description}
          </p>
          {explanation.goodRange && (
            <div className="text-xs">
              <span className="text-green-500 font-medium">Good range: </span>
              <span className="text-muted-foreground">{explanation.goodRange}</span>
            </div>
          )}
          {explanation.howToImprove && (
            <div className="text-xs">
              <span className="text-primary font-medium">Tip: </span>
              <span className="text-muted-foreground">{explanation.howToImprove}</span>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
