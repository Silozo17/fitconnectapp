import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface MacroTrackerProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  compact?: boolean;
}

export const MacroTracker = ({
  calories,
  protein,
  carbs,
  fat,
  targetCalories = 2000,
  targetProtein = 150,
  targetCarbs = 200,
  targetFat = 65,
  compact = false,
}: MacroTrackerProps) => {
  const { t } = useTranslation('coach');
  const caloriePercent = Math.min((calories / targetCalories) * 100, 100);
  const proteinPercent = Math.min((protein / targetProtein) * 100, 100);
  const carbsPercent = Math.min((carbs / targetCarbs) * 100, 100);
  const fatPercent = Math.min((fat / targetFat) * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-primary font-medium">{Math.round(calories)}</span>
          <span className="text-muted-foreground">/ {targetCalories} cal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-400 font-medium">{Math.round(protein)}g</span>
          <span className="text-muted-foreground">P</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 font-medium">{Math.round(carbs)}g</span>
          <span className="text-muted-foreground">C</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-400 font-medium">{Math.round(fat)}g</span>
          <span className="text-muted-foreground">F</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('nutritionBuilder.dailyMacros')}
      </h3>
      
      {/* Calories */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">{t('nutritionBuilder.calories')}</span>
          <span className="text-sm font-medium text-primary">
            {Math.round(calories)} / {targetCalories}
          </span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              caloriePercent > 100 ? "bg-red-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(caloriePercent, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{Math.round(protein)}g</div>
          <div className="text-xs text-muted-foreground mb-1">/ {targetProtein}g</div>
          <Progress 
            value={proteinPercent} 
            className="h-1.5 bg-background [&>div]:bg-red-400" 
          />
          <div className="text-xs text-muted-foreground mt-1">{t('nutritionBuilder.protein')}</div>
        </div>
        
        {/* Carbs */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{Math.round(carbs)}g</div>
          <div className="text-xs text-muted-foreground mb-1">/ {targetCarbs}g</div>
          <Progress 
            value={carbsPercent} 
            className="h-1.5 bg-background [&>div]:bg-yellow-400" 
          />
          <div className="text-xs text-muted-foreground mt-1">{t('nutritionBuilder.carbs')}</div>
        </div>
        
        {/* Fat */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{Math.round(fat)}g</div>
          <div className="text-xs text-muted-foreground mb-1">/ {targetFat}g</div>
          <Progress 
            value={fatPercent} 
            className="h-1.5 bg-background [&>div]:bg-blue-400" 
          />
          <div className="text-xs text-muted-foreground mt-1">{t('nutritionBuilder.fat')}</div>
        </div>
      </div>
    </div>
  );
};
