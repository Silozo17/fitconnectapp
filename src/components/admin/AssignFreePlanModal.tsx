import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartDateInput } from "@/components/ui/smart-date-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGrantFreePlan } from "@/hooks/useAdminData";
import { Gift, Crown, Zap, Rocket, Sparkles, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignFreePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: {
    id: string;
    display_name: string;
    subscription_tier: string;
  } | null;
}

const tiers = [
  { id: "starter", name: "Starter", price: "£19/month", icon: Zap, special: false },
  { id: "pro", name: "Pro", price: "£49/month", icon: Rocket, special: false },
  { id: "enterprise", name: "Enterprise", price: "£99/month", icon: Crown, special: false },
  { id: "founder", name: "Founder", price: "Lifetime Free", icon: Sparkles, special: true },
];

export function AssignFreePlanModal({ open, onOpenChange, coach }: AssignFreePlanModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  
  const grantFreePlan = useGrantFreePlan();

  const handleSubmit = async () => {
    if (!coach || !selectedTier) return;

    await grantFreePlan.mutateAsync({
      coachId: coach.id,
      tier: selectedTier,
      reason: reason || undefined,
      expiresAt: selectedTier === "founder" ? undefined : expiresAt || undefined,
    });

    onOpenChange(false);
    setSelectedTier("");
    setReason("");
    setExpiresAt("");
  };

  const isFounderSelected = selectedTier === "founder";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Grant Free Plan
          </DialogTitle>
          <DialogDescription>
            Give {coach?.display_name || "this coach"} free access to a premium tier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label>Current Tier</Label>
            <p className="text-sm text-muted-foreground capitalize">
              {coach?.subscription_tier || "Free"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Select New Tier</Label>
            <div className="grid gap-2">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                      isSelected
                        ? tier.special
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50",
                      tier.special && "relative overflow-hidden"
                    )}
                  >
                    {tier.special && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-xs text-black font-semibold px-2 py-0.5 rounded-bl">
                        Admin Only
                      </div>
                    )}
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected 
                        ? tier.special ? "bg-amber-500/20" : "bg-primary/10"
                        : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        isSelected 
                          ? tier.special ? "text-amber-500" : "text-primary"
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tier.name}</p>
                        {tier.special && (
                          <Infinity className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.special ? "Unlimited access forever" : `Normally ${tier.price}`}
                      </p>
                    </div>
                    {isSelected && (
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        tier.special ? "bg-amber-500" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isFounderSelected && (
            <div className="space-y-2 min-w-0 overflow-hidden">
              <Label>Expiry Date (optional)</Label>
              <SmartDateInput
                value={expiresAt}
                onChange={setExpiresAt}
                min={new Date().toISOString().split("T")[0]}
                placeholder="Select date"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiry
              </p>
            </div>
          )}

          {isFounderSelected && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-sm text-amber-500 flex items-center gap-2">
                <Infinity className="h-4 w-4" />
                Founder plan has no expiry - lifetime access
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Why is this plan being granted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedTier || grantFreePlan.isPending}
              className={isFounderSelected ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {grantFreePlan.isPending ? "Granting..." : `Grant ${isFounderSelected ? "Founder" : "Free"} Plan`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}