import { useState } from 'react';
import { Sparkles, Loader2, ChefHat, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
}

interface AIMeal {
  name: string;
  time: string;
  foods: AIFood[];
}

interface AIMealPlan {
  meals: AIMeal[];
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

  const generateMealPlan = async () => {
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-meal-suggestion', {
        body: {
          targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          preferences,
          structured: true, // Request structured JSON response
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const mealPlan: AIMealPlan = response.data?.mealPlan;
      
      if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
        throw new Error('Invalid meal plan received from AI');
      }

      // Convert AI response to NutritionDay format
      const meals: Meal[] = mealPlan.meals.map((aiMeal) => {
        const foods: MealFood[] = aiMeal.foods.map((aiFood) => {
          // Create a Food object from the AI response
          // Use calories_per_100g and protein_g etc. to match the database schema
          // We set 100g as serving size and use the AI values directly
          const food: Food = {
            id: crypto.randomUUID(),
            name: aiFood.name,
            category_id: '', // Will be empty for AI-generated foods
            calories_per_100g: aiFood.calories,
            protein_g: aiFood.protein,
            carbs_g: aiFood.carbs,
            fat_g: aiFood.fat,
            fiber_g: 0,
            serving_size_g: 100, // Treat AI values as per-serving
            serving_description: aiFood.serving,
            is_custom: true,
            coach_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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

      // Create a single day with all the meals
      const generatedDay: NutritionDay = {
        id: crypto.randomUUID(),
        name: t('nutritionBuilder.day') + ' 1',
        meals,
      };

      onMealPlanGenerated([generatedDay]);
      toast.success(t('nutritionBuilder.aiMealPlanGenerated'));
      onOpenChange(false);
      setPreferences('');
    } catch (error) {
      console.error('AI meal plan generation error:', error);
      
      // Handle specific error cases
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