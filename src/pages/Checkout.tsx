import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { UnifiedEmbeddedCheckout, CheckoutType } from "@/components/payments/UnifiedEmbeddedCheckout";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get("type") as CheckoutType;
  const itemId = searchParams.get("itemId");
  const coachId = searchParams.get("coachId");
  const clientId = searchParams.get("clientId");
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Validate required params
  if (!type || !itemId) {
    return (
      <PageLayout title="Checkout" description="Complete your purchase">
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Checkout</h1>
            <p className="text-muted-foreground mb-6">
              Missing required checkout information.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Determine success/cancel URLs based on type
  const getSuccessUrl = () => {
    switch (type) {
      case "digital-product":
      case "digital-bundle":
        return `${window.location.origin}/dashboard/client/library?purchased=${itemId}`;
      case "package":
      case "subscription":
        return `${window.location.origin}/dashboard/client/coaches?payment=success`;
      default:
        return `${window.location.origin}/dashboard/client`;
    }
  };

  const getCancelUrl = () => {
    return `${window.location.origin}${returnUrl}`;
  };

  return (
    <PageLayout title="Checkout" description="Complete your purchase">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(returnUrl)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
            
            <Card className="p-6">
              <UnifiedEmbeddedCheckout
                checkoutType={type}
                itemId={itemId}
                coachId={coachId || undefined}
                clientId={clientId || undefined}
                successUrl={getSuccessUrl()}
                cancelUrl={getCancelUrl()}
              />
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
