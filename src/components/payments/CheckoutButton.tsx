import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CheckoutButtonProps {
  type: "package" | "subscription";
  itemId: string;
  coachId: string;
  coachUsername?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const CheckoutButton = ({
  type,
  itemId,
  coachId,
  coachUsername,
  label = "Purchase",
  variant = "default",
  size = "default",
  className,
}: CheckoutButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to make a purchase");
      return;
    }

    setIsLoading(true);
    try {
      // Get client profile ID
      const { data: clientProfile, error: profileError } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !clientProfile) {
        toast.error("Please complete your profile first");
        return;
      }

      const successUrl = `${window.location.origin}/dashboard/client/coaches?payment=success`;
      const cancelUrl = `${window.location.origin}/coaches/${coachUsername || coachId}?payment=cancelled`;

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          type,
          itemId,
          clientId: clientProfile.id,
          coachId,
          successUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start checkout";
      
      if (errorMessage.includes("not set up payment")) {
        toast.error("This coach hasn't set up payment processing yet. Please contact them directly.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {label}
    </Button>
  );
};

export default CheckoutButton;
