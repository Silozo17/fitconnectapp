import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminView } from "@/contexts/AdminContext";
import { 
  Dumbbell, 
  UtensilsCrossed, 
  Package, 
  CreditCard, 
  Send, 
  Loader2,
  ChevronRight,
  X,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type PendingSend = {
  type: 'package' | 'subscription';
  item: CoachPackage | SubscriptionPlan;
} | null;

interface EditingPackage {
  original: CoachPackage;
  edited: {
    name: string;
    description: string;
    price: number;
    session_count: number;
    currency: string;
  };
}

interface EditingSubscription {
  original: SubscriptionPlan;
  edited: {
    name: string;
    description: string;
    price: number;
    billing_period: string;
    currency: string;
  };
}

const MessageSidePanel = ({ participantId, onSendMessage, onClose }: MessageSidePanelProps) => {
  const { activeProfileType } = useAdminView();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [assignedPlans, setAssignedPlans] = useState<TrainingPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState<boolean>(false);
  const [pendingSend, setPendingSend] = useState<PendingSend>(null);
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<EditingSubscription | null>(null);

  // Only show for coaches (including admins viewing as coach)
  if (activeProfileType !== "coach") return null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get coach profile ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coachProfile } = await supabase
        .from("coach_profiles")
        .select("id, stripe_connect_onboarded")
        .eq("user_id", user.id)
        .single();

      if (!coachProfile) {
        setLoading(false);
        return;
      }

      setCoachId(coachProfile.id);
      setStripeConnected(coachProfile.stripe_connect_onboarded || false);

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
    const message = `**Training Plan: ${plan.name}**\n\n${plan.description || "A customized training program designed for you."}\n\nDuration: ${plan.weeks} weeks\n\nThis plan has been assigned to you. Check your Plans section to view the full details!`;
    await onSendMessage(message);
    setSending(null);
  };

  const sendPackageMessage = async (pkg: CoachPackage, includeCheckout: boolean) => {
    setSending(`pkg-${pkg.id}`);
    
    let checkoutUrl: string | null = null;
    
    if (includeCheckout) {
      try {
        const origin = window.location.origin;
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: {
            type: 'package',
            itemId: pkg.id,
            clientId: participantId,
            coachId: coachId,
            successUrl: `${origin}/dashboard/client/packages?success=true`,
            cancelUrl: `${origin}/dashboard/client/messages`,
          }
        });
        if (!error && data?.url) {
          checkoutUrl = data.url;
        }
      } catch (e) {
        console.error('Error generating checkout URL:', e);
      }
    }
    
    let message = `**📦 Package: ${pkg.name}**\n\n${pkg.description || "A great value package for your fitness journey."}\n\n💰 Price: ${formatCurrency(pkg.price, (pkg.currency || "GBP") as CurrencyCode)}\n📋 Sessions: ${pkg.session_count}`;
    
    if (checkoutUrl) {
      message += `\n\n🛒 Ready to purchase? Click here:\n${checkoutUrl}`;
    } else {
      message += `\n\nInterested? Let me know and I can set this up for you!`;
    }
    
    await onSendMessage(message);
    setSending(null);
  };

  const sendSubscriptionMessage = async (plan: SubscriptionPlan, includeCheckout: boolean) => {
    setSending(`sub-${plan.id}`);
    
    let checkoutUrl: string | null = null;
    
    if (includeCheckout) {
      try {
        const origin = window.location.origin;
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: {
            type: 'subscription',
            itemId: plan.id,
            clientId: participantId,
            coachId: coachId,
            successUrl: `${origin}/dashboard/client/subscriptions?success=true`,
            cancelUrl: `${origin}/dashboard/client/messages`,
          }
        });
        if (!error && data?.url) {
          checkoutUrl = data.url;
        }
      } catch (e) {
        console.error('Error generating checkout URL:', e);
      }
    }
    
    let message = `**💳 Subscription Plan: ${plan.name}**\n\n${plan.description || "Ongoing coaching support to help you reach your goals."}\n\n💰 Price: ${formatCurrency(plan.price, (plan.currency || "GBP") as CurrencyCode)}/${plan.billing_period}\n\nThis includes regular coaching, plan updates, and support.`;
    
    if (checkoutUrl) {
      message += `\n\n🛒 Ready to subscribe? Click here:\n${checkoutUrl}`;
    } else {
      message += `\n\nLet me know if you'd like to subscribe!`;
    }
    
    await onSendMessage(message);
    setSending(null);
  };

  // Open edit dialog for package
  const handlePackageClick = (pkg: CoachPackage) => {
    setEditingPackage({
      original: pkg,
      edited: {
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price,
        session_count: pkg.session_count,
        currency: pkg.currency || 'GBP',
      }
    });
  };

  // Open edit dialog for subscription
  const handleSubscriptionClick = (plan: SubscriptionPlan) => {
    setEditingSubscription({
      original: plan,
      edited: {
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        billing_period: plan.billing_period,
        currency: plan.currency || 'GBP',
      }
    });
  };

  // Send edited package
  const handleSendEditedPackage = async () => {
    if (!editingPackage) return;
    
    const customPkg: CoachPackage = {
      ...editingPackage.original,
      name: editingPackage.edited.name,
      description: editingPackage.edited.description,
      price: editingPackage.edited.price,
      session_count: editingPackage.edited.session_count,
      currency: editingPackage.edited.currency,
    };
    
    // For custom pricing, always send without checkout (can't use original price_id)
    const isCustomPrice = editingPackage.edited.price !== editingPackage.original.price ||
                          editingPackage.edited.session_count !== editingPackage.original.session_count;
    
    if (!stripeConnected || isCustomPrice) {
      // Send without checkout URL
      setSending(`pkg-${customPkg.id}`);
      let message = `**📦 Package: ${customPkg.name}**\n\n${customPkg.description || "A great value package for your fitness journey."}\n\n💰 Price: ${formatCurrency(customPkg.price, (customPkg.currency || "GBP") as CurrencyCode)}\n📋 Sessions: ${customPkg.session_count}`;
      message += `\n\nInterested? Let me know and I can set this up for you!`;
      await onSendMessage(message);
      setSending(null);
    } else {
      await sendPackageMessage(customPkg, true);
    }
    
    setEditingPackage(null);
  };

  // Send edited subscription
  const handleSendEditedSubscription = async () => {
    if (!editingSubscription) return;
    
    const customPlan: SubscriptionPlan = {
      ...editingSubscription.original,
      name: editingSubscription.edited.name,
      description: editingSubscription.edited.description,
      price: editingSubscription.edited.price,
      billing_period: editingSubscription.edited.billing_period,
      currency: editingSubscription.edited.currency,
    };
    
    // For custom pricing, always send without checkout
    const isCustomPrice = editingSubscription.edited.price !== editingSubscription.original.price ||
                          editingSubscription.edited.billing_period !== editingSubscription.original.billing_period;
    
    if (!stripeConnected || isCustomPrice) {
      setSending(`sub-${customPlan.id}`);
      let message = `**💳 Subscription Plan: ${customPlan.name}**\n\n${customPlan.description || "Ongoing coaching support to help you reach your goals."}\n\n💰 Price: ${formatCurrency(customPlan.price, (customPlan.currency || "GBP") as CurrencyCode)}/${customPlan.billing_period}\n\nThis includes regular coaching, plan updates, and support.`;
      message += `\n\nLet me know if you'd like to subscribe!`;
      await onSendMessage(message);
      setSending(null);
    } else {
      await sendSubscriptionMessage(customPlan, true);
    }
    
    setEditingSubscription(null);
  };

  const handleConfirmSendWithoutStripe = async () => {
    if (!pendingSend) return;
    
    if (pendingSend.type === 'package') {
      await sendPackageMessage(pendingSend.item as CoachPackage, false);
    } else {
      await sendSubscriptionMessage(pendingSend.item as SubscriptionPlan, false);
    }
    
    setPendingSend(null);
  };

  if (loading) {
    return (
      <div className="w-72 border-l border-border bg-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
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
                      className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handlePackageClick(pkg)}
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
                          disabled={sending === `pkg-${pkg.id}`}
                        >
                          {sending === `pkg-${pkg.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Pencil className="h-3 w-3" />
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
                      className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handleSubscriptionClick(plan)}
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
                          disabled={sending === `sub-${plan.id}`}
                        >
                          {sending === `sub-${plan.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Pencil className="h-3 w-3" />
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

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Package</DialogTitle>
            <DialogDescription>
              Edit the details before sending. This won't modify your original package.
            </DialogDescription>
          </DialogHeader>
          
          {editingPackage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pkg-name">Package Name</Label>
                <Input 
                  id="pkg-name"
                  value={editingPackage.edited.name} 
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, edited: {...prev.edited, name: e.target.value}} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="pkg-desc">Description</Label>
                <Textarea 
                  id="pkg-desc"
                  value={editingPackage.edited.description}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, edited: {...prev.edited, description: e.target.value}} : null)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pkg-price">Price (£)</Label>
                  <Input 
                    id="pkg-price"
                    type="number" 
                    min="0"
                    step="0.01"
                    value={editingPackage.edited.price}
                    onChange={(e) => setEditingPackage(prev => prev ? {...prev, edited: {...prev.edited, price: parseFloat(e.target.value) || 0}} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="pkg-sessions">Sessions</Label>
                  <Input 
                    id="pkg-sessions"
                    type="number"
                    min="1"
                    value={editingPackage.edited.session_count}
                    onChange={(e) => setEditingPackage(prev => prev ? {...prev, edited: {...prev.edited, session_count: parseInt(e.target.value) || 1}} : null)}
                  />
                </div>
              </div>

              {(editingPackage.edited.price !== editingPackage.original.price || 
                editingPackage.edited.session_count !== editingPackage.original.session_count) && (
                <p className="text-xs text-muted-foreground">
                  Custom pricing will be sent without a payment button.
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPackage(null)}>Cancel</Button>
            <Button onClick={handleSendEditedPackage} disabled={!!sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send to Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Subscription</DialogTitle>
            <DialogDescription>
              Edit the details before sending. This won't modify your original plan.
            </DialogDescription>
          </DialogHeader>
          
          {editingSubscription && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="sub-name">Plan Name</Label>
                <Input 
                  id="sub-name"
                  value={editingSubscription.edited.name} 
                  onChange={(e) => setEditingSubscription(prev => prev ? {...prev, edited: {...prev.edited, name: e.target.value}} : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="sub-desc">Description</Label>
                <Textarea 
                  id="sub-desc"
                  value={editingSubscription.edited.description}
                  onChange={(e) => setEditingSubscription(prev => prev ? {...prev, edited: {...prev.edited, description: e.target.value}} : null)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sub-price">Price (£)</Label>
                  <Input 
                    id="sub-price"
                    type="number" 
                    min="0"
                    step="0.01"
                    value={editingSubscription.edited.price}
                    onChange={(e) => setEditingSubscription(prev => prev ? {...prev, edited: {...prev.edited, price: parseFloat(e.target.value) || 0}} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="sub-period">Billing Period</Label>
                  <Select
                    value={editingSubscription.edited.billing_period}
                    onValueChange={(value) => setEditingSubscription(prev => prev ? {...prev, edited: {...prev.edited, billing_period: value}} : null)}
                  >
                    <SelectTrigger id="sub-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(editingSubscription.edited.price !== editingSubscription.original.price || 
                editingSubscription.edited.billing_period !== editingSubscription.original.billing_period) && (
                <p className="text-xs text-muted-foreground">
                  Custom pricing will be sent without a payment button.
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubscription(null)}>Cancel</Button>
            <Button onClick={handleSendEditedSubscription} disabled={!!sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send to Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Not Connected Confirmation Dialog */}
      <AlertDialog open={!!pendingSend} onOpenChange={(open) => !open && setPendingSend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stripe Not Connected</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't connected your Stripe account yet. Would you like to send this {pendingSend?.type} without a payment button?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSendWithoutStripe}>
              Yes, Send Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageSidePanel;
