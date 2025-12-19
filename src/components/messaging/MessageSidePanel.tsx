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
  X,
  Pencil,
  ChevronDown,
  Zap,
  FileText,
  DollarSign,
  Calendar,
  CalendarPlus,
  ShoppingBag
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSessionTypes } from "@/hooks/useCoachSchedule";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { useTrainingPlans } from "@/hooks/useTrainingPlans";
import { useCoachProducts } from "@/hooks/useDigitalProducts";
import SessionOfferDialog from "./SessionOfferDialog";

interface MessageSidePanelProps {
  participantId: string;
  clientId?: string;
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

const MessageSidePanel = ({ participantId, clientId, onSendMessage, onClose }: MessageSidePanelProps) => {
  const { activeProfileType } = useAdminView();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [assignedPlans, setAssignedPlans] = useState<TrainingPlan[]>([]);
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState<boolean>(false);
  const [pendingSend, setPendingSend] = useState<PendingSend>(null);
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<EditingSubscription | null>(null);
  
  // Quick Actions state
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSessionOfferDialog, setShowSessionOfferDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  
  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    quickActions: true,
    digitalProducts: true,
    workoutPlans: true,
    mealPlans: true,
    assignedPlans: true,
    packages: true,
    subscriptions: true,
  });

  // Hooks for data
  const { data: sessionTypes = [] } = useSessionTypes(coachId || "");
  const { templates, loading: templatesLoading } = useMessageTemplates();
  const { data: trainingPlans = [], isLoading: plansLoading } = useTrainingPlans(coachId || undefined);
  const { data: digitalProducts = [], isLoading: productsLoading } = useCoachProducts();

  // Filter plans by type
  const workoutPlans = trainingPlans.filter(plan => plan.plan_type === 'workout' || plan.plan_type === 'training');
  const mealPlans = trainingPlans.filter(plan => plan.plan_type === 'nutrition' || plan.plan_type === 'meal');

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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Quick Actions handlers
  const handleSendPricing = async () => {
    setSending("pricing");
    
    let pricingMessage = "**My Session Pricing:**\n\n";
    
    if (sessionTypes.length > 0) {
      sessionTypes.forEach(type => {
        pricingMessage += `• **${type.name}** - ${type.duration_minutes} min - £${type.price}\n`;
        if (type.description) {
          pricingMessage += `  _${type.description}_\n`;
        }
      });
    } else {
      pricingMessage += "Please contact me to discuss pricing for your specific needs.";
    }

    await onSendMessage(pricingMessage);
    setSending(null);
    setShowPricingDialog(false);
  };

  const handleSendBookingLink = async () => {
    setSending("booking");
    const bookingMessage = `**Ready to book a session?**\n\nClick my profile to view my availability and book a time that works for you!`;
    await onSendMessage(bookingMessage);
    setSending(null);
  };

  const handleSendPaymentRequest = async () => {
    if (!paymentAmount) return;
    
    setSending("payment");
    const paymentMessage = `**Payment Request**\n\nAmount: £${paymentAmount}\n${paymentDescription ? `For: ${paymentDescription}\n` : ""}\n_Payment processing coming soon. For now, please arrange payment directly._`;
    await onSendMessage(paymentMessage);
    setSending(null);
    setShowPaymentDialog(false);
    setPaymentAmount("");
    setPaymentDescription("");
  };

  const handleUseTemplate = async (content: string) => {
    setSending("template");
    await onSendMessage(content);
    setSending(null);
  };

  // Digital Products handler
  const handleSendDigitalProduct = async (product: any) => {
    setSending(`product-${product.id}`);
    let message = `**📚 ${product.title}**\n\n${product.description || "Check out this content I've created for you."}\n\n💰 Price: ${formatCurrency(product.price || 0, (product.currency || "GBP") as CurrencyCode)}`;
    
    if (product.content_type) {
      message += `\n📁 Type: ${product.content_type}`;
    }
    
    message += `\n\nInterested? Let me know and I'll send you the link!`;
    
    await onSendMessage(message);
    setSending(null);
  };

  // Training/Meal Plans handlers
  const handleSendPlan = async (plan: any) => {
    setSending(`plan-${plan.id}`);
    const planType = plan.plan_type === 'nutrition' || plan.plan_type === 'meal' ? 'Meal Plan' : 'Workout Plan';
    const icon = plan.plan_type === 'nutrition' || plan.plan_type === 'meal' ? '🥗' : '🏋️';
    
    let message = `**${icon} ${planType}: ${plan.name}**\n\n${plan.description || "A customized plan designed for your goals."}`;
    
    if (plan.duration_weeks) {
      message += `\n\n📅 Duration: ${plan.duration_weeks} weeks`;
    }
    
    message += `\n\nLet me know if you'd like me to assign this to you!`;
    
    await onSendMessage(message);
    setSending(null);
  };

  const handleSendAssignedPlan = async (plan: TrainingPlan) => {
    setSending(`assigned-${plan.id}`);
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

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  if (loading) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const SectionHeader = ({ 
    icon: Icon, 
    title, 
    count, 
    isOpen, 
    onToggle,
    iconColor = "text-primary"
  }: { 
    icon: any; 
    title: string; 
    count?: number; 
    isOpen: boolean; 
    onToggle: () => void;
    iconColor?: string;
  }) => (
    <CollapsibleTrigger 
      onClick={onToggle}
      className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded-md transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {count !== undefined && count > 0 && (
          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
            {count}
          </Badge>
        )}
      </div>
      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </CollapsibleTrigger>
  );

  return (
    <>
      <div className="w-80 border-l border-border bg-card flex flex-col h-full">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Quick Send</h3>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            
            {/* Quick Actions Section */}
            <Collapsible open={openSections.quickActions}>
              <SectionHeader 
                icon={Zap} 
                title="Quick Actions" 
                isOpen={openSections.quickActions} 
                onToggle={() => toggleSection('quickActions')}
                iconColor="text-amber-500"
              />
              <CollapsibleContent className="space-y-2 mt-2">
                {/* Templates */}
                {templates.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground px-1">Templates</p>
                    {templates.slice(0, 3).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template.content)}
                        disabled={sending === "template"}
                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors border border-border"
                      >
                        <p className="text-xs font-medium text-foreground truncate">{template.name}</p>
                      </button>
                    ))}
                    {templates.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{templates.length - 3} more templates
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs flex-col gap-0.5"
                    onClick={() => setShowPricingDialog(true)}
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Pricing</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs flex-col gap-0.5"
                    onClick={handleSendBookingLink}
                    disabled={sending === "booking"}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book</span>
                  </Button>

                  {clientId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 text-xs flex-col gap-0.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setShowSessionOfferDialog(true)}
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>Offer</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs flex-col gap-0.5"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Payment</span>
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Digital Products Section */}
            {digitalProducts.length > 0 && (
              <Collapsible open={openSections.digitalProducts}>
                <SectionHeader 
                  icon={ShoppingBag} 
                  title="Digital Products" 
                  count={digitalProducts.length}
                  isOpen={openSections.digitalProducts} 
                  onToggle={() => toggleSection('digitalProducts')}
                  iconColor="text-purple-500"
                />
                <CollapsibleContent className="space-y-2 mt-2">
                  {digitalProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {product.content_type || 'Content'}
                            </Badge>
                            <span className="text-xs text-primary font-medium">
                              {formatCurrency(product.price || 0, (product.currency || "GBP") as CurrencyCode)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => handleSendDigitalProduct(product)}
                          disabled={sending === `product-${product.id}`}
                        >
                          {sending === `product-${product.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Workout Plans Section */}
            {workoutPlans.length > 0 && (
              <Collapsible open={openSections.workoutPlans}>
                <SectionHeader 
                  icon={Dumbbell} 
                  title="Workout Plans" 
                  count={workoutPlans.length}
                  isOpen={openSections.workoutPlans} 
                  onToggle={() => toggleSection('workoutPlans')}
                  iconColor="text-blue-500"
                />
                <CollapsibleContent className="space-y-2 mt-2">
                  {workoutPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{plan.name}</p>
                          {plan.duration_weeks && (
                            <p className="text-xs text-muted-foreground">{plan.duration_weeks} weeks</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => handleSendPlan(plan)}
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Meal Plans Section */}
            {mealPlans.length > 0 && (
              <Collapsible open={openSections.mealPlans}>
                <SectionHeader 
                  icon={UtensilsCrossed} 
                  title="Meal Plans" 
                  count={mealPlans.length}
                  isOpen={openSections.mealPlans} 
                  onToggle={() => toggleSection('mealPlans')}
                  iconColor="text-green-500"
                />
                <CollapsibleContent className="space-y-2 mt-2">
                  {mealPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{plan.name}</p>
                          {plan.duration_weeks && (
                            <p className="text-xs text-muted-foreground">{plan.duration_weeks} weeks</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => handleSendPlan(plan)}
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Assigned Plans Section */}
            {assignedPlans.length > 0 && (
              <Collapsible open={openSections.assignedPlans}>
                <SectionHeader 
                  icon={Dumbbell} 
                  title="Assigned to Client" 
                  count={assignedPlans.length}
                  isOpen={openSections.assignedPlans} 
                  onToggle={() => toggleSection('assignedPlans')}
                />
                <CollapsibleContent className="space-y-2 mt-2">
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
                          onClick={() => handleSendAssignedPlan(plan)}
                          disabled={sending === `assigned-${plan.id}`}
                        >
                          {sending === `assigned-${plan.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Packages */}
            {packages.length > 0 && (
              <Collapsible open={openSections.packages}>
                <SectionHeader 
                  icon={Package} 
                  title="Packages" 
                  count={packages.length}
                  isOpen={openSections.packages} 
                  onToggle={() => toggleSection('packages')}
                  iconColor="text-orange-500"
                />
                <CollapsibleContent className="space-y-2 mt-2">
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Subscription Plans */}
            {subscriptionPlans.length > 0 && (
              <Collapsible open={openSections.subscriptions}>
                <SectionHeader 
                  icon={CreditCard} 
                  title="Subscriptions" 
                  count={subscriptionPlans.length}
                  isOpen={openSections.subscriptions} 
                  onToggle={() => toggleSection('subscriptions')}
                  iconColor="text-emerald-500"
                />
                <CollapsibleContent className="space-y-2 mt-2">
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
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Empty State */}
            {assignedPlans.length === 0 && packages.length === 0 && subscriptionPlans.length === 0 && 
             digitalProducts.length === 0 && workoutPlans.length === 0 && mealPlans.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No content to send yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create plans, packages, or products to send to clients.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Pricing Preview Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Pricing Information</DialogTitle>
            <DialogDescription>
              This will send your session types and pricing to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {sessionTypes.length > 0 ? (
              <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                {sessionTypes.map(type => (
                  <div key={type.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.duration_minutes} minutes</p>
                    </div>
                    <p className="font-bold text-primary">£{type.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No session types configured yet. Go to Schedule → Session Types to add your offerings.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPricingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPricing} disabled={sending === "pricing" || sessionTypes.length === 0}>
              {sending === "pricing" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Pricing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Request Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payment</DialogTitle>
            <DialogDescription>
              Send a payment request to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Personal Training Session - December 15"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPaymentRequest} disabled={sending === "payment" || !paymentAmount}>
              {sending === "payment" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Offer Dialog */}
      {clientId && coachId && (
        <SessionOfferDialog
          open={showSessionOfferDialog}
          onOpenChange={setShowSessionOfferDialog}
          coachId={coachId}
          clientId={clientId}
          onOfferCreated={async (offerId, offerDetails) => {
            await onSendMessage(offerDetails);
          }}
        />
      )}

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
