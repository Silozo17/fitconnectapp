import { memo, useState, ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CollapsibleDashboardSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * CollapsibleDashboardSection - Collapsible section header for dashboards
 * 
 * Features:
 * - Gradient on last word of title (matching DashboardSectionHeader)
 * - Collapsible content with smooth animation
 * - Chevron indicator that rotates when open
 * - Defaults to collapsed state
 */
export const CollapsibleDashboardSection = memo(({ 
  title, 
  description,
  defaultOpen = false,
  children,
  className 
}: CollapsibleDashboardSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Split title to apply gradient to the last word
  const { prefix, lastWord } = useMemo(() => {
    const words = title.trim().split(" ");
    if (words.length === 1) {
      return { prefix: "", lastWord: words[0] };
    }
    const last = words.pop() || "";
    return { prefix: words.join(" ") + " ", lastWord: last };
  }, [title]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <button 
          type="button"
          className="w-full mb-4 flex items-start justify-between gap-4 text-left group cursor-pointer"
        >
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {prefix}<span className="gradient-text">{lastWord}</span>
            </h2>
            {description && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div className="shrink-0 p-1.5 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
});

CollapsibleDashboardSection.displayName = "CollapsibleDashboardSection";
