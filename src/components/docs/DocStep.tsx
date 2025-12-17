import { cn } from "@/lib/utils";

interface DocStepProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DocStep({ number, title, children, className }: DocStepProps) {
  return (
    <div className={cn("flex gap-4 mb-6", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
