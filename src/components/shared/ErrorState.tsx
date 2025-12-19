import { memo, ReactNode } from "react";
import { AlertCircle, RefreshCw, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: ReactNode;
  variant?: "default" | "inline" | "compact";
}

export const ErrorState = memo(({ 
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  icon: Icon = AlertCircle,
  onRetry,
  retryLabel = "Try again",
  className,
  children,
  variant = "default"
}: ErrorStateProps) => {
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive",
        className
      )} role="alert">
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">{title}</span>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="ml-auto h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-8 px-4 text-center",
        className
      )} role="alert">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-destructive" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1.5" />
            {retryLabel}
          </Button>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )} role="alert">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-destructive" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryLabel}
        </Button>
      )}
      
      {children}
    </div>
  );
});

ErrorState.displayName = "ErrorState";
