import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants: Record<string, string> = {
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    suspended: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    banned: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(variants[status] || variants.active, "capitalize", className)}
    >
      {status || "active"}
    </Badge>
  );
};
