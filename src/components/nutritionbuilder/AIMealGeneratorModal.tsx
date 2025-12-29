import { useState } from 'react';
import { Sparkles, Loader2, ChefHat, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NutritionDay, Meal, MealFood, Food } from '@/hooks/useFoods';
import { useTranslation } from '@/hooks/useTranslation';
import { recalculateFoodCalories } from '@/lib/fitness-calculations';

interface AIMealGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  onMealPlanGenerated: (days: NutritionDay[]) => void;
}

interface AIFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fatsecret_id?: string;
  source?: 'fatsecret';
}

interface AIMeal {
  name: string;
  time: string;
  foods: AIFood[];
}

interface AIMealPlan {
  meals: AIMeal[];
}

interface ValidationResult {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  discrepancy: {
    calories: number;
    caloriePercent: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  warnings: string[];
  errors: string[];
  isAccurate: boolean;
  attempts?: number;
}

export const AIMealGeneratorModal = ({
  open,
  onOpenChange,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  onMealPlanGenerated,
}: AIMealGeneratorModalProps) => {
  const { t } = useTranslation('coach');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const generateMealPlan = async () => {
    setIsLoading(true);
    setValidationResult(null);

    try {
      // Infer diet type from carb ratio
      let dietType: 'balanced' | 'low_carb' | 'keto' | 'high_protein' | 'vegan' = 'balanced';
      const carbPercent = (targetCarbs * 4) / targetCalories * 100;
      if (carbPercent < 10) dietType = 'keto';
      else if (carbPercent < 30) dietType = 'low_carb';
      
      const response = await supabase.functions.invoke('ai-meal-suggestion', {
        body: {
          targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          preferences,
          structured: true,
          dietType,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const mealPlan: AIMealPlan = response.data?.mealPlan;
      const validation: ValidationResult | undefined = response.data?.validation;
      
      if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
        throw new Error('Invalid meal plan received from AI');
      }

      // Store validation result for display
      if (validation) {
        setValidationResult(validation);
      }

      // Check if we should warn about significant discrepancy
      const calorieDiscrepancy = validation?.discrepancy?.caloriePercent || 0;
      
      if (calorieDiscrepancy > 15) {
        // Significant discrepancy - warn user but still allow use
        toast.warning(
          t('nutritionBuilder.aiSignificantDiscrepancy', 
            `Meal plan is ${Math.round(calorieDiscrepancy)}% off your calorie target. Consider adjusting portions.`
          )
        );
      } else if (calorieDiscrepancy > 5) {
        // Minor discrepancy - info toast
        toast.info(
          t('nutritionBuilder.aiMinorDiscrepancy',
            'Meal plan macros slightly adjusted for accuracy'
          )
        );
      }

      // Convert AI response to NutritionDay format
      // All foods now come from FatSecret with verified data
      const meals: Meal[] = mealPlan.meals.map((aiMeal) => {
        const foods: MealFood[] = aiMeal.foods.map((aiFood) => {
          // Use FatSecret-verified calories (already calculated from macros on backend)
          const calculatedCalories = recalculateFoodCalories({
            protein: aiFood.protein,
            carbs: aiFood.carbs,
            fat: aiFood.fat,
          });

          const food: Food = {
            id: crypto.randomUUID(),
            name: aiFood.name,
            category_id: '',
            calories_per_100g: calculatedCalories,
            protein_g: Math.round(aiFood.protein * 10) / 10,
            carbs_g: Math.round(aiFood.carbs * 10) / 10,
            fat_g: Math.round(aiFood.fat * 10) / 10,
            fiber_g: 0,
            serving_size_g: 100,
            serving_description: aiFood.serving,
            is_custom: false,
            coach_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            fatsecret_id: aiFood.fatsecret_id || null,
            source: aiFood.source || 'fatsecret',
            // New FatSecret Premier fields
            sugar_g: null,
            sodium_mg: null,
            saturated_fat_g: null,
            image_url: null,
            allergens: [],
            dietary_preferences: [],
            barcode: null,
          };

          return {
            id: crypto.randomUUID(),
            food,
            servings: 1,
          };
        });

        return {
          id: crypto.randomUUID(),
          name: aiMeal.name,
          time: aiMeal.time,
          foods,
        };
      });

      const generatedDay: NutritionDay = {
        id: crypto.randomUUID(),
        name: t('nutritionBuilder.day') + ' 1',
        meals,
      };

      onMealPlanGenerated([generatedDay]);
      
      // Show success with accuracy info
      if (calorieDiscrepancy <= 5) {
        toast.success(t('nutritionBuilder.aiMealPlanGenerated'));
      }
      
      onOpenChange(false);
      setPreferences('');
      setValidationResult(null);
    } catch (error) {
      console.error('AI meal plan generation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          toast.error(t('nutritionBuilder.aiRateLimitError'));
        } else if (error.message.includes('credits')) {
          toast.error(t('nutritionBuilder.aiCreditsError'));
        } else {
          toast.error(t('nutritionBuilder.aiGenerationError'));
        }
      } else {
        toast.error(t('nutritionBuilder.aiGenerationError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get accuracy indicator
  const getAccuracyIndicator = () => {
    if (!validationResult) return null;
    
    const percent = validationResult.discrepancy?.caloriePercent || 0;
    
    if (percent <= 5) {
      return (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {t('nutritionBuilder.aiAccuracyGood', 'Meal plan matches your targets accurately')}
          </AlertDescription>
        </Alert>
      );
    } else if (percent <= 15) {
      return (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            {t('nutritionBuilder.aiAccuracyWarning', 
              `Plan is ${Math.round(percent)}% off target. Minor adjustments may be needed.`
            )}
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-600 dark:text-red-400">
            {t('nutritionBuilder.aiAccuracyError',
              `Plan is ${Math.round(percent)}% off target. Consider regenerating or adjusting manually.`
            )}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('nutritionBuilder.aiGenerateMealPlan')}
          </DialogTitle>
          <DialogDescription>
            {t('nutritionBuilder.aiGenerateMealPlanDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Macro Targets Display */}
          <div className="bg-background rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t('nutritionBuilder.currentMacroTargets')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{targetCalories}</div>
                <div className="text-xs text-muted-foreground">{t('nutritionBuilder.calories')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{targetProtein}g</div>
                <div className="text-xs text-muted-foreground">{t('nutritionBuilder.protein')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{targetCarbs}g</div>
                <div className="text-xs text-muted-foreground">{t('nutritionBuilder.carbs')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{targetFat}g</div>
                <div className="text-xs text-muted-foreground">{t('nutritionBuilder.fat')}</div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">{t('nutritionBuilder.dietaryPreferences')}</Label>
            <Textarea
              id="preferences"
              placeholder={t('nutritionBuilder.dietaryPreferencesPlaceholder')}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="bg-background border-border min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {t('nutritionBuilder.dietaryPreferencesHelp')}
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <ChefHat className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('nutritionBuilder.aiGenerateInfo')}
            </p>
          </div>

          {/* Accuracy Indicator */}
          {validationResult && getAccuracyIndicator()}

          {/* Data Source Info */}
          <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {t('nutritionBuilder.fatSecretDisclaimer', 'All nutrition data verified by FatSecret food database for accuracy.')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('nutritionBuilder.cancel')}
          </Button>
          <Button onClick={generateMealPlan} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('nutritionBuilder.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('nutritionBuilder.generatePlan')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
