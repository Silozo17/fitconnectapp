import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface POSCardPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gymId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  memberId?: string;
  total: number;
}

function PaymentForm({
  onSuccess,
  onClose,
  saleId,
}: {
  onSuccess: () => void;
  onClose: () => void;
  saleId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        // Confirm the sale on the backend
        const { error: confirmError } = await supabase.functions.invoke(
          "gym-pos-confirm",
          { body: { saleId } }
        );

        if (confirmError) {
          console.error("Confirm error:", confirmError);
        }

        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </div>
    </form>
  );
}

export function POSCardPayment({
  isOpen,
  onClose,
  onSuccess,
  gymId,
  items,
  memberId,
  total,
}: POSCardPaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [saleId, setSaleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gym-pos-payment", {
        body: {
          gymId,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          memberId: memberId || null,
          paymentMethod: "card",
        },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setSaleId(data.saleId);
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      toast.error("Failed to initialize payment");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize when dialog opens
  useState(() => {
    if (isOpen && !clientSecret) {
      initializePayment();
    }
  });

  const handleSuccess = () => {
    setClientSecret(null);
    setSaleId(null);
    onSuccess();
  };

  const handleClose = () => {
    setClientSecret(null);
    setSaleId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Card Payment - £{total.toFixed(2)}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing payment...</p>
          </div>
        ) : clientSecret && saleId ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <PaymentForm
              onSuccess={handleSuccess}
              onClose={handleClose}
              saleId={saleId}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
