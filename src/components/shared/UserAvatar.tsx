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
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Predefined sizes for squircle
}

// Predefined sizes for squircle variant
const SQUIRCLE_SIZES = {
  '2xs': 'w-10 h-6',    // Tiny - for very compact contexts
  xs: 'w-14 h-8',       // Extra small - for nav headers and lists
  sm: 'w-28 h-16',      // Small - for lists (1.75:1)
  md: 'w-44 h-24',      // Medium - for cards (~1.83:1)
  lg: 'w-56 h-32',      // Large - for profiles (1.75:1)
  xl: 'w-64 h-48',      // Extra large - for hero sections (taller to show more body)
};

// Size-aware positioning for character avatars in squircle variant
// Height extends beyond container, positioned at bottom so head overflows above
const SQUIRCLE_IMAGE_STYLES = {
  '2xs': { height: '140%', bottom: '0' },
  xs: { height: '140%', bottom: '0' },
  sm: { height: '140%', bottom: '0' },
  md: { height: '145%', bottom: '0' },
  lg: { height: '150%', bottom: '0' },
  xl: { height: '200%', bottom: '-50%' },  // Push avatar down to show upper body
};

// Size-aware clipPath - negative top inset allows head to overflow upward
const SQUIRCLE_CLIP_PATHS = {
  '2xs': 'inset(-55% 0 0 0)',
  xs: 'inset(-55% 0 0 0)',
  sm: 'inset(-55% 0 0 0)',
  md: 'inset(-50% 0 0 0)',
  lg: 'inset(-45% 0 0 0)',
  xl: 'inset(-20% 0 0 0)',  // Less overflow, avatar appears lower  // Less clipping for hero size
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

  // Priority: 1) Uploaded photo, 2) Character avatar slug, 3) Default avatar
  const getImageUrl = () => {
    if (src) {
      return src;  // Uploaded photo takes top priority
    }
    if (avatarSlug) {
      return getAvatarImageUrl(avatarSlug);
    }
    // Use default avatar if no photo and no selected avatar
    return getAvatarImageUrl(DEFAULT_AVATAR.slug);
  };

  const imageUrl = getImageUrl();
  // Has uploaded photo - takes priority over character avatars
  const hasUploadedPhoto = !!src;
  // Has character avatar only when NO uploaded photo exists
  const hasCharacterAvatar = !src;
  
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
  const imageStyle = SQUIRCLE_IMAGE_STYLES[size];
  
  return (
    <div 
      className={cn(
        "relative shrink-0 rounded-2xl overflow-visible",
        // Only show gradient for character avatars, neutral background for uploaded photos
        hasCharacterAvatar && SQUIRCLE_GRADIENT,
        hasCharacterAvatar && SQUIRCLE_GLOW,
        hasUploadedPhoto && "bg-muted",
        sizeClass,
        className
      )}
      style={{ 
        // Allow avatar to overflow at top only for character avatars
        clipPath: hasCharacterAvatar ? SQUIRCLE_CLIP_PATHS[size] : undefined 
      }}
    >
      {/* Avatar image */}
      {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name || "User"} 
            className={cn(
              hasCharacterAvatar 
                ? "absolute w-full object-contain left-1/2 -translate-x-1/2 object-bottom bottom-0"
                : "absolute inset-0 w-full h-full object-cover rounded-2xl"
            )}
            style={hasCharacterAvatar ? {
              height: imageStyle.height,
              bottom: imageStyle.bottom,
            } : undefined}
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
