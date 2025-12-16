import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscribeSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Give a short delay to let webhook process
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to FitConnect!
          </h1>
          <p className="text-muted-foreground">
            Your subscription is now active. You have full access to all the tools you need to grow your coaching business.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">What's next?</h2>
          <ul className="text-left space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Complete your coach profile to get discovered by clients</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Set up your availability and session types</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Create your first training or nutrition plan</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span>Connect your Stripe account to receive payments</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link to="/dashboard/coach" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/dashboard/coach/settings" className="block">
            <Button variant="outline" className="w-full">
              Complete Profile Setup
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Need help getting started?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
