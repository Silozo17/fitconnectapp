import { memo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  children?: ReactNode;
  variant?: "default" | "compact" | "large";
}

export const EmptyState = memo(({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className,
  children,
  variant = "default",
}: EmptyStateProps) => {
  const { t } = useTranslation();
  
  const displayTitle = title || t('empty.nothingHere');
  const displayDescription = description || t('empty.getStarted');

  const iconSizes = {
    default: "w-20 h-20",
    compact: "w-14 h-14",
    large: "w-24 h-24",
  };

  const iconInnerSizes = {
    default: "w-10 h-10",
    compact: "w-6 h-6",
    large: "w-12 h-12",
  };

  const paddingSizes = {
    default: "py-16 px-6",
    compact: "py-8 px-4",
    large: "py-20 px-8",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center animate-fade-in",
      paddingSizes[variant],
      className
    )}>
      {/* Premium icon container with gradient background */}
      <div className={cn(
        "rounded-3xl flex items-center justify-center mb-6 relative",
        "bg-gradient-to-br from-muted to-muted/50",
        "border border-border/30",
        "shadow-elevation-2",
        iconSizes[variant]
      )}>
        <Icon className={cn(
          "text-muted-foreground",
          iconInnerSizes[variant]
        )} />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-primary/5 blur-xl -z-10" />
      </div>
      
      <h3 className={cn(
        "font-semibold text-foreground mb-2 font-display",
        variant === "large" ? "text-2xl" : variant === "compact" ? "text-base" : "text-xl"
      )}>
        {displayTitle}
      </h3>
      
      {displayDescription && (
        <p className={cn(
          "text-muted-foreground max-w-sm mb-6",
          variant === "large" ? "text-base" : "text-sm"
        )}>
          {displayDescription}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick} 
          variant="outline" 
          size={variant === "compact" ? "sm" : "default"}
          className="rounded-xl"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
