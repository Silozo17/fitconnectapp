import { useState } from "react";
import { Plus, Edit2, Trash2, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreditPackages, useCreditPackageMutations, CreditPackage } from "@/hooks/gym/useGymBooking";
import { cn } from "@/lib/utils";

export default function GymAdminCredits() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);

  const { data: packages = [], isLoading } = useCreditPackages();
  const { createPackage, updatePackage, deletePackage } = useCreditPackageMutations();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    credit_type: "class",
    credits_amount: 10,
    price: 50,
    currency: "GBP",
    validity_days: 30,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      credit_type: "class",
      credits_amount: 10,
      price: 50,
      currency: "GBP",
      validity_days: 30,
    });
  };

  const handleCreate = async () => {
    await createPackage.mutateAsync({
      ...formData,
      validity_days: formData.validity_days || null,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingPackage) return;
    await updatePackage.mutateAsync({
      id: editingPackage.id,
      ...formData,
      validity_days: formData.validity_days || null,
    });
    setEditingPackage(null);
    resetForm();
  };

  const handleEdit = (pkg: CreditPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      credit_type: pkg.credit_type,
      credits_amount: pkg.credits_amount,
      price: pkg.price,
      currency: pkg.currency,
      validity_days: pkg.validity_days || 0,
    });
    setEditingPackage(pkg);
  };

  const handleDelete = async (pkg: CreditPackage) => {
    if (confirm(`Are you sure you want to deactivate "${pkg.name}"?`)) {
      await deletePackage.mutateAsync(pkg.id);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(price);
  };

  const PackageForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Package Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="e.g., 10 Class Pack"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
          placeholder="What's included in this package..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Credit Type</Label>
          <Select value={formData.credit_type} onValueChange={(v) => setFormData(p => ({ ...p, credit_type: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Class Credits</SelectItem>
              <SelectItem value="session">Session Credits</SelectItem>
              <SelectItem value="general">General Credits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Number of Credits</Label>
          <Input
            type="number"
            value={formData.credits_amount}
            onChange={(e) => setFormData(p => ({ ...p, credits_amount: parseInt(e.target.value) || 1 }))}
            min={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
            min={0}
            step={0.01}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={formData.currency} onValueChange={(v) => setFormData(p => ({ ...p, currency: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Validity (Days)</Label>
        <Input
          type="number"
          value={formData.validity_days || ""}
          onChange={(e) => setFormData(p => ({ ...p, validity_days: parseInt(e.target.value) || 0 }))}
          placeholder="Leave empty for no expiry"
          min={0}
        />
        <p className="text-xs text-muted-foreground">Leave empty or 0 for credits that never expire</p>
      </div>

      <Button 
        className="w-full" 
        onClick={onSubmit}
        disabled={!formData.name || createPackage.isPending || updatePackage.isPending}
      >
        {createPackage.isPending || updatePackage.isPending ? "Saving..." : submitLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Credit Packages</h1>
          <p className="text-muted-foreground">Create and manage credit packages for members to purchase</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Credit Package</DialogTitle>
            </DialogHeader>
            <PackageForm onSubmit={handleCreate} submitLabel="Create Package" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Credit Packages</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create credit packages that members can purchase to book classes
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={cn(!pkg.is_active && "opacity-60")}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {pkg.credits_amount} {pkg.credit_type} credits
                    </CardDescription>
                  </div>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>
                    {pkg.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatPrice(pkg.price, pkg.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {pkg.validity_days ? `${pkg.validity_days} days validity` : "Never expires"}
                    </span>
                  </div>

                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit2 className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(pkg)}
                      disabled={deletePackage.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Credit Package</DialogTitle>
          </DialogHeader>
          <PackageForm onSubmit={handleUpdate} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
