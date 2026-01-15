import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: SlidePanelProps) {
  const widthClasses = {
    sm: "w-[360px]",
    md: "w-[480px]",
    lg: "w-[600px]",
    xl: "w-[800px]",
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn("gym-slide-panel-overlay", open && "open")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "gym-slide-panel",
          widthClasses[width],
          open && "open"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-panel-title"
      >
        {/* Header */}
        <div className="gym-slide-panel-header">
          <div>
            <h2 id="slide-panel-title" className="gym-slide-panel-title">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[hsl(var(--gym-card-muted))] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="gym-slide-panel-content">{children}</div>

        {/* Footer */}
        {footer && <div className="gym-slide-panel-footer">{footer}</div>}
      </div>
    </>
  );
}
