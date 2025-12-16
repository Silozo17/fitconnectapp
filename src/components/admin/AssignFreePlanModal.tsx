import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrantFreePlan } from "@/hooks/useAdminData";
import { Gift, Crown, Zap, Rocket } from "lucide-react";

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
  { id: "starter", name: "Starter", price: "£19/month", icon: Zap },
  { id: "pro", name: "Pro", price: "£49/month", icon: Rocket },
  { id: "enterprise", name: "Enterprise", price: "£99/month", icon: Crown },
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
      expiresAt: expiresAt || undefined,
    });

    onOpenChange(false);
    setSelectedTier("");
    setReason("");
    setExpiresAt("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Grant Free Plan
          </DialogTitle>
          <DialogDescription>
            Give {coach?.display_name || "this coach"} free access to a premium tier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedTier === tier.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedTier === tier.id ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${selectedTier === tier.id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tier.name}</p>
                      <p className="text-sm text-muted-foreground">Normally {tier.price}</p>
                    </div>
                    {selectedTier === tier.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date (optional)</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiry
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Why is this plan being granted?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedTier || grantFreePlan.isPending}
          >
            {grantFreePlan.isPending ? "Granting..." : "Grant Free Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}