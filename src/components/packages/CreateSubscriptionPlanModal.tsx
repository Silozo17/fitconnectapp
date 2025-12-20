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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { useCreateSubscriptionPlan, useUpdateSubscriptionPlan, CoachSubscriptionPlan } from "@/hooks/usePackages";
import { toast } from "sonner";

interface CreateSubscriptionPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan?: CoachSubscriptionPlan | null;
}

const CreateSubscriptionPlanModal = ({ open, onOpenChange, editPlan }: CreateSubscriptionPlanModalProps) => {
  const { t } = useTranslation("coach");
  const { t: tCommon } = useTranslation("common");
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [sessionsPerPeriod, setSessionsPerPeriod] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Sync form state when modal opens or editPlan changes
  useEffect(() => {
    if (open) {
      if (editPlan) {
        setName(editPlan.name || "");
        setDescription(editPlan.description || "");
        setPrice(editPlan.price?.toString() || "");
        setBillingPeriod(editPlan.billing_period || "monthly");
        setSessionsPerPeriod(editPlan.sessions_per_period?.toString() || "");
        setFeatures(editPlan.features || []);
        setIsActive(editPlan.is_active ?? true);
      } else {
        resetForm();
      }
    }
  }, [open, editPlan]);

  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      toast.error(t("subscriptionPlans.fillRequired"));
      return;
    }

    try {
      const planData = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        currency: "GBP",
        billing_period: billingPeriod,
        sessions_per_period: sessionsPerPeriod ? parseInt(sessionsPerPeriod) : null,
        features,
        is_active: isActive,
      };

      if (editPlan) {
        await updatePlan.mutateAsync({ id: editPlan.id, ...planData });
        toast.success(t("subscriptionPlans.planUpdated"));
      } else {
        await createPlan.mutateAsync(planData);
        toast.success(t("subscriptionPlans.planCreated"));
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(t("subscriptionPlans.failedToSave"));
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setBillingPeriod("monthly");
    setSessionsPerPeriod("");
    setFeatures([]);
    setNewFeature("");
    setIsActive(true);
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editPlan ? t("subscriptionPlans.editPlan") : t("subscriptionPlans.createPlan")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="name">{t("subscriptionPlans.planNameRequired")}</Label>
            <Input
              id="name"
              placeholder={t("subscriptionPlans.planNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("subscriptionPlans.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("subscriptionPlans.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("subscriptionPlans.priceRequired")}</Label>
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
              <Label>{t("subscriptionPlans.billingPeriod")}</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("subscriptionPlans.periods.monthly")}</SelectItem>
                  <SelectItem value="quarterly">{t("subscriptionPlans.periods.quarterly")}</SelectItem>
                  <SelectItem value="yearly">{t("subscriptionPlans.periods.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessions">{t("subscriptionPlans.sessionsPerPeriod")}</Label>
            <Input
              id="sessions"
              type="number"
              min="0"
              placeholder={t("subscriptionPlans.unlimitedIfEmpty")}
              value={sessionsPerPeriod}
              onChange={(e) => setSessionsPerPeriod(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("subscriptionPlans.featuresIncluded")}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t("subscriptionPlans.addFeature")}
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
              />
              <Button type="button" size="icon" variant="outline" onClick={handleAddFeature}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="space-y-2 mt-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted px-3 py-2 rounded-md"
                  >
                    <span className="text-sm">{feature}</span>
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">{t("subscriptionPlans.active")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("subscriptionPlans.activeDescription")}
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
            {editPlan ? tCommon("actions.saveChanges") : t("subscriptionPlans.createPlan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubscriptionPlanModal;
