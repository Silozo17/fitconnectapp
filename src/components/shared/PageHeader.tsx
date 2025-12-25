import { memo, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  variant?: "default" | "gradient" | "minimal";
  children?: ReactNode;
}

export const PageHeader = memo(({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
  showBack = false,
  backHref,
  onBack,
  variant = "default",
  children,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      navigate(backHref);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn(
      "relative",
      variant === "gradient" && "gradient-header pb-8",
      variant === "minimal" && "pb-4",
      variant === "default" && "pb-6",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-xl h-10 w-10 shrink-0 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          {Icon && (
            <div className="icon-square bg-primary/10 shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              "font-display font-bold text-foreground truncate",
              variant === "minimal" ? "text-xl" : "text-2xl md:text-3xl"
            )}>
              {title}
            </h1>
            
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      
      {children}
    </div>
  );
});

PageHeader.displayName = "PageHeader";
