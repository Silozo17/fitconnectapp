import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreatePackage, useUpdatePackage, CoachPackage } from "@/hooks/usePackages";
import { toast } from "sonner";

interface CreatePackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPackage?: CoachPackage | null;
}

const CreatePackageModal = ({ open, onOpenChange, editPackage }: CreatePackageModalProps) => {
  const [name, setName] = useState(editPackage?.name || "");
  const [description, setDescription] = useState(editPackage?.description || "");
  const [sessionCount, setSessionCount] = useState(editPackage?.session_count?.toString() || "5");
  const [price, setPrice] = useState(editPackage?.price?.toString() || "");
  const [validityDays, setValidityDays] = useState(editPackage?.validity_days?.toString() || "90");
  const [isActive, setIsActive] = useState(editPackage?.is_active ?? true);

  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const handleSubmit = async () => {
    if (!name.trim() || !sessionCount || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const packageData = {
        name: name.trim(),
        description: description.trim() || null,
        session_count: parseInt(sessionCount),
        price: parseFloat(price),
        currency: "GBP",
        validity_days: parseInt(validityDays) || 90,
        is_active: isActive,
      };

      if (editPackage) {
        await updatePackage.mutateAsync({ id: editPackage.id, ...packageData });
        toast.success("Package updated successfully");
      } else {
        await createPackage.mutateAsync(packageData);
        toast.success("Package created successfully");
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save package");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSessionCount("5");
    setPrice("");
    setValidityDays("90");
    setIsActive(true);
  };

  const isPending = createPackage.isPending || updatePackage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editPackage ? "Edit Package" : "Create Session Package"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Starter Pack"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what's included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">Number of Sessions *</Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validity">Valid for (days)</Label>
            <Input
              id="validity"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sessions must be used within this period
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Visible to clients on your profile
              </p>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editPackage ? "Save Changes" : "Create Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageModal;
