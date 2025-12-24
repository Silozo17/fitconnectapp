import { useState, useEffect } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoachClients, CoachClient } from "@/hooks/useCoachClients";
import { useCreateInvoice } from "@/hooks/useCoachFinancial";
import { useCoachInvoiceSettings } from "@/hooks/useCoachInvoiceSettings";
import { formatCurrency } from "@/lib/currency";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  coachId,
}: CreateInvoiceModalProps) {
  const { data: clients } = useCoachClients();
  const { data: invoiceSettings } = useCoachInvoiceSettings(coachId);
  const createInvoice = useCreateInvoice();

  const [clientId, setClientId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Pre-populate VAT rate from coach's invoice settings
  useEffect(() => {
    if (invoiceSettings?.vat_registered && invoiceSettings.vat_rate) {
      setTaxRate(invoiceSettings.vat_rate);
    }
  }, [invoiceSettings]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const handleSubmit = async () => {
    await createInvoice.mutateAsync({
      coachId,
      clientId: clientId || null,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      dueDate: dueDate || null,
      notes: notes || null,
      taxRate,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setClientId("");
    setDueDate("");
    // Use coach's saved VAT rate instead of resetting to 0
    setTaxRate(invoiceSettings?.vat_registered && invoiceSettings.vat_rate ? invoiceSettings.vat_rate : 0);
    setNotes("");
    setLineItems([
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client (Optional)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.client_id} value={client.client_id}>
                    {client.client_profile?.first_name} {client.client_profile?.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 sm:grid sm:grid-cols-12 sm:items-end p-3 rounded-lg bg-muted/50"
                >
                  {/* Description - full width on mobile */}
                  <div className="w-full sm:col-span-5 space-y-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                    )}
                    <Input
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                    />
                  </div>
                  
                  {/* Qty/Price/Total row - inline on mobile */}
                  <div className="flex gap-2 sm:contents">
                    <div className="w-16 flex-shrink-0 sm:w-auto sm:col-span-2 space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">Qty</Label>
                      )}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="flex-1 sm:col-span-3 space-y-1">
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Price (p)
                        </Label>
                      )}
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "unitPrice",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="flex-shrink-0 sm:col-span-2 flex items-end gap-2">
                      <span className="text-sm font-medium whitespace-nowrap pb-2">
                        {formatCurrency(item.quantity * item.unitPrice / 100)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Rate */}
          <div className="space-y-2">
            <Label>VAT Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="max-w-[120px]"
            />
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal / 100)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total / 100)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Payment terms, bank details, or other notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createInvoice.isPending ||
              lineItems.every((item) => !item.description || item.unitPrice === 0)
            }
          >
            {createInvoice.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
