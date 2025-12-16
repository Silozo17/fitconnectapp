import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Package, 
  CreditCard, 
  Send, 
  Loader2,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, CurrencyCode } from "@/lib/currency";

interface MessageSidePanelProps {
  participantId: string;
  onSendMessage: (message: string) => Promise<boolean>;
  onClose?: () => void;
}

interface TrainingPlan {
  id: string;
  name: string;
  description: string | null;
  weeks: number;
}

interface NutritionPlan {
  id: string;
  name: string;
  daily_calories: number | null;
}

interface CoachPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  session_count: number;
  currency: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_period: string;
  currency: string;
}

const MessageSidePanel = ({ participantId, onSendMessage, onClose }: MessageSidePanelProps) => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [assignedPlans, setAssignedPlans] = useState<TrainingPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);

  // Only show for coaches
  if (role !== "coach") return null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get coach profile ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) {
        setLoading(false);
        return;
      }

      setCoachId(coachProfile.id);

      // Fetch all data in parallel
      const [plansRes, packagesRes, subscriptionsRes] = await Promise.all([
        // Fetch assigned training plans for this client
        supabase
          .from("plan_assignments")
          .select(`
            plan_id,
            training_plans!inner (
              id,
              name,
              description,
              weeks
            )
          `)
          .eq("client_id", participantId)
          .eq("coach_id", coachProfile.id)
          .eq("status", "active"),
        
        // Fetch coach's packages
        supabase
          .from("coach_packages")
          .select("*")
          .eq("coach_id", coachProfile.id)
          .eq("is_active", true),
        
        // Fetch coach's subscription plans
        supabase
          .from("coach_subscription_plans")
          .select("*")
          .eq("coach_id", coachProfile.id)
          .eq("is_active", true),
      ]);

      // Process training plans
      if (plansRes.data) {
        const plans = plansRes.data
          .map((item: any) => item.training_plans)
          .filter(Boolean);
        setAssignedPlans(plans);
      }

      // Set packages and subscriptions
      if (packagesRes.data) setPackages(packagesRes.data);
      if (subscriptionsRes.data) setSubscriptionPlans(subscriptionsRes.data);

      setLoading(false);
    };

    fetchData();
  }, [participantId]);

  const handleSendTrainingPlan = async (plan: TrainingPlan) => {
    setSending(`plan-${plan.id}`);
    const message = `📋 **Training Plan: ${plan.name}**\n\n${plan.description || "A customized training program designed for you."}\n\n⏱️ Duration: ${plan.weeks} weeks\n\nThis plan has been assigned to you. Check your Plans section to view the full details!`;
    await onSendMessage(message);
    setSending(null);
  };

  const handleSendPackage = async (pkg: CoachPackage) => {
    setSending(`pkg-${pkg.id}`);
    const message = `📦 **Package: ${pkg.name}**\n\n${pkg.description || "A great value package for your fitness journey."}\n\n💰 Price: ${formatCurrency(pkg.price, (pkg.currency || "GBP") as CurrencyCode)}\n📍 Sessions: ${pkg.session_count}\n\nInterested? Let me know and I can set this up for you!`;
    await onSendMessage(message);
    setSending(null);
  };

  const handleSendSubscription = async (plan: SubscriptionPlan) => {
    setSending(`sub-${plan.id}`);
    const message = `💳 **Subscription Plan: ${plan.name}**\n\n${plan.description || "Ongoing coaching support to help you reach your goals."}\n\n💰 Price: ${formatCurrency(plan.price, (plan.currency || "GBP") as CurrencyCode)}/${plan.billing_period}\n\nThis includes regular coaching, plan updates, and support. Let me know if you'd like to subscribe!`;
    await onSendMessage(message);
    setSending(null);
  };

  if (loading) {
    return (
      <div className="w-72 border-l border-border bg-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Quick Send</h3>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Assigned Training Plans */}
          {assignedPlans.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Assigned Plans
                </span>
              </div>
              <div className="space-y-2">
                {assignedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.weeks} weeks</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => handleSendTrainingPlan(plan)}
                        disabled={sending === `plan-${plan.id}`}
                      >
                        {sending === `plan-${plan.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {packages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Packages
                </span>
              </div>
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{pkg.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {pkg.session_count} sessions
                          </Badge>
                          <span className="text-xs text-primary font-medium">
                            {formatCurrency(pkg.price, (pkg.currency || "GBP") as CurrencyCode)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => handleSendPackage(pkg)}
                        disabled={sending === `pkg-${pkg.id}`}
                      >
                        {sending === `pkg-${pkg.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          {subscriptionPlans.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Subscriptions
                </span>
              </div>
              <div className="space-y-2">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{plan.name}</p>
                        <span className="text-xs text-primary font-medium">
                          {formatCurrency(plan.price, (plan.currency || "GBP") as CurrencyCode)}/{plan.billing_period}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => handleSendSubscription(plan)}
                        disabled={sending === `sub-${plan.id}`}
                      >
                        {sending === `sub-${plan.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {assignedPlans.length === 0 && packages.length === 0 && subscriptionPlans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No plans or packages to send yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create packages in your Packages page.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageSidePanel;
