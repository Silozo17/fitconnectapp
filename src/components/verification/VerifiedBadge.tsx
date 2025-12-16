import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VerifiedBadgeProps {
  verifiedAt?: string | null;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function VerifiedBadge({ 
  verifiedAt, 
  size = "md", 
  showTooltip = true,
  className 
}: VerifiedBadgeProps) {
  const badge = (
    <BadgeCheck 
      className={cn(
        "text-primary fill-primary/20",
        sizeClasses[size],
        className
      )} 
    />
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Verified Coach</p>
          {verifiedAt && (
            <p className="text-xs text-muted-foreground">
              Since {format(new Date(verifiedAt), "MMM d, yyyy")}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
