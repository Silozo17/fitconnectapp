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

// Predefined sizes for squircle variant (landscape ratio ~1.75:1)
const SQUIRCLE_SIZES = {
  sm: 'w-28 h-16',      // Small - for lists (1.75:1)
  md: 'w-44 h-24',      // Medium - for cards (~1.83:1)
  lg: 'w-56 h-32',      // Large - for profiles (1.75:1)
  xl: 'w-72 h-40',      // Extra large - for hero sections (1.8:1)
};

// Always-vibrant gradient for squircle variant (regardless of rarity)
const SQUIRCLE_GRADIENT = 'bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-400';
const SQUIRCLE_GLOW = 'shadow-[0_0_30px_rgba(0,255,170,0.5)]';

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
  // Avatar shows upper body only: head extends above, waist cut off at bottom
  const sizeClass = SQUIRCLE_SIZES[size];
  
  return (
    <div 
      className={cn(
        "relative shrink-0 rounded-2xl",
        SQUIRCLE_GRADIENT,  // Always vibrant cyan-lime gradient for squircle
        SQUIRCLE_GLOW,      // Always vibrant glow
        sizeClass,
        className
      )}
      style={{ 
        // Allow avatar to overflow at top only, clip sides and bottom cleanly
        clipPath: hasCharacterAvatar ? 'inset(-65% 0 0 0)' : undefined 
      }}
    >
      {/* Avatar image - positioned so upper body shows, head extends above */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name || "User"} 
          className={cn(
            "absolute w-full object-contain",
            hasCharacterAvatar 
              ? "h-[350%] left-1/2 -translate-x-1/2 -bottom-[190%] object-top"
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
