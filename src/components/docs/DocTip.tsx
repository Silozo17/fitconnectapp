import { cn } from "@/lib/utils";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";

interface DocTipProps {
  type?: "tip" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DocTip({ type = "tip", title, children, className }: DocTipProps) {
  const config = {
    tip: {
      icon: Lightbulb,
      bgClass: "bg-primary/10 border-primary/30",
      iconClass: "text-primary",
      defaultTitle: "Pro Tip",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-amber-500/10 border-amber-500/30",
      iconClass: "text-amber-500",
      defaultTitle: "Warning",
    },
    info: {
      icon: Info,
      bgClass: "bg-blue-500/10 border-blue-500/30",
      iconClass: "text-blue-500",
      defaultTitle: "Note",
    },
  };

  const { icon: Icon, bgClass, iconClass, defaultTitle } = config[type];

  return (
    <div className={cn("rounded-lg border p-4 my-4", bgClass, className)}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconClass)} />
        <div>
          <p className="font-medium text-foreground text-sm mb-1">
            {title || defaultTitle}
          </p>
          <div className="text-muted-foreground text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
