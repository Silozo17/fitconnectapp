import { memo, useState } from "react";
import { CreditCard, AlertCircle } from "lucide-react";
import { usePendingPayments } from "@/hooks/usePendingPayments";
import { PaymentRequestCard } from "@/components/payments/PaymentRequestCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const PendingPaymentsSection = memo(function PendingPaymentsSection() {
  const { t } = useTranslation("client");
  const { data: pendingPayments, isLoading } = usePendingPayments();
  const queryClient = useQueryClient();
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);

  const handlePayClick = async (sessionId: string) => {
    // For now, we'll show a toast - in production this would open Stripe checkout
    // The proper implementation would involve creating a checkout session for the session
    setCheckoutSessionId(sessionId);
  };

  const handleDeclineClick = async (sessionId: string) => {
    try {
      // Cancel the session
      const { error } = await supabase
        .from("coaching_sessions")
        .update({ 
          status: "cancelled",
          payment_status: "cancelled",
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success(t("pendingPayment.declined", "Session declined"));
      queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
    } catch (error) {
      console.error("Failed to decline session:", error);
      toast.error(t("pendingPayment.declineFailed", "Failed to decline session"));
    }
  };

  const handleCheckoutComplete = () => {
    setCheckoutSessionId(null);
    queryClient.invalidateQueries({ queryKey: ["pending-payments"] });
    queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
    toast.success(t("pendingPayment.paymentComplete", "Payment completed! Session confirmed."));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-lg">{t("pendingPayment.title", "Pending Payments")}</h3>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!pendingPayments || pendingPayments.length === 0) {
    return null; // Don't show section if no pending payments
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-lg text-foreground">
            {t("pendingPayment.title", "Pending Payments")}
          </h3>
          <span className="text-sm text-muted-foreground">
            ({pendingPayments.length})
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {t("pendingPayment.description", "Complete payment to confirm these sessions")}
        </p>

        <div className="grid gap-4">
          {pendingPayments.map((session) => (
            <PaymentRequestCard
              key={session.id}
              session={session}
              onPayClick={handlePayClick}
              onDeclineClick={handleDeclineClick}
            />
          ))}
        </div>
      </div>

      {/* Checkout Dialog - TODO: Create session-payment edge function */}
      <Dialog open={!!checkoutSessionId} onOpenChange={() => setCheckoutSessionId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("pendingPayment.completePayment", "Complete Payment")}</DialogTitle>
          </DialogHeader>
          {checkoutSessionId && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                {t("pendingPayment.checkoutNotReady", "Payment checkout for individual sessions is being set up. Please contact your coach for payment instructions.")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
