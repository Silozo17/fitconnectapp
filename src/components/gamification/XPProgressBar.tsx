import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { useClientXP, getLevelTitle, calculateLevelFromXP } from '@/hooks/useGamification';
import { Zap } from 'lucide-react';
import { ProgressCircle } from '@/components/stats/ProgressCircle';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { getMetricExplanation } from '@/lib/metric-explanations';

interface XPProgressBarProps {
  compact?: boolean;
  variant?: 'linear' | 'circular';
}

export function XPProgressBar({ compact = false, variant = 'linear' }: XPProgressBarProps) {
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

  // Circular variant
  if (variant === 'circular') {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-4">
          <ProgressCircle
            value={xpInLevel}
            maxValue={xpForNextLevel}
            size="lg"
            color="primary"
            showPercentage={false}
            showCompletedIcon={false}
          >
            <div className="flex flex-col items-center justify-center">
              <Zap className="h-6 w-6 text-primary mb-1" />
              <span className="text-2xl font-bold text-foreground font-display">
                {level}
              </span>
              <span className="text-[10px] text-muted-foreground">LEVEL</span>
            </div>
          </ProgressCircle>
          
          <div className="flex-1">
            <div className="font-bold text-foreground text-lg">{title}</div>
            <div className="text-2xl font-bold text-primary">{totalXP.toLocaleString()} XP</div>
            <div className="text-xs text-muted-foreground mt-1">
              {xpInLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} to Level {level + 1}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Linear variant (default)
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 rounded-full p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">{t('xp.level')} {level}</span>
              <InfoTooltip explanation={getMetricExplanation('xpLevel')} side="top" />
            </div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-2xl font-bold text-primary">{totalXP.toLocaleString()}</span>
            <InfoTooltip explanation={getMetricExplanation('totalXP')} side="top" />
          </div>
          <div className="text-xs text-muted-foreground">{t('xp.totalXp')}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={Math.max(progressPercent, 8)} 
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
