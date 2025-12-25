import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flame, Beef, Wheat, Droplets, Clock, UtensilsCrossed, Info, Apple } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlanDay } from "@/hooks/useTrainingPlans";

interface NutritionPlanViewProps {
  content: PlanDay[] | unknown;
}

// Food item structure from the nutrition builder
interface MealFood {
  id: string;
  food: {
    id: string;
    name: string;
    calories_per_100g?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    serving_size_g?: number;
    serving_unit?: string;
  };
  servings: number;
  notes?: string;
}

interface NutritionMeal {
  id: string;
  name: string;
  time?: string;
  foods: MealFood[];
  notes?: string;
}

interface NutritionDay {
  id: string;
  name: string;
  meals: NutritionMeal[];
}

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionContent {
  days?: NutritionDay[];
  targets?: NutritionTargets;
}

const NutritionPlanView = ({ content }: NutritionPlanViewProps) => {
  // Parse the content structure with comprehensive handling
  const parseContent = (): { days: NutritionDay[]; targets: NutritionTargets | null } => {
    // Handle null/undefined
    if (!content) {
      console.log('NutritionPlanView: No content provided');
      return { days: [], targets: null };
    }
    
    // Handle string content (JSON that needs parsing)
    let parsedContent = content;
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content);
        console.log('NutritionPlanView: Parsed JSON string content');
      } catch (e) {
        console.error('NutritionPlanView: Failed to parse string content', e);
        return { days: [], targets: null };
      }
    }
    
    // If it's an object with days and/or targets
    if (typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
      const contentObj = parsedContent as NutritionContent;
      console.log('NutritionPlanView: Content structure:', {
        hasDays: !!contentObj.days,
        daysCount: contentObj.days?.length || 0,
        hasTargets: !!contentObj.targets,
        targets: contentObj.targets
      });
      return {
        days: Array.isArray(contentObj.days) ? contentObj.days : [],
        targets: contentObj.targets || null
      };
    }
    
    // If it's already an array of days
    if (Array.isArray(parsedContent)) {
      console.log('NutritionPlanView: Content is array with', parsedContent.length, 'days');
      return { days: parsedContent as unknown as NutritionDay[], targets: null };
    }
    
    console.warn('NutritionPlanView: Unknown content format', typeof parsedContent);
    return { days: [], targets: null };
  };

  const { days, targets } = parseContent();

  // Calculate food macros based on servings
  const calculateFoodMacros = (food: MealFood) => {
    const servingMultiplier = food.servings || 1;
    const servingSizeG = food.food.serving_size_g || 100;
    const multiplier = (servingSizeG / 100) * servingMultiplier;
    
    return {
      calories: Math.round((food.food.calories_per_100g || 0) * multiplier),
      protein: Math.round((food.food.protein_g || 0) * multiplier),
      carbs: Math.round((food.food.carbs_g || 0) * multiplier),
      fat: Math.round((food.food.fat_g || 0) * multiplier),
    };
  };

  // Calculate meal totals
  const calculateMealTotals = (foods: MealFood[]) => {
    return foods.reduce(
      (acc, food) => {
        const macros = calculateFoodMacros(food);
        return {
          calories: acc.calories + macros.calories,
          protein: acc.protein + macros.protein,
          carbs: acc.carbs + macros.carbs,
          fat: acc.fat + macros.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (days.length === 0 && !targets) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No nutrition content available for this plan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Macro Targets */}
      {targets && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Daily Macro Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroCard
                icon={<Flame className="h-5 w-5" />}
                label="Calories"
                value={targets.calories}
                unit="kcal"
                color="text-orange-500"
                bgColor="bg-orange-500/10"
              />
              <MacroCard
                icon={<Beef className="h-5 w-5" />}
                label="Protein"
                value={targets.protein}
                unit="g"
                color="text-red-500"
                bgColor="bg-red-500/10"
              />
              <MacroCard
                icon={<Wheat className="h-5 w-5" />}
                label="Carbs"
                value={targets.carbs}
                unit="g"
                color="text-amber-500"
                bgColor="bg-amber-500/10"
              />
              <MacroCard
                icon={<Droplets className="h-5 w-5" />}
                label="Fat"
                value={targets.fat}
                unit="g"
                color="text-blue-500"
                bgColor="bg-blue-500/10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Days and Meals */}
      {days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={days.map(d => d.id)} className="space-y-3">
              {days.map((day) => (
                <AccordionItem
                  key={day.id}
                  value={day.id}
                  className="border rounded-lg px-4 bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-semibold text-base">{day.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {day.meals && day.meals.length > 0 ? (
                        day.meals.map((meal) => (
                          <MealCard
                            key={meal.id}
                            meal={meal}
                            calculateFoodMacros={calculateFoodMacros}
                            calculateMealTotals={calculateMealTotals}
                          />
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No meals added for this day.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Macro Card Component for displaying targets
interface MacroCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  bgColor: string;
}

const MacroCard = ({ icon, label, value, unit, color, bgColor }: MacroCardProps) => (
  <div className={`${bgColor} rounded-xl p-4 text-center`}>
    <div className={`${color} flex justify-center mb-2`}>{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-wide">
      {unit} {label}
    </div>
  </div>
);

// Meal Card Component
interface MealCardProps {
  meal: NutritionMeal;
  calculateFoodMacros: (food: MealFood) => { calories: number; protein: number; carbs: number; fat: number };
  calculateMealTotals: (foods: MealFood[]) => { calories: number; protein: number; carbs: number; fat: number };
}

const MealCard = ({ meal, calculateFoodMacros, calculateMealTotals }: MealCardProps) => {
  const mealTotals = calculateMealTotals(meal.foods || []);
  const hasFoods = meal.foods && meal.foods.length > 0;

  return (
    <div className="bg-background border rounded-lg overflow-hidden">
      {/* Meal Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-base">{meal.name}</h4>
          {meal.time && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {meal.time}
            </Badge>
          )}
        </div>
        {hasFoods && (
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="text-orange-500 font-medium">{mealTotals.calories} kcal</span>
            <span>P: {mealTotals.protein}g</span>
            <span>C: {mealTotals.carbs}g</span>
            <span>F: {mealTotals.fat}g</span>
          </div>
        )}
      </div>

      {/* Food Items */}
      <div className="p-4">
        {hasFoods ? (
          <div className="space-y-3">
            {meal.foods.map((mealFood) => {
              const macros = calculateFoodMacros(mealFood);
              const servingText = mealFood.servings === 1 
                ? `1 serving` 
                : `${mealFood.servings} servings`;
              const servingSize = mealFood.food.serving_size_g 
                ? ` (${mealFood.food.serving_size_g * mealFood.servings}${mealFood.food.serving_unit || 'g'})`
                : '';

              return (
                <div
                  key={mealFood.id}
                  className="flex items-start justify-between py-2 border-b border-dashed last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{mealFood.food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {servingText}{servingSize}
                    </p>
                    {mealFood.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic flex items-center gap-1">
                        <Info className="h-3 w-3" /> {mealFood.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <p className="font-medium text-orange-500">{macros.calories} kcal</p>
                    <p className="text-muted-foreground">
                      P: {macros.protein}g · C: {macros.carbs}g · F: {macros.fat}g
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No foods added to this meal yet.</p>
          </div>
        )}

        {/* Meal Notes */}
        {meal.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground italic flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              {meal.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPlanView;
