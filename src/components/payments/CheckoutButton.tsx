import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to make a purchase");
      return;
    }

    // Navigate to embedded checkout page
    const params = new URLSearchParams({
      type,
      itemId,
      coachId,
      returnUrl: `/coaches/${coachUsername || coachId}`,
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCheckout}
      className={className}
    >
      {label}
    </Button>
  );
};

export default CheckoutButton;
