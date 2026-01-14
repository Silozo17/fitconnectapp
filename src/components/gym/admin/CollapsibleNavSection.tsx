import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleNavSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasActiveChild?: boolean;
  storageKey?: string;
}

export function CollapsibleNavSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  hasActiveChild = false,
  storageKey,
}: CollapsibleNavSectionProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (storageKey) {
      const stored = localStorage.getItem(`nav-section-${storageKey}`);
      if (stored !== null) {
        return stored === "true";
      }
    }
    return defaultOpen || hasActiveChild;
  });

  // Auto-expand when a child becomes active
  useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  // Persist state
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`nav-section-${storageKey}`, String(isOpen));
    }
  }, [isOpen, storageKey]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pt-1">
        <div className="space-y-1 border-l border-border/50 pl-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
