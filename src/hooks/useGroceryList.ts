import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  client_id: string;
  coach_id: string | null;
  name: string;
  items: GroceryItem[];
  source_type: string;
  source_id: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const parseItems = (items: Json | null): GroceryItem[] => {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        id: String(obj.id || crypto.randomUUID()),
        name: String(obj.name || ""),
        quantity: String(obj.quantity || "1"),
        unit: String(obj.unit || ""),
        category: String(obj.category || "Other"),
        checked: Boolean(obj.checked),
      };
    });
  }
  return [];
};

export const useGroceryList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch client's grocery lists
  const { data: lists, isLoading } = useQuery({
    queryKey: ["grocery-lists", user?.id],
    queryFn: async () => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!clientProfile) return [];

      const { data, error } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("client_id", clientProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(list => ({
        ...list,
        items: parseItems(list.items),
      })) as GroceryList[];
    },
    enabled: !!user,
  });

  // Create new grocery list
  const createList = useMutation({
    mutationFn: async ({ 
      name, 
      items = [],
      sourceType = "manual",
      sourceId = null 
    }: { 
      name: string; 
      items?: GroceryItem[];
      sourceType?: string;
      sourceId?: string | null;
    }) => {
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      if (!clientProfile) throw new Error("Client profile not found");

      const { data, error } = await supabase
        .from("grocery_lists")
        .insert({
          client_id: clientProfile.id,
          name,
          items: items as unknown as Json,
          source_type: sourceType,
          source_id: sourceId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
      toast.success("Shopping list created");
    },
    onError: (error) => {
      toast.error("Failed to create list: " + error.message);
    },
  });

  // Update grocery list items
  const updateItems = useMutation({
    mutationFn: async ({ listId, items }: { listId: string; items: GroceryItem[] }) => {
      const { error } = await supabase
        .from("grocery_lists")
        .update({ items: items as unknown as Json })
        .eq("id", listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });

  // Mark list as complete
  const completeList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from("grocery_lists")
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq("id", listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
      toast.success("Shopping list completed!");
    },
  });

  // Delete grocery list
  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
      toast.success("Shopping list deleted");
    },
  });

  // Generate list from meal plan (calls edge function)
  const generateFromMealPlan = useMutation({
    mutationFn: async ({ 
      mealPlanId, 
      days = 7 
    }: { 
      mealPlanId: string; 
      days?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("grocery-generate-list", {
        body: { mealPlanId, days },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
      toast.success("Shopping list generated from meal plan!");
    },
    onError: (error) => {
      toast.error("Failed to generate list: " + error.message);
    },
  });

  return {
    lists,
    isLoading,
    createList,
    updateItems,
    completeList,
    deleteList,
    generateFromMealPlan,
  };
};
