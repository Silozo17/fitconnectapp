import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  coach_id: string;
  client_id: string | null;
  invoice_number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Expense {
  id: string;
  coach_id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  totalExpenses: number;
  netProfit: number;
}

export const EXPENSE_CATEGORIES = [
  { value: "equipment", label: "Equipment" },
  { value: "marketing", label: "Marketing" },
  { value: "gym_rental", label: "Gym Rental" },
  { value: "training_materials", label: "Training Materials" },
  { value: "software", label: "Software & Tools" },
  { value: "travel", label: "Travel" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export function useCoachInvoices(coachId: string | undefined) {
  return useQuery({
    queryKey: ["coach-invoices", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("coach_invoices")
        .select(`
          *,
          client:client_profiles!coach_invoices_client_id_fkey(id, first_name, last_name),
          line_items:invoice_line_items(*)
        `)
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!coachId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      clientId,
      lineItems,
      dueDate,
      notes,
      taxRate = 0,
    }: {
      coachId: string;
      clientId: string | null;
      lineItems: { description: string; quantity: number; unitPrice: number }[];
      dueDate: string | null;
      notes: string | null;
      taxRate?: number;
    }) => {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate totals
      const subtotal = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = Math.round(subtotal * (taxRate / 100));
      const total = subtotal + taxAmount;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("coach_invoices")
        .insert({
          coach_id: coachId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          due_date: dueDate,
          notes,
          tax_rate: taxRate,
          subtotal,
          tax_amount: taxAmount,
          total,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items
      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from("invoice_line_items")
          .insert(
            lineItems.map((item) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total: item.quantity * item.unitPrice,
            }))
          );

        if (lineItemsError) throw lineItemsError;
      }

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      status,
    }: {
      invoiceId: string;
      status: Invoice["status"];
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "sent") {
        updates.sent_at = new Date().toISOString();
      } else if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("coach_invoices")
        .update(updates)
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invoices"] });
      toast.success("Invoice status updated");
    },
    onError: (error) => {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice status");
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from("coach_invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invoices"] });
      toast.success("Invoice deleted");
    },
    onError: (error) => {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    },
  });
}

export function useCoachExpenses(coachId: string | undefined) {
  return useQuery({
    queryKey: ["coach-expenses", coachId],
    queryFn: async () => {
      if (!coachId) return [];

      const { data, error } = await supabase
        .from("coach_expenses")
        .select("*")
        .eq("coach_id", coachId)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!coachId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      category,
      description,
      amount,
      expenseDate,
      receiptUrl,
      notes,
    }: {
      coachId: string;
      category: string;
      description: string;
      amount: number;
      expenseDate: string;
      receiptUrl?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("coach_expenses")
        .insert({
          coach_id: coachId,
          category,
          description,
          amount,
          expense_date: expenseDate,
          receipt_url: receiptUrl,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-expenses"] });
      toast.success("Expense added successfully");
    },
    onError: (error) => {
      console.error("Error creating expense:", error);
      toast.error("Failed to add expense");
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("coach_expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-expenses"] });
      toast.success("Expense deleted");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    },
  });
}

export function useFinancialSummary(coachId: string | undefined) {
  const { data: invoices } = useCoachInvoices(coachId);
  const { data: expenses } = useCoachExpenses(coachId);

  const summary: FinancialSummary = {
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  if (invoices) {
    invoices.forEach((invoice) => {
      summary.totalInvoiced += invoice.total;
      if (invoice.status === "paid") {
        summary.totalPaid += invoice.total;
      } else if (invoice.status === "sent") {
        summary.totalOutstanding += invoice.total;
      } else if (invoice.status === "overdue") {
        summary.totalOverdue += invoice.total;
        summary.totalOutstanding += invoice.total;
      }
    });
  }

  if (expenses) {
    summary.totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  summary.netProfit = summary.totalPaid - summary.totalExpenses;

  return summary;
}
