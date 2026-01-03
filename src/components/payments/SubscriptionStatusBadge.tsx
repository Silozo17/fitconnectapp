import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionStatusBadgeProps {
  status: 'active' | 'activating' | 'cancelled' | 'past_due' | 'pending_change' | 'expired';
  effectiveDate?: string | null;
  pendingTier?: string | null;
  className?: string;
}

/**
 * Reusable badge component for displaying subscription status
 * Handles: Active, Activating, Cancelled (with date), Past Due, Pending Change
 */
export const SubscriptionStatusBadge = ({
  status,
  effectiveDate,
  pendingTier,
  className,
}: SubscriptionStatusBadgeProps) => {
  const formattedDate = effectiveDate
    ? new Date(effectiveDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  switch (status) {
    case 'active':
      return (
        <Badge 
          variant="default" 
          className={cn("bg-green-500/20 text-green-700 border-green-500/30", className)}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );

    case 'activating':
      return (
        <Badge 
          variant="secondary" 
          className={cn("bg-blue-500/20 text-blue-700 border-blue-500/30 animate-pulse", className)}
        >
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Activating...
        </Badge>
      );

    case 'cancelled':
      return (
        <Badge 
          variant="secondary" 
          className={cn("bg-amber-500/20 text-amber-700 border-amber-500/30", className)}
        >
          <Clock className="h-3 w-3 mr-1" />
          {formattedDate ? `Ends ${formattedDate}` : 'Cancelled'}
        </Badge>
      );

    case 'past_due':
      return (
        <Badge 
          variant="destructive" 
          className={cn("bg-red-500/20 text-red-700 border-red-500/30", className)}
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Past Due
        </Badge>
      );

    case 'pending_change':
      return (
        <Badge 
          variant="secondary" 
          className={cn("bg-amber-500/20 text-amber-700 border-amber-500/30", className)}
        >
          <Clock className="h-3 w-3 mr-1" />
          {pendingTier && formattedDate 
            ? `Changes to ${pendingTier} on ${formattedDate}`
            : 'Change pending'}
        </Badge>
      );

    case 'expired':
      return (
        <Badge 
          variant="secondary" 
          className={cn("bg-muted text-muted-foreground", className)}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );

    default:
      return null;
  }
};

export default SubscriptionStatusBadge;
