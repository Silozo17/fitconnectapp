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
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Predefined sizes for squircle
}

// Predefined sizes for squircle variant (width x height)
const SQUIRCLE_SIZES = {
  sm: 'w-16 h-20',      // Small - for lists
  md: 'w-24 h-28',      // Medium - for cards  
  lg: 'w-32 h-40',      // Large - for profiles
  xl: 'w-40 h-52',      // Extra large - for hero sections
};

export const UserAvatar = ({ 
  src, 
  avatarSlug, 
  avatarRarity,
  name, 
  className, 
  fallbackClassName,
  showRarityBorder = false,
  variant = 'circle',
  size = 'md'
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

  // NFT-style squircle variant with overflow effect
  const sizeClass = SQUIRCLE_SIZES[size];
  
  return (
    <div 
      className={cn(
        "relative shrink-0 rounded-3xl",
        rarityConfig.gradient,
        rarityConfig.glow,
        sizeClass,
        className
      )}
      style={{ 
        // Allow avatar to overflow at top while containing sides/bottom
        clipPath: hasCharacterAvatar ? 'inset(-30% -5% 0% -5%)' : undefined 
      }}
    >
      {/* Avatar image - positioned to extend ABOVE container */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name || "User"} 
          className={cn(
            "absolute w-full object-contain",
            hasCharacterAvatar 
              ? "h-[140%] bottom-0 left-1/2 -translate-x-1/2 object-bottom" 
              : "inset-0 h-full object-cover"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      ) : (
        // Fallback with initials
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-bold text-white text-2xl",
          fallbackClassName
        )}>
          {getInitials()}
        </div>
      )}
    </div>
  );
};
