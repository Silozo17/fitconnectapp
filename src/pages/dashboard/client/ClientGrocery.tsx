import { useState } from "react";
import { Helmet } from "react-helmet-async";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import GroceryListCard from "@/components/integrations/GroceryListCard";
import { useGroceryList, GroceryItem } from "@/hooks/useGroceryList";
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
import { ShoppingCart, Plus, Sparkles, Loader2 } from "lucide-react";

const ClientGrocery = () => {
  const { lists, isLoading, createList, updateItems, completeList, deleteList, generateFromMealPlan } = useGroceryList();
  const [newListName, setNewListName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createList.mutate({ name: newListName });
    setNewListName("");
    setCreateDialogOpen(false);
  };

  const handleGenerateList = () => {
    // Generate a sample list (in production, would select from actual meal plans)
    generateFromMealPlan.mutate({ mealPlanId: "", days: 7 });
  };

  const activeLists = lists?.filter((l) => !l.is_completed) || [];
  const completedLists = lists?.filter((l) => l.is_completed) || [];

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
              <Button
                variant="outline"
                onClick={handleGenerateList}
                disabled={generateFromMealPlan.isPending}
              >
                {generateFromMealPlan.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate from Meal Plan
              </Button>
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
              <Card className="bg-card/50 border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg mb-2">No active lists</CardTitle>
                  <CardDescription className="text-center mb-4">
                    Create a new shopping list or generate one from your meal plan
                  </CardDescription>
                  <Button onClick={() => setCreateDialogOpen(true)}>
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
