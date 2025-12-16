import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites, useToggleFavourite } from "@/hooks/useFavourites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  coachId: string;
  variant?: "icon" | "button";
  className?: string;
}

const FavouriteButton = ({ coachId, variant = "icon", className }: FavouriteButtonProps) => {
  const { user, role } = useAuth();
  const { data: favourites = [] } = useFavourites();
  const toggleFavourite = useToggleFavourite();
  
  const isFavourite = favourites.some((fav) => fav.coach_id === coachId);

  // Only show for authenticated clients
  if (!user || role !== "client") {
    return null;
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await toggleFavourite.mutateAsync({ coachId, isFavourite });
      toast.success(result.action === "added" ? "Added to favourites" : "Removed from favourites");
    } catch (error) {
      toast.error("Failed to update favourites");
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant={isFavourite ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={toggleFavourite.isPending}
        className={className}
      >
        {toggleFavourite.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4 mr-2", isFavourite && "fill-current")} />
        )}
        {isFavourite ? "Favourited" : "Add to Favourites"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggleFavourite.isPending}
      className={cn(
        "p-2 rounded-full transition-all hover:scale-110",
        isFavourite 
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground",
        className
      )}
      aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
    >
      {toggleFavourite.isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={cn("h-5 w-5", isFavourite && "fill-current")} />
      )}
    </button>
  );
};

export default FavouriteButton;
