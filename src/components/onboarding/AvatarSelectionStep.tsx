import { useState, useEffect } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_AVATARS, RARITY_CONFIG } from "@/lib/avatar-utils";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { supabase } from "@/integrations/supabase/client";

interface AvatarSelectionStepProps {
  selectedAvatarId: string | null;
  onSelect: (avatarId: string | null, avatarSlug: string) => void;
}

interface AvatarOption {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
}

export function AvatarSelectionStep({ selectedAvatarId, onSelect }: AvatarSelectionStepProps) {
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreeAvatars = async () => {
      // Fetch the actual avatar records from the database to get their IDs
      const { data, error } = await supabase
        .from("avatars")
        .select("id, slug, name")
        .in("slug", FREE_AVATARS.map(a => a.slug))
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching avatars:", error);
        // Fallback to using slugs without IDs
        setAvatars(FREE_AVATARS.map(a => ({
          id: a.slug,
          slug: a.slug,
          name: a.name,
          imageUrl: getAvatarImageUrl(a.slug)
        })));
      } else if (data) {
        setAvatars(data.map(a => ({
          id: a.id,
          slug: a.slug,
          name: a.name,
          imageUrl: getAvatarImageUrl(a.slug)
        })));
      }
      setLoading(false);
    };

    fetchFreeAvatars();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Choose Your Avatar
          </h2>
          <p className="text-muted-foreground">Loading avatars...</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Choose Your Avatar
        </h2>
        <p className="text-muted-foreground">
          Pick a character to represent you on your fitness journey.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          const rarityConfig = RARITY_CONFIG.common;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id, avatar.slug)}
              className={cn(
                "relative group rounded-xl overflow-hidden transition-all duration-200",
                "border-2 bg-gradient-to-br from-card to-background",
                "hover:scale-105 hover:shadow-lg",
                isSelected
                  ? "border-primary ring-2 ring-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {/* Avatar Image */}
              <div className="aspect-[3/4] p-2">
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Avatar Name */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 p-2 text-center",
                "bg-gradient-to-t from-background/90 to-transparent"
              )}>
                <p className={cn(
                  "text-xs font-medium line-clamp-2 text-center",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {avatar.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> Complete challenges and hit milestones to unlock more unique avatars!
        </p>
      </div>
    </div>
  );
}
