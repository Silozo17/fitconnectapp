import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DigitalProduct, useUpdateProduct } from "@/hooks/useDigitalProducts";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-utils";

interface BulkEditPricesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: DigitalProduct[];
}

interface ProductPriceEdit {
  id: string;
  selected: boolean;
  price: string;
  compare_at_price: string;
}

export default function BulkEditPricesModal({ open, onOpenChange, products }: BulkEditPricesModalProps) {
  const { toast } = useToast();
  const updateProduct = useUpdateProduct();
  const [edits, setEdits] = useState<ProductPriceEdit[]>([]);
  const [applyToAll, setApplyToAll] = useState({ price: "", compare_at_price: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEdits(products.map(p => ({
        id: p.id,
        selected: false,
        price: p.price.toString(),
        compare_at_price: p.compare_at_price?.toString() || "",
      })));
      setApplyToAll({ price: "", compare_at_price: "" });
    }
  }, [open, products]);

  const selectedCount = edits.filter(e => e.selected).length;

  const handleSelectAll = () => {
    const allSelected = edits.every(e => e.selected);
    setEdits(edits.map(e => ({ ...e, selected: !allSelected })));
  };

  const handleToggleSelect = (id: string) => {
    setEdits(edits.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  const handlePriceChange = (id: string, field: 'price' | 'compare_at_price', value: string) => {
    setEdits(edits.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleApplyToSelected = (field: 'price' | 'compare_at_price') => {
    const value = applyToAll[field];
    if (!value) return;
    setEdits(edits.map(e => e.selected ? { ...e, [field]: value } : e));
  };

  const handleSave = async () => {
    const toUpdate = edits.filter(e => e.selected);
    if (toUpdate.length === 0) {
      toast({ title: "No products selected", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      for (const edit of toUpdate) {
        await updateProduct.mutateAsync({
          id: edit.id,
          price: parseFloat(edit.price) || 0,
          compare_at_price: edit.compare_at_price ? parseFloat(edit.compare_at_price) : null,
        });
      }
      toast({ title: `Updated ${toUpdate.length} products` });
      onOpenChange(false);
    } catch (error: unknown) {
      toast({ title: "Failed to update", description: getErrorMessage(error, "An error occurred"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Edit Prices</DialogTitle>
          <DialogDescription>
            Select products and update their prices. You can apply the same price to all selected products.
          </DialogDescription>
        </DialogHeader>

        {/* Apply to all selected */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Apply to selected ({selectedCount})</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={applyToAll.price}
                  onChange={(e) => setApplyToAll({ ...applyToAll, price: e.target.value })}
                />
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => handleApplyToSelected('price')}
                disabled={!applyToAll.price || selectedCount === 0}
              >
                Apply
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Compare at Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={applyToAll.compare_at_price}
                  onChange={(e) => setApplyToAll({ ...applyToAll, compare_at_price: e.target.value })}
                />
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => handleApplyToSelected('compare_at_price')}
                disabled={!applyToAll.compare_at_price || selectedCount === 0}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Product list */}
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            {edits.every(e => e.selected) ? "Deselect All" : "Select All"}
          </Button>
          <Badge variant="secondary">{selectedCount} selected</Badge>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {products.map((product, index) => {
              const edit = edits[index];
              if (!edit) return null;

              return (
                <div 
                  key={product.id} 
                  className={`flex items-center gap-4 p-3 rounded-lg border ${edit.selected ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <Checkbox
                    checked={edit.selected}
                    onCheckedChange={() => handleToggleSelect(product.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                      {product.compare_at_price && (
                        <span className="ml-2 line-through">
                          {formatCurrency(product.compare_at_price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-24">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={edit.price}
                        onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Compare</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="—"
                        value={edit.compare_at_price}
                        onChange={(e) => handlePriceChange(product.id, 'compare_at_price', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedCount === 0}>
            {isSaving ? "Saving..." : `Update ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}