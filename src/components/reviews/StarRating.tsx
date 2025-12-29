import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const StarRating = ({ 
  rating, 
  reviewCount = 0, 
  size = "md",
  showCount = true 
}: StarRatingProps) => {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (reviewCount === 0 && !rating) {
    return (
      <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
        <Star className={cn(sizes[size], "text-muted-foreground")} />
        <span className="text-sm text-muted-foreground">Not Yet Rated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
        <Star className={cn(sizes[size], "fill-amber-500 text-amber-500")} />
        <span className="text-sm font-semibold text-amber-600">
          {rating.toFixed(1)}
        </span>
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-xs text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;
