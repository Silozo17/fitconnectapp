import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCreateBundle, DigitalProduct, CONTENT_TYPES } from "@/hooks/useDigitalProducts";
import { formatCurrency } from "@/lib/currency";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  is_published: z.boolean(),
  productIds: z.array(z.string()).min(2, "Select at least 2 products"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBundleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: DigitalProduct[];
}

export default function CreateBundleModal({ open, onOpenChange, products }: CreateBundleModalProps) {
  const createBundle = useCreateBundle();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "GBP",
      cover_image_url: "",
      is_published: false,
      productIds: [],
    },
  });

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
  const originalPrice = selectedProductsData.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = form.watch("price");
  const savings = originalPrice > 0 ? Math.round(((originalPrice - bundlePrice) / originalPrice) * 100) : 0;

  const handleProductToggle = (productId: string) => {
    const newSelected = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(newSelected);
    form.setValue("productIds", newSelected);
  };

  const onSubmit = async (values: FormValues) => {
    await createBundle.mutateAsync({
      title: values.title,
      description: values.description,
      price: values.price,
      original_price: originalPrice,
      currency: values.currency,
      cover_image_url: values.cover_image_url || null,
      is_published: values.is_published,
      productIds: values.productIds,
    });
    
    form.reset();
    setSelectedProducts([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Bundle</DialogTitle>
          <DialogDescription>
            Combine multiple products into a discounted bundle
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Complete Fitness Starter Pack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what's included in this bundle..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Selection */}
            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <FormLabel>Select Products *</FormLabel>
                  <FormDescription>Choose at least 2 products to include in this bundle</FormDescription>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                    {products.length > 0 ? (
                      products.map((product) => {
                        const contentType = CONTENT_TYPES.find(t => t.value === product.content_type);
                        const isSelected = selectedProducts.includes(product.id);
                        
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-muted-foreground"
                            }`}
                            onClick={() => handleProductToggle(product.id)}
                          >
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => handleProductToggle(product.id)}
                            />
                            <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0">
                              {product.cover_image_url ? (
                                <img
                                  src={product.cover_image_url}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-sm">
                                  {contentType && <contentType.icon className="h-6 w-6 text-muted-foreground" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.title}</p>
                              <p className="text-xs text-muted-foreground">{contentType?.label}</p>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(product.price, (product.currency || "GBP") as "GBP" | "USD" | "EUR")}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No products available. Create some products first.
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Price *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing Summary */}
            {selectedProducts.length >= 2 && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Total ({selectedProducts.length} items)</span>
                  <span className="line-through text-muted-foreground">
                    {formatCurrency(originalPrice, (form.watch("currency") || "GBP") as "GBP" | "USD" | "EUR")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bundle Price</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(bundlePrice, (form.watch("currency") || "GBP") as "GBP" | "USD" | "EUR")}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Customer Saves</span>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      {savings}% off
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Publish Now</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBundle.isPending || selectedProducts.length < 2}>
                {createBundle.isPending ? "Creating..." : "Create Bundle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
