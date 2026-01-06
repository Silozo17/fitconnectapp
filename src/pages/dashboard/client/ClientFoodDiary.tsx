import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { format, addDays, subDays } from "date-fns";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFoodDiary, useAddFoodDiaryEntry, useDeleteFoodDiaryEntry, useUpdateFoodDiaryEntry, calculateDailyMacros, groupEntriesByMeal, FoodDiaryInsert, FoodDiaryEntry } from "@/hooks/useFoodDiary";
import { useNutritionTargets } from "@/hooks/useNutritionTargets";
import { Button } from "@/components/ui/button";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { ChevronLeft, ChevronRight, Plus, Utensils, Trash2, ScanBarcode, Search, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarcodeScannerModal } from "@/components/nutrition/BarcodeScannerModal";
import { FoodSearchModal } from "@/components/nutrition/FoodSearchModal";
import { EditFoodEntryModal } from "@/components/nutrition/EditFoodEntryModal";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSectionHeader, ContentSection, SectionHeader } from "@/components/shared";

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
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<FoodDiaryEntry | null>(null);

  // Get client profile for ID
  const { data: clientProfile } = useQuery({
    queryKey: ['client-profile-for-diary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Get nutrition targets (coach > calculated > fallback)
  const { data: nutritionTargets, isLoading: targetsLoading } = useNutritionTargets(clientProfile?.id);

  const { data: entries = [], isLoading } = useFoodDiary(clientProfile?.id, selectedDate);
  const addEntry = useAddFoodDiaryEntry();
  const deleteEntry = useDeleteFoodDiaryEntry();
  const updateEntry = useUpdateFoodDiaryEntry();

  // Memoize expensive calculations
  const dailyMacros = useMemo(() => calculateDailyMacros(entries), [entries]);
  const groupedEntries = useMemo(() => groupEntriesByMeal(entries), [entries]);

  const handleFoodFound = (food: any, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', quantity?: number) => {
    if (!clientProfile?.id) return;

    const servingSize = quantity || food.serving_size_g || 100;
    const multiplier = servingSize / 100;

    const entry: FoodDiaryInsert = {
      client_id: clientProfile.id,
      meal_type: mealType,
      food_name: food.name,
      external_id: food.external_id || food.fatsecret_id || null,
      serving_size_g: servingSize,
      servings: 1,
      calories: Math.round((food.calories_per_100g || 0) * multiplier),
      protein_g: Math.round((food.protein_g || 0) * multiplier * 10) / 10,
      carbs_g: Math.round((food.carbs_g || 0) * multiplier * 10) / 10,
      fat_g: Math.round((food.fat_g || 0) * multiplier * 10) / 10,
      fiber_g: food.fiber_g ? Math.round((food.fiber_g || 0) * multiplier * 10) / 10 : null,
      logged_at: selectedDate.toISOString(),
    };

    addEntry.mutate(entry);
    setScannedFood(null);
  };

  const handleEditSave = (updates: { serving_size_g: number; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => {
    if (!editingEntry) return;
    updateEntry.mutate({
      id: editingEntry.id,
      ...updates,
    });
    setEditingEntry(null);
  };

  const handleEditDelete = () => {
    if (!editingEntry) return;
    deleteEntry.mutate(editingEntry.id);
    setEditingEntry(null);
  };

  const targets = nutritionTargets || { calories: 2000, protein: 150, carbs: 200, fat: 65, source: "fallback" as const };
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getTargetSourceLabel = () => {
    if (!nutritionTargets) return null;
    switch (nutritionTargets.source) {
      case "coach": return "Set by your coach";
      case "calculated": return "Based on your profile";
      case "fallback": return nutritionTargets.warning || "Default targets";
    }
  };

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

        <div className="space-y-11">
          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold font-display text-foreground">
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
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Daily Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SectionHeader title="Daily Summary" size="sm" />
              <TooltipProvider>
                <InfoTooltip 
                  content={getTargetSourceLabel() || "Your daily nutrition targets"} 
                />
              </TooltipProvider>
            </div>
            
            {/* Calories Card */}
            <ContentSection colorTheme="orange" className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">Calories</span>
                  <TooltipProvider>
                    <InfoTooltip content="Your daily calorie target based on your goals and activity level" />
                  </TooltipProvider>
                </div>
                <span className="font-medium text-foreground">
                  {Math.round(dailyMacros.calories)} / {targets.calories} kcal
                </span>
              </div>
              <Progress 
                value={Math.min((dailyMacros.calories / targets.calories) * 100, 100)} 
                className="h-2"
              />
            </ContentSection>

            {/* Macro Cards */}
            <div className="grid grid-cols-3 gap-3">
              <TooltipProvider>
                <ContentSection colorTheme="blue" className="p-4 text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <InfoTooltip content="Protein supports muscle growth and repair" />
                  </div>
                  <p className="text-xl font-bold text-blue-400">{Math.round(dailyMacros.protein_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.protein}g</p>
                </ContentSection>
                <ContentSection colorTheme="yellow" className="p-4 text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <InfoTooltip content="Carbohydrates provide energy for workouts" />
                  </div>
                  <p className="text-xl font-bold text-amber-400">{Math.round(dailyMacros.carbs_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.carbs}g</p>
                </ContentSection>
                <ContentSection colorTheme="red" className="p-4 text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <InfoTooltip content="Healthy fats support hormone function" />
                  </div>
                  <p className="text-xl font-bold text-rose-400">{Math.round(dailyMacros.fat_g)}g</p>
                  <p className="text-xs text-muted-foreground">/ {targets.fat}g</p>
                </ContentSection>
              </TooltipProvider>
            </div>
          </div>

          {/* Quick Add Buttons - Inline */}
          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full shadow-lg h-12 w-12"
              onClick={() => {
                setActiveMealType('snack');
                setScannedFood(null);
                setShowFoodSearch(true);
              }}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              className="rounded-full shadow-lg h-12 w-12"
              onClick={() => setShowBarcodeScanner(true)}
            >
              <ScanBarcode className="w-5 h-5" />
            </Button>
          </div>

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
                  <ContentSection key={meal.id} colorTheme="primary" className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meal.icon}</span>
                        <div>
                          <h3 className="text-base font-bold text-foreground font-display">{meal.label}</h3>
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
                          className="rounded-xl"
                          onClick={() => {
                            setActiveMealType(meal.id);
                            setScannedFood(null);
                            setShowFoodSearch(true);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {mealEntries.length > 0 ? (
                      <div className="space-y-2">
                        {mealEntries.map((entry) => (
                          <div
                            key={entry.id}
                            onClick={() => setEditingEntry(entry)}
                            className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group cursor-pointer hover:bg-secondary/70 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-foreground">{entry.food_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.servings && entry.servings > 1 ? `${entry.servings}x ` : ''}
                                {entry.serving_size_g}g • {Math.round((entry.calories || 0) * (entry.servings || 1))} kcal
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs text-right hidden sm:block">
                                <span className="text-blue-400">{Math.round((entry.protein_g || 0) * (entry.servings || 1))}p</span>
                                {" • "}
                                <span className="text-amber-400">{Math.round((entry.carbs_g || 0) * (entry.servings || 1))}c</span>
                                {" • "}
                                <span className="text-rose-400">{Math.round((entry.fat_g || 0) * (entry.servings || 1))}f</span>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEntry.mutate(entry.id);
                                }}
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
                  </ContentSection>
                );
              })}
            </div>
          )}

        </div>

        {/* Modals */}
        <BarcodeScannerModal
          open={showBarcodeScanner}
          onOpenChange={setShowBarcodeScanner}
          onFoodFound={(food) => {
            setScannedFood(food);
            setShowBarcodeScanner(false);
            setActiveMealType('snack');
            setShowFoodSearch(true);
          }}
        />

        <FoodSearchModal
          open={showFoodSearch}
          onOpenChange={(open) => {
            setShowFoodSearch(open);
            if (!open) setScannedFood(null);
          }}
          mealType={activeMealType}
          onFoodSelected={(food, quantity) => handleFoodFound(food, activeMealType, quantity)}
          initialFood={scannedFood}
        />

        {editingEntry && (
          <EditFoodEntryModal
            open={!!editingEntry}
            onOpenChange={(open) => !open && setEditingEntry(null)}
            entry={editingEntry}
            onSave={handleEditSave}
            onDelete={handleEditDelete}
          />
        )}
      </ClientDashboardLayout>
    </>
  );
};

export default ClientFoodDiary;
