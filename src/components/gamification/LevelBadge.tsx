import { cn } from '@/lib/utils';
import { getLevelBadgeUrl, getLevelTitle } from '@/hooks/useGamification';

interface LevelBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LevelBadge({ level, size = 'md', showLabel = false, className }: LevelBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={getLevelBadgeUrl(level)}
        alt={`Level ${level}`}
        className={cn('rounded-lg object-cover', SIZES[size])}
      />
      {showLabel && (
        <div className="text-xs">
          <p className="font-bold">Lvl {level}</p>
          <p className="text-muted-foreground">{getLevelTitle(level)}</p>
        </div>
      )}
    </div>
  );
}
