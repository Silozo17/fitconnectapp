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
}

export const EmptyState = memo(({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className,
  children 
}: EmptyStateProps) => {
  const { t } = useTranslation();
  
  const displayTitle = title || t('empty.nothingHere');
  const displayDescription = description || t('empty.getStarted');

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {displayTitle}
      </h3>
      
      {displayDescription && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {displayDescription}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
