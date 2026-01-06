import { useState } from "react";
import { format } from "date-fns";
import { Receipt, Download, Eye, Loader2, FileText } from "lucide-react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClientReceipts } from "@/hooks/useCoachInvoiceSettings";
import { InvoicePreview, InvoiceData, BusinessDetails } from "@/components/invoice/InvoicePreview";
import { TemplateId } from "@/hooks/useCoachInvoiceSettings";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DashboardSectionHeader, ContentSection } from "@/components/shared";
import { cn } from "@/lib/utils";

const ClientReceipts = () => {
  const { data: receipts = [], isLoading } = useClientReceipts();
  const [selectedReceipt, setSelectedReceipt] = useState<typeof receipts[0] | null>(null);

  const formatCurrency = (amount: number, currency = "GBP") => {
    const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
    return `${symbols[currency] || "£"}${amount.toFixed(2)}`;
  };

  const getInvoiceData = (receipt: typeof receipts[0]): InvoiceData => {
    return {
      invoiceNumber: receipt.invoice_number,
      date: new Date(receipt.created_at || Date.now()),
      dueDate: new Date(receipt.due_date || Date.now()),
      clientName: "You",
      lineItems: (receipt.line_items || []).map((item: any) => ({
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        total: item.total || 0,
      })),
      subtotal: receipt.subtotal || receipt.total,
      taxRate: receipt.tax_rate || undefined,
      taxAmount: receipt.tax_amount || undefined,
      total: receipt.total,
      notes: receipt.notes || undefined,
      status: receipt.status,
    };
  };

  const getBusinessDetails = (receipt: typeof receipts[0]): BusinessDetails => {
    const snapshot = receipt.business_snapshot as any;
    return {
      businessName: snapshot?.business_name || receipt.coach?.display_name || "Coach",
      businessAddress: snapshot?.business_address,
      businessEmail: snapshot?.business_email,
      businessPhone: snapshot?.business_phone,
      vatNumber: snapshot?.vat_number,
      logoUrl: snapshot?.logo_url,
      bankDetails: snapshot?.bank_details,
      paymentTerms: snapshot?.default_payment_terms,
    };
  };

  if (isLoading) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_receipts"
        title="Payment History"
        description="View and download invoices for all your purchases"
      />
      <div className="space-y-11">
        <DashboardSectionHeader
          title="Receipts"
          description="View and download your payment receipts"
        />

        {receipts.length === 0 ? (
          <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No receipts yet</h3>
            <p className="text-muted-foreground text-sm">
              Your payment receipts will appear here after you complete bookings or purchases.
            </p>
          </ContentSection>
        ) : (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <div 
                key={receipt.id} 
                className={cn(
                  "relative overflow-hidden rounded-2xl p-5",
                  "bg-gradient-to-br from-card/80 via-card/60 to-card/40",
                  "border border-border/50 hover:border-primary/30",
                  "backdrop-blur-sm transition-all duration-200",
                  "before:absolute before:inset-x-0 before:top-0 before:h-[2px]",
                  "before:bg-gradient-to-r before:from-primary/60 before:via-accent/40 before:to-primary/60"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{receipt.invoice_number}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`rounded-full ${receipt.status === "refunded" 
                            ? "bg-orange-500/10 text-orange-500" 
                            : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {receipt.status === "refunded" ? "Refunded" : "Paid"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {receipt.coach?.display_name || "Coach"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Paid on {format(new Date(receipt.paid_at || receipt.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(receipt.total, receipt.currency)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Receipt Preview Dialog */}
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Receipt {selectedReceipt?.invoice_number}</DialogTitle>
            </DialogHeader>
            {selectedReceipt && (
              <div className="mt-4">
                <InvoicePreview
                  invoice={getInvoiceData(selectedReceipt)}
                  business={getBusinessDetails(selectedReceipt)}
                  templateId={(selectedReceipt.template_id as TemplateId) || "modern"}
                  accentColor={selectedReceipt.accent_color || "#BEFF00"}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientReceipts;
