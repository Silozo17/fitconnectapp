import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

interface DocStepProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
}

export function DocStep({ stepNumber, title, children }: DocStepProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border mb-3">
      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">
        {stepNumber}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

interface DocTipProps {
  children: React.ReactNode;
  className?: string;
}

export function DocTip({ children, className }: DocTipProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 mt-4",
      className
    )}>
      <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

interface DocWarningProps {
  children: React.ReactNode;
  className?: string;
}

export function DocWarning({ children, className }: DocWarningProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 mt-4",
      className
    )}>
      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

interface DocInfoProps {
  children: React.ReactNode;
  className?: string;
}

export function DocInfo({ children, className }: DocInfoProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50 mt-4",
      className
    )}>
      <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
