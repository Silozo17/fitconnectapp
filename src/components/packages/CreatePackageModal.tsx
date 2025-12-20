import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("coach");
  const { t: tCommon } = useTranslation("common");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionCount, setSessionCount] = useState("5");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState("90");
  const [isActive, setIsActive] = useState(true);

  // Sync form state when modal opens or editPackage changes
  useEffect(() => {
    if (open) {
      if (editPackage) {
        setName(editPackage.name || "");
        setDescription(editPackage.description || "");
        setSessionCount(editPackage.session_count?.toString() || "5");
        setSessionDuration(editPackage.session_duration_minutes?.toString() || "60");
        setPrice(editPackage.price?.toString() || "");
        setValidityDays(editPackage.validity_days?.toString() || "90");
        setIsActive(editPackage.is_active ?? true);
      } else {
        resetForm();
      }
    }
  }, [open, editPackage]);

  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const handleSubmit = async () => {
    if (!name.trim() || !sessionCount || !price) {
      toast.error(t("packages.fillRequired"));
      return;
    }

    try {
      const packageData = {
        name: name.trim(),
        description: description.trim() || null,
        session_count: parseInt(sessionCount),
        session_duration_minutes: parseInt(sessionDuration) || 60,
        price: parseFloat(price),
        currency: "GBP",
        validity_days: parseInt(validityDays) || 90,
        is_active: isActive,
      };

      if (editPackage) {
        await updatePackage.mutateAsync({ id: editPackage.id, ...packageData });
        toast.success(t("packages.packageUpdated"));
      } else {
        await createPackage.mutateAsync(packageData);
        toast.success(t("packages.packageCreated"));
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(t("packages.failedToSave"));
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSessionCount("5");
    setSessionDuration("60");
    setPrice("");
    setValidityDays("90");
    setIsActive(true);
  };

  const isPending = createPackage.isPending || updatePackage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editPackage ? t("packages.editPackage") : t("packages.createSessionPackage")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("packages.packageNameRequired")}</Label>
            <Input
              id="name"
              placeholder={t("packages.packageNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("packages.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("packages.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">{t("packages.numberOfSessions")}</Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                value={sessionCount}
                onChange={(e) => setSessionCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t("packages.sessionDuration")}</Label>
              <select
                id="duration"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
              >
                <option value="30">{t("packages.durations.30min")}</option>
                <option value="45">{t("packages.durations.45min")}</option>
                <option value="60">{t("packages.durations.1hr")}</option>
                <option value="90">{t("packages.durations.1.5hr")}</option>
                <option value="120">{t("packages.durations.2hr")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">{t("packages.priceRequired")}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="validity">{t("packages.validFor")}</Label>
            <Input
              id="validity"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("packages.validityNote")}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">{t("packages.active")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("packages.activeDescription")}
              </p>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editPackage ? tCommon("actions.saveChanges") : t("packages.createPackage")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageModal;
