import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { DEFAULT_AVATAR, RARITY_CONFIG, Rarity } from "@/lib/avatar-config";

interface UserAvatarProps {
  src?: string | null;           // Uploaded profile photo
  avatarSlug?: string | null;    // Selected character avatar slug
  avatarRarity?: Rarity | null;  // Rarity for border styling
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  showRarityBorder?: boolean;    // Whether to show rarity-colored border
  variant?: 'circle' | 'squircle'; // Avatar shape variant
}

export const UserAvatar = ({ 
  src, 
  avatarSlug, 
  avatarRarity,
  name, 
  className, 
  fallbackClassName,
  showRarityBorder = false,
  variant = 'circle'
}: UserAvatarProps) => {
  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name for fallback
  const getAvatarColor = () => {
    if (!name) return "bg-primary/20 text-primary";
    const colors = [
      "bg-primary/20 text-primary",
      "bg-accent/20 text-accent",
      "bg-blue-500/20 text-blue-500",
      "bg-green-500/20 text-green-500",
      "bg-purple-500/20 text-purple-500",
      "bg-orange-500/20 text-orange-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Priority: 1) Character avatar slug, 2) Uploaded photo, 3) Default avatar, 4) Initials
  const getImageUrl = () => {
    if (avatarSlug) {
      return getAvatarImageUrl(avatarSlug);
    }
    if (src) {
      return src;
    }
    // Use default avatar if no photo and no selected avatar
    return getAvatarImageUrl(DEFAULT_AVATAR.slug);
  };

  const imageUrl = getImageUrl();
  const hasCharacterAvatar = !!avatarSlug || (!src && !avatarSlug);
  
  // Get rarity config for styling
  const rarityConfig = avatarRarity ? RARITY_CONFIG[avatarRarity] : RARITY_CONFIG.common;
  
  // Circle variant (default) - uses shadcn Avatar component
  if (variant === 'circle') {
    const borderClass = showRarityBorder && avatarRarity 
      ? `${rarityConfig.border} border-2` 
      : "border border-border";

    return (
      <Avatar className={cn(borderClass, className)}>
        <AvatarImage 
          src={imageUrl || undefined} 
          alt={name || "User"} 
          className={cn(
            "object-cover",
            // Character avatars use object-top to show head/face area in circular containers
            hasCharacterAvatar && "object-top bg-gradient-to-br from-background to-muted/50"
          )} 
        />
        <AvatarFallback className={cn("font-semibold", getAvatarColor(), fallbackClassName)}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Squircle variant - rounded square with gradient background and avatar overflow
  return (
    <div 
      className={cn(
        "relative shrink-0 rounded-2xl overflow-hidden",
        rarityConfig.gradient,
        rarityConfig.glow,
        className
      )}
    >
      {/* Avatar image - positioned to extend above container */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name || "User"} 
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            // For character avatars, position to show head/upper body
            hasCharacterAvatar && "object-top scale-110 translate-y-[5%]"
          )}
        />
      ) : (
        // Fallback with initials
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold text-white",
          fallbackClassName
        )}>
          {getInitials()}
        </div>
      )}
    </div>
  );
};
