import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  type: "package" | "subscription" | "booking";
  purchaseId: string;
  coachId: string;
  clientId: string;
  amount: number;
  currency?: string;
  description: string;
  stripePaymentIntentId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: InvoiceRequest = await req.json();

    console.log("Creating invoice for:", body);

    const { type, purchaseId, coachId, clientId, amount, currency = "GBP", description, stripePaymentIntentId } = body;

    // Check if invoice already exists for this purchase
    const { data: existingInvoice } = await supabase
      .from("coach_invoices")
      .select("id")
      .eq("source_type", type)
      .eq("source_id", purchaseId)
      .single();

    if (existingInvoice) {
      console.log("Invoice already exists for this purchase:", existingInvoice.id);
      return new Response(
        JSON.stringify({ success: true, invoiceId: existingInvoice.id, existed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch coach's invoice settings
    const { data: invoiceSettings } = await supabase
      .from("coach_invoice_settings")
      .select("*")
      .eq("coach_id", coachId)
      .single();

    // Fetch client info
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("first_name, last_name, user_id")
      .eq("id", clientId)
      .single();

    // Get client email from auth if possible
    let clientEmail = "";
    if (clientProfile?.user_id) {
      const { data: { user } } = await supabase.auth.admin.getUserById(clientProfile.user_id);
      clientEmail = user?.email || "";
    }

    const clientName = clientProfile 
      ? `${clientProfile.first_name || ""} ${clientProfile.last_name || ""}`.trim() || "Client"
      : "Client";

    // Generate invoice number
    const { count } = await supabase
      .from("coach_invoices")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId);

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(5, "0")}`;

    // Calculate VAT if applicable
    let subtotal = amount;
    let taxAmount = 0;
    let total = amount;
    const taxRate = invoiceSettings?.vat_registered ? (invoiceSettings?.vat_rate || 20) : null;

    if (taxRate && invoiceSettings?.vat_registered) {
      if (invoiceSettings?.vat_inclusive) {
        // Price already includes VAT
        taxAmount = amount - (amount / (1 + taxRate / 100));
        subtotal = amount - taxAmount;
        total = amount;
      } else {
        // VAT is added on top
        subtotal = amount;
        taxAmount = amount * (taxRate / 100);
        total = amount + taxAmount;
      }
    }

    // Create business snapshot for the invoice
    const businessSnapshot = {
      business_name: invoiceSettings?.business_name || null,
      business_address: invoiceSettings?.business_address || null,
      business_email: invoiceSettings?.business_email || null,
      business_phone: invoiceSettings?.business_phone || null,
      vat_number: invoiceSettings?.vat_number || null,
      bank_details: invoiceSettings?.bank_details || null,
      logo_url: invoiceSettings?.logo_url || null,
    };

    // Create the invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days payment terms

    const { data: invoice, error: invoiceError } = await supabase
      .from("coach_invoices")
      .insert({
        coach_id: coachId,
        client_id: clientId,
        invoice_number: invoiceNumber,
        status: "paid", // Already paid since this is after purchase
        currency: currency,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount > 0 ? taxAmount : null,
        total: total,
        due_date: dueDate.toISOString(),
        paid_at: new Date().toISOString(),
        notes: invoiceSettings?.default_notes || null,
        template_id: invoiceSettings?.template_id || "modern",
        accent_color: invoiceSettings?.accent_color || "#BEFF00",
        business_snapshot: businessSnapshot,
        source_type: type,
        source_id: purchaseId,
        stripe_payment_intent_id: stripePaymentIntentId || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      throw invoiceError;
    }

    console.log("Invoice created:", invoice.id);

    // Create line item for the invoice
    const { error: lineItemError } = await supabase
      .from("invoice_line_items")
      .insert({
        invoice_id: invoice.id,
        description: description,
        quantity: 1,
        unit_price: subtotal,
        total: subtotal,
      });

    if (lineItemError) {
      console.error("Error creating line item:", lineItemError);
      // Don't fail the whole operation for line item error
    }

    console.log("Invoice creation complete:", invoice.invoice_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoiceId: invoice.id, 
        invoiceNumber: invoice.invoice_number 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-purchase-invoice:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
