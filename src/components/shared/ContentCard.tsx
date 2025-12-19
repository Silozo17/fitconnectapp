import { memo, ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  headerAction?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  noPadding?: boolean;
}

export const ContentCard = memo(({ 
  title, 
  description, 
  icon: Icon,
  headerAction,
  footer,
  loading = false,
  className,
  contentClassName,
  children,
  noPadding = false
}: ContentCardProps) => {
  if (loading) {
    return (
      <Card className={cn("", className)}>
        {(title || description) && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                {description && <Skeleton className="h-4 w-48" />}
              </div>
              {headerAction && <Skeleton className="h-9 w-24" />}
            </div>
          </CardHeader>
        )}
        <CardContent className={noPadding ? "p-0" : ""}>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      {(title || description || headerAction) && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-1">
                {title && <CardTitle className="text-lg">{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t border-border pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
});

ContentCard.displayName = "ContentCard";
