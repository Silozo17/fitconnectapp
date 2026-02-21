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
  // Hybrid fields
  const [isHybrid, setIsHybrid] = useState(false);
  const [inPersonSessions, setInPersonSessions] = useState("2");
  const [onlineSessions, setOnlineSessions] = useState("2");
  // Group fields
  const [isGroupPackage, setIsGroupPackage] = useState(false);
  const [minGroupSize, setMinGroupSize] = useState("2");
  const [maxGroupSize, setMaxGroupSize] = useState("4");
  // Duration
  const [billingMonths, setBillingMonths] = useState("1");
  const [sessionsPerMonth, setSessionsPerMonth] = useState("");

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
        setIsHybrid(editPackage.is_hybrid ?? false);
        setInPersonSessions(editPackage.in_person_sessions?.toString() || "2");
        setOnlineSessions(editPackage.online_sessions?.toString() || "2");
        setIsGroupPackage(editPackage.is_group_package ?? false);
        setMinGroupSize(editPackage.min_group_size?.toString() || "2");
        setMaxGroupSize(editPackage.max_group_size?.toString() || "4");
        setBillingMonths(editPackage.billing_months?.toString() || "1");
        setSessionsPerMonth(editPackage.sessions_per_month?.toString() || "");
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
      const totalSessions = isHybrid
        ? (parseInt(inPersonSessions) || 0) + (parseInt(onlineSessions) || 0)
        : parseInt(sessionCount);

      const packageData = {
        name: name.trim(),
        description: description.trim() || null,
        session_count: totalSessions,
        session_duration_minutes: parseInt(sessionDuration) || 60,
        price: parseFloat(price),
        currency: "GBP",
        validity_days: parseInt(validityDays) || 90,
        is_active: isActive,
        is_hybrid: isHybrid,
        in_person_sessions: isHybrid ? (parseInt(inPersonSessions) || 0) : null,
        online_sessions: isHybrid ? (parseInt(onlineSessions) || 0) : null,
        billing_months: parseInt(billingMonths) || 1,
        is_group_package: isGroupPackage,
        min_group_size: isGroupPackage ? (parseInt(minGroupSize) || 2) : 1,
        max_group_size: isGroupPackage ? (parseInt(maxGroupSize) || 4) : 1,
        sessions_per_month: sessionsPerMonth ? parseInt(sessionsPerMonth) : null,
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
    setIsHybrid(false);
    setInPersonSessions("2");
    setOnlineSessions("2");
    setIsGroupPackage(false);
    setMinGroupSize("2");
    setMaxGroupSize("4");
    setBillingMonths("1");
    setSessionsPerMonth("");
  };

  const isPending = createPackage.isPending || updatePackage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editPackage ? t("packages.editPackage") : t("packages.createSessionPackage")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("packages.packageNameRequired")}</Label>
            <Input
              id="name"
              placeholder={t("packages.packageNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
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

          {/* Hybrid Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="hybrid">{t("packages.hybridPackage")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("packages.hybridDescription")}
              </p>
            </div>
            <Switch id="hybrid" checked={isHybrid} onCheckedChange={setIsHybrid} />
          </div>

          {/* Hybrid session breakdown */}
          {isHybrid ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="inPerson">{t("packages.inPersonSessions")}</Label>
                <Input
                  id="inPerson"
                  type="number"
                  min="0"
                  value={inPersonSessions}
                  onChange={(e) => setInPersonSessions(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="online">{t("packages.onlineSessions")}</Label>
                <Input
                  id="online"
                  type="number"
                  min="0"
                  value={onlineSessions}
                  onChange={(e) => setOnlineSessions(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground col-span-full">
                {t("packages.totalSessionsHybrid", {
                  total: (parseInt(inPersonSessions) || 0) + (parseInt(onlineSessions) || 0),
                })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="sessions">{t("packages.numberOfSessions")}</Label>
                <Input
                  id="sessions"
                  className="w-full"
                  type="number"
                  min="1"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
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
          )}

          {/* Session Duration for hybrid */}
          {isHybrid && (
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
          )}

          {/* Group Package Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="group">{t("packages.groupPackage")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("packages.groupDescription")}
              </p>
            </div>
            <Switch id="group" checked={isGroupPackage} onCheckedChange={setIsGroupPackage} />
          </div>

          {/* Group size fields */}
          {isGroupPackage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="minGroup">{t("packages.minGroupSize")}</Label>
                <Input
                  id="minGroup"
                  type="number"
                  min="2"
                  value={minGroupSize}
                  onChange={(e) => setMinGroupSize(e.target.value)}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor="maxGroup">{t("packages.maxGroupSize")}</Label>
                <Input
                  id="maxGroup"
                  type="number"
                  min="2"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Price */}
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

          {/* Package Duration (months) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingMonths">{t("packages.packageDuration")}</Label>
              <Input
                id="billingMonths"
                type="number"
                min="1"
                value={billingMonths}
                onChange={(e) => setBillingMonths(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("packages.packageDurationNote")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionsPerMonth">{t("packages.sessionsPerMonth")}</Label>
              <Input
                id="sessionsPerMonth"
                type="number"
                min="1"
                placeholder={t("packages.optional")}
                value={sessionsPerMonth}
                onChange={(e) => setSessionsPerMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Validity */}
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

          {/* Active Toggle */}
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
