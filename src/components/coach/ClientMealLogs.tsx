import { useState } from "react";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Utensils, ChevronLeft, ChevronRight, Shield, AlertCircle } from "lucide-react";
import { useFoodDiaryRange, calculateDailyMacros, groupEntriesByMeal } from "@/hooks/useFoodDiary";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientMealLogsProps {
  clientId: string;
  clientName?: string;
  coachId?: string;
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  lunch: "bg-green-500/20 text-green-700 dark:text-green-400",
  dinner: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  snack: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
};

export const ClientMealLogs = ({ clientId, clientName, coachId }: ClientMealLogsProps) => {
  const [dateOffset, setDateOffset] = useState(0);
  const endDate = subDays(new Date(), dateOffset);
  const startDate = subDays(endDate, 6);

  const { data: entries, isLoading, error } = useFoodDiaryRange(clientId, startDate, endDate, coachId);

  // Check if access is denied (RLS blocking)
  const isAccessDenied = error?.message?.includes("permission") || 
    error?.message?.includes("policy") ||
    (entries?.length === 0 && !isLoading);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || isAccessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Meal Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {clientName || "This client"} has restricted access to their meal logs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const dailyMacros = calculateDailyMacros(entries || []);
  const groupedByMeal = groupEntriesByMeal(entries || []);

  // Group entries by date
  const entriesByDate: Record<string, typeof entries> = {};
  (entries || []).forEach((entry) => {
    const dateKey = format(new Date(entry.logged_at), "yyyy-MM-dd");
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = [];
    }
    entriesByDate[dateKey]!.push(entry);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Meal Logs
            </CardTitle>
            <CardDescription>
              {format(startDate, "d MMM")} - {format(endDate, "d MMM yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDateOffset(dateOffset + 7)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
              disabled={dateOffset === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekly Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-secondary/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{dailyMacros.calories}</p>
            <p className="text-xs text-muted-foreground">Total Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{dailyMacros.protein_g}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{dailyMacros.carbs_g}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{dailyMacros.fat_g}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>

        {/* Daily Entries */}
        {Object.keys(entriesByDate).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No meal logs for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(entriesByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayEntries]) => {
                const dayMacros = calculateDailyMacros(dayEntries || []);
                const dayGrouped = groupEntriesByMeal(dayEntries || []);
                
                return (
                  <div key={date} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{format(new Date(date), "EEEE, d MMM")}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{dayMacros.calories} kcal</span>
                        <span className="text-blue-600">{dayMacros.protein_g}g P</span>
                        <span className="text-amber-600">{dayMacros.carbs_g}g C</span>
                        <span className="text-green-600">{dayMacros.fat_g}g F</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(dayGrouped).map(([mealType, meals]) => (
                        <div key={mealType} className="flex items-start gap-3">
                          <Badge className={MEAL_TYPE_COLORS[mealType] || "bg-gray-500/20"}>
                            {mealType}
                          </Badge>
                          <div className="flex-1 space-y-1">
                            {meals.map((meal) => (
                              <div key={meal.id} className="flex items-center justify-between text-sm">
                                <span>{meal.food_name}</span>
                                <span className="text-muted-foreground">
                                  {meal.serving_size_g}g × {meal.servings} • {meal.calories} kcal
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
