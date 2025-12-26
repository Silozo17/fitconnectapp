import { useState } from "react";
import { Helmet } from "react-helmet-async";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import GroceryListCard from "@/components/integrations/GroceryListCard";
import { useGroceryList, GroceryItem } from "@/hooks/useGroceryList";
import { useAssignedNutritionPlans } from "@/hooks/useAssignedNutritionPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShoppingCart, Plus, Sparkles, Loader2, AlertCircle, Utensils } from "lucide-react";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const ClientGrocery = () => {
  const { lists, isLoading, createList, updateItems, completeList, deleteList, generateFromMealPlan } = useGroceryList();
  const { data: nutritionPlans, isLoading: plansLoading } = useAssignedNutritionPlans();
  const [newListName, setNewListName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createList.mutate({ name: newListName });
    setNewListName("");
    setCreateDialogOpen(false);
  };

  const handleGenerateList = () => {
    if (!selectedPlanId) return;
    generateFromMealPlan.mutate({ mealPlanId: selectedPlanId, days: 7 });
    setGenerateDialogOpen(false);
    setSelectedPlanId("");
  };

  const activeLists = lists?.filter((l) => !l.is_completed) || [];
  const completedLists = lists?.filter((l) => l.is_completed) || [];

  const hasNutritionPlans = nutritionPlans && nutritionPlans.length > 0;

  return (
    <>
      <Helmet>
        <title>Shopping Lists | Client Dashboard</title>
        <meta name="description" content="Manage your grocery shopping lists" />
      </Helmet>

      <ClientDashboardLayout
        title="Shopping Lists"
        description="Manage your grocery and meal prep shopping"
      >
        <PageHelpBanner
          pageKey="client_grocery"
          title="Shopping Lists"
          description="Generate grocery lists from meal plans or create your own"
        />
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Shopping Lists</h1>
              <p className="text-muted-foreground">
                Create and manage your grocery lists
              </p>
            </div>
            <div className="flex gap-2">
              {/* Generate from Meal Plan Button */}
              {hasNutritionPlans ? (
                <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate from Meal Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Shopping List</DialogTitle>
                      <DialogDescription>
                        Select a meal plan to generate a shopping list with all the ingredients you need.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Meal Plan</label>
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a meal plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {nutritionPlans.map((plan) => (
                              <SelectItem key={plan.plan_id} value={plan.plan_id}>
                                <div className="flex flex-col">
                                  <span>{plan.plan_name}</span>
                                  {plan.coach_name && (
                                    <span className="text-xs text-muted-foreground">
                                      by {plan.coach_name}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleGenerateList} 
                        disabled={!selectedPlanId || generateFromMealPlan.isPending}
                      >
                        {generateFromMealPlan.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate List
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="outline" disabled className="opacity-50">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate from Meal Plan
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>No meal plan assigned. Ask your coach to assign a nutrition plan first.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* New List Button */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New List
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Shopping List</DialogTitle>
                    <DialogDescription>
                      Start a new shopping list for your groceries
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="List name (e.g., Weekly Shop)"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* No Meal Plan Info Card */}
          {!plansLoading && !hasNutritionPlans && (
            <Card className="border-amber-500/30 bg-amber-500/5 rounded-2xl">
              <CardContent className="flex items-start gap-4 py-5">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Utensils className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-200">No Meal Plan Assigned</h3>
                  <p className="text-sm text-muted-foreground">
                    To generate shopping lists automatically from your meals, ask your coach to assign a nutrition plan. 
                    You can still create manual shopping lists in the meantime.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Lists */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Lists</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : activeLists.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeLists.map((list) => (
                  <GroceryListCard
                    key={list.id}
                    listId={list.id}
                    name={list.name}
                    items={list.items}
                    isCompleted={list.is_completed}
                    onUpdateItems={(items: GroceryItem[]) =>
                      updateItems.mutate({ listId: list.id, items })
                    }
                    onComplete={() => completeList.mutate(list.id)}
                    onDelete={() => deleteList.mutate(list.id)}
                  />
                ))}
              </div>
            ) : (
              <Card variant="glass" className="rounded-3xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mb-2">No active lists</CardTitle>
                  <CardDescription className="text-center mb-4">
                    Create a new shopping list or generate one from your meal plan
                  </CardDescription>
                  <Button onClick={() => setCreateDialogOpen(true)} className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Completed Lists */}
          {completedLists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Completed Lists ({completedLists.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-70">
                {completedLists.slice(0, 4).map((list) => (
                  <GroceryListCard
                    key={list.id}
                    listId={list.id}
                    name={list.name}
                    items={list.items}
                    isCompleted={list.is_completed}
                    onUpdateItems={(items: GroceryItem[]) =>
                      updateItems.mutate({ listId: list.id, items })
                    }
                    onComplete={() => {}}
                    onDelete={() => deleteList.mutate(list.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ClientDashboardLayout>
    </>
  );
};

export default ClientGrocery;
