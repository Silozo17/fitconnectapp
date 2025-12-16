import { getAvatarImageUrl } from '@/hooks/useAvatars';
import { cn } from '@/lib/utils';

interface DecorativeAvatarProps {
  avatarSlug: string;
  position?: 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  opacity?: number;
}

const sizeClasses = {
  sm: 'w-20 h-28',
  md: 'w-32 h-44',
  lg: 'w-48 h-64',
  xl: 'w-64 h-80',
};

const positionClasses = {
  'left': 'left-0 top-1/2 -translate-y-1/2',
  'right': 'right-0 top-1/2 -translate-y-1/2',
  'bottom-left': 'left-4 bottom-4',
  'bottom-right': 'right-4 bottom-4',
  'top-left': 'left-4 top-4',
  'top-right': 'right-4 top-4',
};

export function DecorativeAvatar({
  avatarSlug,
  position = 'bottom-right',
  size = 'md',
  className,
  animate = true,
  opacity = 30,
}: DecorativeAvatarProps) {
  // Convert hyphens to underscores for the avatar URL function
  const normalizedSlug = avatarSlug.replace(/-/g, '_');
  const imageUrl = getAvatarImageUrl(normalizedSlug);
  return (
    <div
      className={cn(
        'absolute pointer-events-none select-none hidden md:block',
        positionClasses[position],
        sizeClasses[size],
        animate && 'animate-float',
        className
      )}
      style={{ opacity: opacity / 100 }}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-contain drop-shadow-2xl"
        aria-hidden="true"
      />
    </div>
  );
}
