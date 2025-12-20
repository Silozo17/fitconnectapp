import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { useClientXP, getLevelTitle, calculateLevelFromXP } from '@/hooks/useGamification';
import { Zap } from 'lucide-react';

interface XPProgressBarProps {
  compact?: boolean;
}

export function XPProgressBar({ compact = false }: XPProgressBarProps) {
  const { t } = useTranslation('gamification');
  const { data: clientXP, isLoading } = useClientXP();
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg h-16" />
    );
  }
  
  const totalXP = clientXP?.total_xp || 0;
  const { level, xpInLevel, xpForNextLevel } = calculateLevelFromXP(totalXP);
  const progressPercent = (xpInLevel / xpForNextLevel) * 100;
  const title = getLevelTitle(level);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-primary font-bold">
          <Zap className="h-4 w-4" />
          <span>{totalXP}</span>
        </div>
        <span className="text-xs text-muted-foreground">{t('xp.lvl')} {level}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 rounded-full p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground">{t('xp.level')} {level}</div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{t('xp.totalXp')}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={progressPercent} 
          className="h-3 bg-muted"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{xpInLevel.toLocaleString()} XP</span>
          <span>{t('xp.xpToNextLevel', { xp: xpForNextLevel.toLocaleString(), level: level + 1 })}</span>
        </div>
      </div>
    </div>
  );
}
