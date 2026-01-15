import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number | null;
  credits_amount: number;
  price: number;
  price_amount: number | null;
  currency: string;
  validity_days: number | null;
  description: string | null;
  is_active: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  location_id: string | null;
}

interface PackageFormData {
  name: string;
  credits: number;
  priceAmount: number;
  currency: string;
  validityDays: number | null;
  description: string;
  isActive: boolean;
}

export function CreditPackageManager() {
  const { gym } = useGym();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    credits: 1,
    priceAmount: 10,
    currency: "GBP",
    validityDays: null,
    description: "",
    isActive: true,
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ["gym-credit-packages", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];
      const { data, error } = await supabase
        .from("gym_credit_packages")
        .select("*")
        .eq("gym_id", gym.id)
        .order("credits", { ascending: true });
      
      if (error) throw error;
      // Map database fields to expected interface
      return data.map((pkg: any) => ({
        ...pkg,
        credits: pkg.credits || pkg.credits_amount,
        price_amount: pkg.price_amount || pkg.price,
      })) as CreditPackage[];
    },
    enabled: !!gym?.id,
  });

  const createPackage = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const { data: result, error } = await supabase.functions.invoke(
        "gym-create-credit-package",
        {
          body: {
            gymId: gym?.id,
            name: data.name,
            credits: data.credits,
            priceAmount: data.priceAmount,
            currency: data.currency,
            validityDays: data.validityDays,
            description: data.description,
            isActive: data.isActive,
          },
        }
      );
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gym-credit-packages"] });
      toast.success(
        data.stripeSync 
          ? "Credit package created and synced with Stripe" 
          : "Credit package created"
      );
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PackageFormData> }) => {
      const { error } = await supabase
        .from("gym_credit_packages")
        .update({
          name: data.name,
          credits: data.credits,
          price_amount: data.priceAmount ? Math.round(data.priceAmount * 100) : undefined,
          currency: data.currency,
          validity_days: data.validityDays,
          description: data.description,
          is_active: data.isActive,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-credit-packages"] });
      toast.success("Credit package updated");
      setIsDialogOpen(false);
      setEditingPackage(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update package: ${error.message}`);
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gym_credit_packages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-credit-packages"] });
      toast.success("Credit package deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete package: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      credits: 1,
      priceAmount: 10,
      currency: "GBP",
      validityDays: null,
      description: "",
      isActive: true,
    });
  };

  const openEditDialog = (pkg: CreditPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      credits: pkg.credits,
      priceAmount: pkg.price_amount / 100,
      currency: pkg.currency,
      validityDays: pkg.validity_days,
      description: pkg.description || "",
      isActive: pkg.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingPackage) {
      updatePackage.mutate({ id: editingPackage.id, data: formData });
    } else {
      createPackage.mutate(formData);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Credit Packages</CardTitle>
              <CardDescription>
                Create and manage credit packages for class bookings
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingPackage(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {packages?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No credit packages created yet</p>
              <p className="text-sm">Create your first package to start selling credits</p>
            </div>
          ) : (
            packages?.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{pkg.name}</p>
                      {!pkg.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {pkg.stripe_price_id && (
                        <Badge variant="outline" className="text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Stripe
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pkg.credits} credit{pkg.credits > 1 ? "s" : ""}
                      {pkg.validity_days && ` • Valid for ${pkg.validity_days} days`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold">
                    {formatPrice(pkg.price_amount, pkg.currency)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(pkg)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this package?")) {
                          deletePackage.mutate(pkg.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Credit Package" : "Create Credit Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details below"
                : "Create a new credit package for members to purchase"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., 10 Class Pack"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Number of Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.priceAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, priceAmount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Validity (days)</Label>
              <Input
                id="validity"
                type="number"
                min={0}
                value={formData.validityDays || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validityDays: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Leave empty for no expiry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this package available for purchase
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPackage.isPending || updatePackage.isPending}
            >
              {(createPackage.isPending || updatePackage.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingPackage ? "Save Changes" : "Create Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
