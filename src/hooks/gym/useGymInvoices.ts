import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";

export interface GymInvoice {
  id: string;
  gym_id: string;
  member_id: string;
  invoice_number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "refunded";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  member?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  items?: GymInvoiceItem[];
}

export interface GymInvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: string;
}

export function useGymInvoices(options?: { status?: string; memberId?: string }) {
  const { gym } = useGym();

  return useQuery({
    queryKey: ["gym-invoices", gym?.id, options?.status, options?.memberId],
    queryFn: async () => {
      if (!gym?.id) return [];

      let query = (supabase as any)
        .from("gym_invoices")
        .select(`
          *,
          member:gym_members(first_name, last_name, email)
        `)
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }
      if (options?.memberId) {
        query = query.eq("member_id", options.memberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GymInvoice[];
    },
    enabled: !!gym?.id,
  });
}

export function useGymInvoice(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["gym-invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;

      const { data, error } = await (supabase as any)
        .from("gym_invoices")
        .select(`
          *,
          member:gym_members(first_name, last_name, email, phone),
          items:gym_invoice_items(*)
        `)
        .eq("id", invoiceId)
        .single();

      if (error) throw error;
      return data as GymInvoice;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { gym } = useGym();

  return useMutation({
    mutationFn: async (data: {
      member_id: string;
      items: { description: string; quantity: number; unit_price: number }[];
      due_date?: string;
      notes?: string;
      tax_rate?: number;
    }) => {
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const tax_amount = data.tax_rate ? subtotal * (data.tax_rate / 100) : 0;
      const total_amount = subtotal + tax_amount;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      const { data: invoice, error } = await (supabase as any)
        .from("gym_invoices")
        .insert({
          gym_id: gym?.id,
          member_id: data.member_id,
          invoice_number: invoiceNumber,
          subtotal,
          tax_amount,
          total_amount,
          due_date: data.due_date,
          notes: data.notes,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert invoice items
      const items = data.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await (supabase as any)
        .from("gym_invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create invoice");
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
      const updates: any = { status };
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from("gym_invoices")
        .update(updates)
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["gym-invoice"] });
      toast.success("Invoice status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update invoice");
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      // Update status to sent
      const { error } = await (supabase as any)
        .from("gym_invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId);

      if (error) throw error;
      // In production, this would trigger an email edge function
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-invoices"] });
      toast.success("Invoice sent to member");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send invoice");
    },
  });
}
