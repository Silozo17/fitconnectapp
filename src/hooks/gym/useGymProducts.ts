import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymProduct {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  track_inventory: boolean;
  created_at: string;
}

export interface ProductSaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
}

export interface GymProductSale {
  id: string;
  gym_id: string;
  member_id: string | null;
  staff_id: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: "cash" | "card" | "member_credit" | "other";
  payment_reference: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  items?: ProductSaleItem[];
}

export function useGymProducts(options?: { category?: string; activeOnly?: boolean }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-products", gym?.id, options],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_products")
        .select("*")
        .eq("gym_id", gym.id)
        .order("name");

      if (options?.category) {
        query = query.eq("category", options.category);
      }
      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymProduct[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (data: Omit<GymProduct, "id" | "gym_id" | "created_at">) => {
      const { error } = await (supabase as any)
        .from("gym_products")
        .insert({ ...data, gym_id: gym?.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-products"] });
      toast.success("Product created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<GymProduct> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("gym_products")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-products"] });
      toast.success("Product updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("gym_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-products"] });
      toast.success("Product deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

// Sales
export function useGymSales(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-sales", gym?.id, options],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_product_sales")
        .select(`
          *,
          member:gym_members(id, first_name, last_name),
          staff:gym_staff(id, display_name)
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      if (options?.startDate) {
        query = query.gte("created_at", options.startDate);
      }
      if (options?.endDate) {
        query = query.lte("created_at", options.endDate);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymProductSale[];
    },
    enabled: !!gym?.id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { gym, staffRecord } = useGym();

  return useMutation({
    mutationFn: async (data: {
      member_id?: string;
      items: ProductSaleItem[];
      payment_method: "cash" | "card" | "member_credit" | "other";
      discount_amount?: number;
      tax_amount?: number;
      notes?: string;
    }) => {
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100);
        return sum + itemTotal;
      }, 0);
      const total = subtotal - (data.discount_amount || 0) + (data.tax_amount || 0);

      // Create sale
      const { data: sale, error: saleError } = await (supabase as any)
        .from("gym_product_sales")
        .insert({
          gym_id: gym?.id,
          member_id: data.member_id || null,
          staff_id: staffRecord?.id || null,
          subtotal,
          discount_amount: data.discount_amount || 0,
          tax_amount: data.tax_amount || 0,
          total_amount: total,
          payment_method: data.payment_method,
          notes: data.notes,
          status: "completed",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = data.items.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        line_total: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
      }));

      const { error: itemsError } = await (supabase as any)
        .from("gym_product_sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory
      for (const item of data.items) {
        await (supabase as any)
          .from("gym_products")
          .update({ stock_quantity: (supabase as any).rpc("decrement_stock", { product_id: item.product_id, qty: item.quantity }) })
          .eq("id", item.product_id);
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-sales"] });
      queryClient.invalidateQueries({ queryKey: ["gym-products"] });
      toast.success("Sale completed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to complete sale");
    },
  });
}

export function useLowStockProducts() {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-low-stock", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await (supabase as any)
        .from("gym_products")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .eq("track_inventory", true)
        .filter("stock_quantity", "lte", (supabase as any).raw("low_stock_threshold"));

      if (error) throw error;
      return data as GymProduct[];
    },
    enabled: !!gym?.id,
  });
}
