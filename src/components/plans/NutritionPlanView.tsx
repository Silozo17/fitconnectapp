import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Apple, Clock, Utensils, Flame, Target } from "lucide-react";
import { PlanDay } from "@/hooks/useTrainingPlans";

interface NutritionPlanViewProps {
  content: PlanDay[];
}

// Nutrition plans may have a different structure - adapting to show meals
interface MealItem {
  id?: string;
  name: string;
  time?: string;
  foods?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

interface NutritionDay {
  id?: string;
  name: string;
  meals?: MealItem[];
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  exercises?: never[]; // Keep compatibility with PlanDay type
}

const NutritionPlanView = ({ content }: NutritionPlanViewProps) => {
  // Cast to nutrition format - the content structure varies by plan type
  const nutritionContent = content as unknown as NutritionDay[];

  if (!nutritionContent || nutritionContent.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No nutrition content available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="h-5 w-5" />
          Meal Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {nutritionContent.map((day, index) => (
            <AccordionItem 
              key={day.id || index} 
              value={day.id || `day-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    Day {index + 1}
                  </Badge>
                  <span className="font-medium">{day.name}</span>
                  {day.meals && (
                    <Badge variant="secondary" className="ml-2">
                      {day.meals.length} meals
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Daily Macros Summary */}
                  {day.macros && (
                    <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
                      <MacroItem 
                        icon={<Flame className="h-4 w-4 text-orange-500" />}
                        label="Calories"
                        value={day.macros.calories}
                        unit="kcal"
                      />
                      <MacroItem 
                        icon={<Target className="h-4 w-4 text-red-500" />}
                        label="Protein"
                        value={day.macros.protein}
                        unit="g"
                      />
                      <MacroItem 
                        icon={<Target className="h-4 w-4 text-blue-500" />}
                        label="Carbs"
                        value={day.macros.carbs}
                        unit="g"
                      />
                      <MacroItem 
                        icon={<Target className="h-4 w-4 text-yellow-500" />}
                        label="Fat"
                        value={day.macros.fat}
                        unit="g"
                      />
                    </div>
                  )}

                  {/* Meals */}
                  {day.meals && day.meals.length > 0 ? (
                    <div className="space-y-3">
                      {day.meals.map((meal, mealIndex) => (
                        <MealCard key={meal.id || mealIndex} meal={meal} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">
                      No meals added for this day
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

const MacroItem = ({ 
  icon, 
  label, 
  value, 
  unit 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: number; 
  unit: string;
}) => {
  if (value === undefined) return null;
  
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm">
        <span className="font-medium">{value}</span>
        <span className="text-muted-foreground">{unit}</span>
        <span className="text-muted-foreground ml-1">{label}</span>
      </span>
    </div>
  );
};

const MealCard = ({ meal }: { meal: MealItem }) => {
  return (
    <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
      <div className="p-2 bg-background rounded-md">
        <Utensils className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{meal.name}</h4>
          {meal.time && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {meal.time}
            </span>
          )}
        </div>
        
        {/* Food items */}
        {meal.foods && meal.foods.length > 0 && (
          <ul className="mt-2 space-y-1">
            {meal.foods.map((food, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                {food}
              </li>
            ))}
          </ul>
        )}

        {/* Meal macros */}
        {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {meal.calories && <span>{meal.calories} kcal</span>}
            {meal.protein && <span>{meal.protein}g protein</span>}
            {meal.carbs && <span>{meal.carbs}g carbs</span>}
            {meal.fat && <span>{meal.fat}g fat</span>}
          </div>
        )}

        {meal.notes && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            {meal.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default NutritionPlanView;
