import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Generate invoice number: GYM-YYYYMMDD-XXXXX
function generateInvoiceNumber(gymPrefix: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `${gymPrefix}-${dateStr}-${random}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      memberId, 
      gymId, 
      amount, 
      currency = 'gbp',
      description,
      paymentIntentId,
      planName,
      planId,
      locationId
    } = await req.json();

    if (!memberId || !gymId || !amount) {
      throw new Error("Missing required parameters: memberId, gymId, amount");
    }

    // Get gym profile for invoice prefix
    const { data: gym, error: gymError } = await supabase
      .from("gym_profiles")
      .select("name, slug")
      .eq("id", gymId)
      .single();

    if (gymError) throw gymError;

    // Generate invoice number with gym slug prefix
    const gymPrefix = (gym?.slug || 'GYM').toUpperCase().slice(0, 4);
    const invoiceNumber = generateInvoiceNumber(gymPrefix);

    // Calculate amounts
    const subtotal = amount;
    const taxRate = 0; // Gym memberships typically exempt from VAT in UK
    const taxAmount = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + taxAmount;

    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("gym_invoices")
      .insert({
        gym_id: gymId,
        member_id: memberId,
        location_id: locationId || null,
        invoice_number: invoiceNumber,
        status: 'paid',
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: currency.toLowerCase(),
        due_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        notes: description || `Payment for ${planName || 'Membership'}`,
        stripe_payment_intent_id: paymentIntentId || null,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice item
    if (invoice) {
      const { error: itemError } = await supabase
        .from("gym_invoice_items")
        .insert({
          invoice_id: invoice.id,
          description: planName || 'Membership Fee',
          quantity: 1,
          unit_price: amount,
          total_price: amount,
        });

      if (itemError) {
        console.warn("[gym-create-invoice-from-payment] Failed to create invoice item:", itemError);
      }
    }

    console.log(`[gym-create-invoice-from-payment] Created invoice ${invoiceNumber} for member ${memberId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceId: invoice.id,
      invoiceNumber: invoiceNumber
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[gym-create-invoice-from-payment] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
