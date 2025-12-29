import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { format, addDays, subDays } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFoodDiary, useAddFoodDiaryEntry, useDeleteFoodDiaryEntry, calculateDailyMacros, groupEntriesByMeal, FoodDiaryInsert } from "@/hooks/useFoodDiary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { ChevronLeft, ChevronRight, Plus, Utensils, Trash2, ScanBarcode, Search, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarcodeScannerModal } from "@/components/nutrition/BarcodeScannerModal";
import { FoodSearchModal } from "@/components/nutrition/FoodSearchModal";
import { cn } from "@/lib/utils";

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', time: '6am - 10am' },
  { id: 'lunch', label: 'Lunch', icon: '☀️', time: '11am - 2pm' },
  { id: 'dinner', label: 'Dinner', icon: '🌙', time: '5pm - 9pm' },
  { id: 'snack', label: 'Snacks', icon: '🍎', time: 'Anytime' },
] as const;

const ClientFoodDiary = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  // Get client profile for ID and targets
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile-for-diary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('id, weight_kg, height_cm, activity_level, gender, age')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Default targets (could be enhanced to fetch from assigned plans)
  const nutritionTargets = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const { data: entries = [], isLoading } = useFoodDiary(clientProfile?.id, selectedDate);
  const addEntry = useAddFoodDiaryEntry();
  const deleteEntry = useDeleteFoodDiaryEntry();

  const dailyMacros = calculateDailyMacros(entries);
  const groupedEntries = groupEntriesByMeal(entries);

  const handleFoodFound = (food: any, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!clientProfile?.id) return;

    const entry: FoodDiaryInsert = {
      client_id: clientProfile.id,
      meal_type: mealType,
      food_name: food.name,
      fatsecret_id: food.fatsecret_id || null,
      serving_size_g: food.serving_size_g || 100,
      servings: 1,
      calories: food.calories_per_100g ? Math.round((food.calories_per_100g * (food.serving_size_g || 100)) / 100) : food.calories,
      protein_g: food.protein_g ? Math.round((food.protein_g * (food.serving_size_g || 100)) / 100 * 10) / 10 : null,
      carbs_g: food.carbs_g ? Math.round((food.carbs_g * (food.serving_size_g || 100)) / 100 * 10) / 10 : null,
      fat_g: food.fat_g ? Math.round((food.fat_g * (food.serving_size_g || 100)) / 100 * 10) / 10 : null,
      fiber_g: food.fiber_g ? Math.round((food.fiber_g * (food.serving_size_g || 100)) / 100 * 10) / 10 : null,
      logged_at: selectedDate.toISOString(),
    };

    addEntry.mutate(entry);
  };

  const targets = nutritionTargets || { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <>
      <Helmet>
        <title>Food Diary | Client Dashboard</title>
        <meta name="description" content="Track your daily food intake and nutrition" />
      </Helmet>

      <ClientDashboardLayout
        title="Food Diary"
        description="Log what you eat and track your nutrition"
      >
        <PageHelpBanner
          pageKey="client_food_diary"
          title="Food Diary"
          description="Log your meals and track calories & macros against your targets"
        />

        <div className="space-y-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {isToday ? "Today" : format(selectedDate, "EEEE")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "d MMMM yyyy")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              disabled={isToday}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Daily Summary */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Calories */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Calories</span>
                  <span className="font-medium">
                    {Math.round(dailyMacros.calories)} / {targets.calories} kcal
                  </span>
                </div>
                <Progress 
                  value={Math.min((dailyMacros.calories / targets.calories) * 100, 100)} 
                  className="h-2"
                />
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-lg font-bold text-blue-500">{Math.round(dailyMacros.protein_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.protein}g</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/10">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-lg font-bold text-amber-500">{Math.round(dailyMacros.carbs_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.carbs}g</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-rose-500/10">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-lg font-bold text-rose-500">{Math.round(dailyMacros.fat_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.fat}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Sections */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {MEAL_TYPES.map((meal) => {
                const mealEntries = groupedEntries[meal.id] || [];
                const mealCalories = mealEntries.reduce((sum, e) => sum + (e.calories || 0) * (e.servings || 1), 0);

                return (
                  <Card key={meal.id} className="rounded-2xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meal.icon}</span>
                          <div>
                            <CardTitle className="text-base">{meal.label}</CardTitle>
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {Math.round(mealCalories)} kcal
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveMealType(meal.id);
                              setShowFoodSearch(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mealEntries.length > 0 ? (
                        <div className="space-y-2">
                          {mealEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-muted/50 group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{entry.food_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.servings && entry.servings > 1 ? `${entry.servings}x ` : ''}
                                  {entry.serving_size_g}g • {Math.round((entry.calories || 0) * (entry.servings || 1))} kcal
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-right hidden sm:block">
                                  <span className="text-blue-500">{Math.round((entry.protein_g || 0) * (entry.servings || 1))}p</span>
                                  {" • "}
                                  <span className="text-amber-500">{Math.round((entry.carbs_g || 0) * (entry.servings || 1))}c</span>
                                  {" • "}
                                  <span className="text-rose-500">{Math.round((entry.fat_g || 0) * (entry.servings || 1))}f</span>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                  onClick={() => deleteEntry.mutate(entry.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                          <Utensils className="w-4 h-4 mr-2" />
                          <span className="text-sm">No foods logged</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Add Buttons */}
          <div className="fixed bottom-20 right-4 flex flex-col gap-2 sm:bottom-6 sm:right-6">
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 w-14"
              onClick={() => setShowBarcodeScanner(true)}
            >
              <ScanBarcode className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full shadow-lg h-14 w-14"
              onClick={() => {
                setActiveMealType('snack');
                setShowFoodSearch(true);
              }}
            >
              <Search className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Modals */}
        <BarcodeScannerModal
          open={showBarcodeScanner}
          onOpenChange={setShowBarcodeScanner}
          onFoodFound={(food) => handleFoodFound(food, activeMealType)}
        />

        <FoodSearchModal
          open={showFoodSearch}
          onOpenChange={setShowFoodSearch}
          mealType={activeMealType}
          onFoodSelected={(food) => handleFoodFound(food, activeMealType)}
        />
      </ClientDashboardLayout>
    </>
  );
};

export default ClientFoodDiary;
