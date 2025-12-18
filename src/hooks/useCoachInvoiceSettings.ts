import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceSettings {
  id: string;
  coach_id: string;
  business_name: string | null;
  business_address: string | null;
  business_email: string | null;
  business_phone: string | null;
  vat_number: string | null;
  company_registration: string | null;
  logo_url: string | null;
  template_id: string;
  accent_color: string;
  default_payment_terms: string | null;
  default_notes: string | null;
  bank_details: string | null;
  created_at: string;
  updated_at: string;
}

export const INVOICE_TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean design with lime accents",
    preview: "bg-gradient-to-br from-primary/20 to-primary/5",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional style",
    preview: "bg-gradient-to-br from-gray-100 to-gray-50",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean with lots of whitespace",
    preview: "bg-white",
  },
  {
    id: "bold",
    name: "Bold",
    description: "High contrast, eye-catching",
    preview: "bg-gradient-to-br from-gray-900 to-gray-800",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate, structured look",
    preview: "bg-gradient-to-br from-blue-50 to-slate-50",
  },
] as const;

export type TemplateId = typeof INVOICE_TEMPLATES[number]["id"];

export function useCoachInvoiceSettings(coachId: string | undefined) {
  return useQuery({
    queryKey: ["coach-invoice-settings", coachId],
    queryFn: async () => {
      if (!coachId) return null;

      const { data, error } = await supabase
        .from("coach_invoice_settings")
        .select("*")
        .eq("coach_id", coachId)
        .maybeSingle();

      if (error) throw error;
      return data as InvoiceSettings | null;
    },
    enabled: !!coachId,
  });
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      settings,
    }: {
      coachId: string;
      settings: Partial<Omit<InvoiceSettings, "id" | "coach_id" | "created_at" | "updated_at">>;
    }) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from("coach_invoice_settings")
        .select("id")
        .eq("coach_id", coachId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("coach_invoice_settings")
          .update(settings)
          .eq("coach_id", coachId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("coach_invoice_settings")
          .insert({ coach_id: coachId, ...settings })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-invoice-settings", variables.coachId] });
      toast.success("Invoice settings saved");
    },
    onError: () => {
      toast.error("Failed to save invoice settings");
    },
  });
}

export function useUploadInvoiceLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ coachId, file }: { coachId: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${coachId}/invoice-logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      // Update settings with logo URL
      const { error: updateError } = await supabase
        .from("coach_invoice_settings")
        .upsert({
          coach_id: coachId,
          logo_url: publicUrl.publicUrl,
        }, { onConflict: "coach_id" });

      if (updateError) throw updateError;

      return publicUrl.publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coach-invoice-settings", variables.coachId] });
      toast.success("Logo uploaded successfully");
    },
    onError: () => {
      toast.error("Failed to upload logo");
    },
  });
}

// Hook for clients to view their receipts
export function useClientReceipts() {
  return useQuery({
    queryKey: ["client-receipts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!clientProfile) return [];

      // Fetch paid invoices for this client
      const { data, error } = await supabase
        .from("coach_invoices")
        .select(`
          *,
          coach:coach_profiles(
            display_name,
            username,
            profile_image_url
          ),
          line_items:invoice_line_items(*)
        `)
        .eq("client_id", clientProfile.id)
        .eq("status", "paid")
        .order("paid_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
