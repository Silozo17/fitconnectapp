import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Coins, Sparkles, Loader2, Check } from "lucide-react";

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
  currentCredits?: number;
}

const CREDIT_PACKS = [
  {
    id: "single",
    name: "1 Credit",
    credits: 1,
    price: 10,
    priceLabel: "£10",
    description: "Pay per class",
    popular: false,
  },
  {
    id: "bulk10",
    name: "10 Credits",
    credits: 10,
    price: 90,
    priceLabel: "£90",
    originalPrice: "£100",
    description: "Save £10!",
    popular: true,
  },
];

export function CreditPurchaseDialog({
  open,
  onOpenChange,
  memberId,
  currentCredits = 0,
}: CreditPurchaseDialogProps) {
  const { gym } = useGym();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePurchase = async (packType: string) => {
    if (!gym?.id) {
      toast.error("Gym not found");
      return;
    }

    setIsLoading(packType);

    try {
      const { data, error } = await supabase.functions.invoke("gym-purchase-credits", {
        body: {
          gymId: gym.id,
          packType,
          memberId,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
        onOpenChange(false);
        toast.success("Redirecting to payment...");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Buy Class Credits
          </DialogTitle>
          <DialogDescription>
            Credits are used to book gym classes. 1 credit = 1 class.
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          <span className="text-2xl font-bold">{currentCredits} credits</span>
        </div>

        {/* Credit Packs */}
        <div className="grid gap-3">
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`relative cursor-pointer transition-all hover:border-primary ${
                pack.popular ? "border-primary ring-1 ring-primary" : ""
              }`}
              onClick={() => !isLoading && handlePurchase(pack.id)}
            >
              {pack.popular && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Best Value
                </Badge>
              )}
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{pack.name}</h4>
                    {pack.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {pack.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{pack.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{pack.priceLabel}</span>
                  <Button
                    size="sm"
                    disabled={!!isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pack.id);
                    }}
                  >
                    {isLoading === pack.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="mr-1 h-4 w-4" />
                        Buy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment via Stripe. Credits never expire.
        </p>
      </DialogContent>
    </Dialog>
  );
}
