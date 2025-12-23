import { useState, useEffect } from "react";
import { Check, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_AVATARS, RARITY_CONFIG } from "@/lib/avatar-utils";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const { t } = useTranslation('common');
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchFreeAvatars = async () => {
      const { data, error } = await supabase
        .from("avatars")
        .select("id, slug, name")
        .in("slug", FREE_AVATARS.map(a => a.slug))
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching avatars:", error);
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

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
            {t('onboarding.chooseAvatar')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('onboarding.loadingAvatars')}</p>
        </div>
        <div className="flex justify-center gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-24 h-28 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
          {t('onboarding.chooseAvatar')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.pickCharacter')}
        </p>
      </div>

      {/* Carousel for avatars - swipeable on mobile */}
      <div className="px-2">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 py-1">
            {avatars.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;

              return (
                <CarouselItem key={avatar.id} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5">
                  <div className="p-0.5">
                    <button
                      type="button"
                      onClick={() => onSelect(avatar.id, avatar.slug)}
                      className={cn(
                        "relative w-full group rounded-xl transition-all duration-200",
                        "border-2 bg-gradient-to-br from-card to-background",
                        "hover:scale-105 hover:shadow-lg active:scale-95",
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                          : "border-border/50 hover:border-primary/50"
                      )}
                    >
                    {/* Avatar Image - reduced aspect ratio for mobile */}
                    <div className="aspect-square p-1.5 sm:p-2">
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
                      <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                    )}

                      {/* Avatar Name */}
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 text-center",
                        "bg-gradient-to-t from-background/90 to-transparent"
                      )}>
                        <p className={cn(
                          "text-xs sm:text-sm font-medium line-clamp-1 text-center",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {avatar.name}
                        </p>
                      </div>
                    </button>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Navigation arrows - hidden on mobile, visible on desktop */}
          <CarouselPrevious className="hidden sm:flex -left-2 h-8 w-8" />
          <CarouselNext className="hidden sm:flex -right-2 h-8 w-8" />
        </Carousel>

        {/* Dot indicators for mobile */}
        <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
          {avatars.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                current === index
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
              )}
              aria-label={`Go to avatar ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Compact tip */}
      <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{t('common.tip', 'Tip')}:</span> {t('onboarding.avatarTip')}
        </p>
      </div>
    </div>
  );
}
