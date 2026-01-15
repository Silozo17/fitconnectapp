import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Loader2, MapPin, Building2, Crown } from "lucide-react";
import { useCreateMembershipPlan, useUpdateMembershipPlan, MembershipPlan } from "@/hooks/gym/useGymMemberships";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { useGym } from "@/contexts/GymContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  plan_type: z.enum(["recurring", "class_pack", "drop_in", "trial"]),
  price_amount: z.number().min(0, "Price must be positive"),
  currency: z.string().default("GBP"),
  billing_interval: z.enum(["week", "month", "year"]).optional().nullable(),
  billing_interval_count: z.number().min(1).default(1),
  setup_fee: z.number().min(0).default(0),
  class_credits: z.number().min(0).optional().nullable(),
  credits_expire_days: z.number().min(1).optional().nullable(),
  unlimited_classes: z.boolean().default(false),
  max_classes_per_week: z.number().min(1).optional().nullable(),
  max_classes_per_day: z.number().min(1).optional().nullable(),
  min_commitment_months: z.number().min(0).optional().nullable(),
  notice_period_days: z.number().min(0).default(0),
  cancellation_fee: z.number().min(0).optional().nullable(),
  trial_days: z.number().min(0).optional().nullable(),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  badge_text: z.string().optional().nullable(),
  badge_color: z.string().optional().nullable(),
  location_access_type: z.enum(["all", "selected", "single"]).default("all"),
  locations_access: z.array(z.string()).optional().nullable(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface MembershipPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan?: MembershipPlan | null;
}

export function MembershipPlanForm({
  open,
  onOpenChange,
  editPlan,
}: MembershipPlanFormProps) {
  const { gym } = useGym();
  const { data: locations } = useGymLocations();
  const createPlan = useCreateMembershipPlan();
  const updatePlan = useUpdateMembershipPlan();
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  // Determine location_access_type from existing data
  const getLocationAccessType = (locationsAccess: string[] | null | undefined): "all" | "selected" | "single" => {
    if (!locationsAccess || locationsAccess.length === 0 || locationsAccess.includes("*")) {
      return "all";
    }
    if (locationsAccess.length === 1) {
      return "single";
    }
    return "selected";
  };

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: editPlan
      ? {
          name: editPlan.name,
          description: editPlan.description || "",
          plan_type: editPlan.plan_type as PlanFormData["plan_type"],
          price_amount: editPlan.price_amount / 100, // Convert from cents
          currency: editPlan.currency,
          billing_interval: editPlan.billing_interval as PlanFormData["billing_interval"],
          billing_interval_count: editPlan.billing_interval_count,
          setup_fee: (editPlan.setup_fee || 0) / 100,
          class_credits: editPlan.class_credits,
          credits_expire_days: editPlan.credits_expire_days,
          unlimited_classes: editPlan.unlimited_classes,
          max_classes_per_week: editPlan.max_classes_per_week,
          max_classes_per_day: editPlan.max_classes_per_day,
          min_commitment_months: editPlan.min_commitment_months,
          notice_period_days: editPlan.notice_period_days,
          cancellation_fee: editPlan.cancellation_fee ? editPlan.cancellation_fee / 100 : null,
          trial_days: editPlan.trial_days,
          features: editPlan.features || [],
          is_active: editPlan.is_active,
          is_visible: editPlan.is_visible,
          is_featured: editPlan.is_featured,
          badge_text: editPlan.badge_text,
          badge_color: editPlan.badge_color,
          location_access_type: getLocationAccessType(editPlan.locations_access),
          locations_access: editPlan.locations_access?.filter(l => l !== "*") || [],
        }
      : {
          name: "",
          description: "",
          plan_type: "recurring",
          price_amount: 0,
          currency: gym?.currency || "GBP",
          billing_interval: "month",
          billing_interval_count: 1,
          setup_fee: 0,
          class_credits: null,
          credits_expire_days: null,
          unlimited_classes: true,
          max_classes_per_week: null,
          max_classes_per_day: null,
          min_commitment_months: null,
          notice_period_days: 30,
          cancellation_fee: null,
          trial_days: null,
          features: [],
          is_active: true,
          is_visible: true,
          is_featured: false,
          badge_text: null,
          badge_color: null,
          location_access_type: "all",
          locations_access: [],
        },
  });

  const watchPlanType = form.watch("plan_type");
  const watchUnlimited = form.watch("unlimited_classes");
  const features = form.watch("features");

  const addFeature = () => {
    if (newFeature.trim()) {
      form.setValue("features", [...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    form.setValue(
      "features",
      features.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      // Determine locations_access based on access type
      let locationsAccess: string[] | null = null;
      if (data.location_access_type === "all") {
        locationsAccess = null; // null means all locations
      } else if (data.location_access_type === "selected" || data.location_access_type === "single") {
        locationsAccess = data.locations_access || [];
      }

      // Convert amounts to cents
      const planData = {
        name: data.name,
        description: data.description,
        plan_type: data.plan_type,
        price_amount: Math.round(data.price_amount * 100),
        currency: data.currency,
        billing_interval: data.billing_interval,
        billing_interval_count: data.billing_interval_count,
        setup_fee: Math.round((data.setup_fee || 0) * 100),
        class_credits: data.class_credits,
        credits_expire_days: data.credits_expire_days,
        unlimited_classes: data.unlimited_classes,
        max_classes_per_week: data.max_classes_per_week,
        max_classes_per_day: data.max_classes_per_day,
        min_commitment_months: data.min_commitment_months,
        notice_period_days: data.notice_period_days,
        cancellation_fee: data.cancellation_fee
          ? Math.round(data.cancellation_fee * 100)
          : null,
        trial_days: data.trial_days,
        features: data.features,
        is_active: data.is_active,
        is_visible: data.is_visible,
        is_featured: data.is_featured,
        badge_text: data.badge_text,
        badge_color: data.badge_color,
        locations_access: locationsAccess,
      };

      let savedPlan: MembershipPlan;

      if (editPlan) {
        savedPlan = await updatePlan.mutateAsync({
          planId: editPlan.id,
          updates: planData,
        });
      } else {
        savedPlan = await createPlan.mutateAsync(planData);
      }

      // Sync with Stripe if gym has Stripe Connect
      if (gym?.stripe_account_id && gym?.stripe_onboarding_complete) {
        setIsSyncingStripe(true);
        try {
          const { data: stripeResult, error: stripeError } = await supabase.functions.invoke(
            "gym-sync-stripe-product",
            {
              body: {
                gymId: gym.id,
                planId: savedPlan.id,
              },
            }
          );

          if (stripeError) {
            console.error("Stripe sync error:", stripeError);
            toast.error("Plan saved, but Stripe sync failed. You can retry later.");
          } else {
            toast.success("Plan synced with Stripe");
          }
        } catch (err) {
          console.error("Stripe sync exception:", err);
        } finally {
          setIsSyncingStripe(false);
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  };

  const isSubmitting = createPlan.isPending || updatePlan.isPending || isSyncingStripe;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editPlan ? "Edit Plan" : "Create Membership Plan"}</SheetTitle>
          <SheetDescription>
            {editPlan
              ? "Update the details of this membership plan."
              : "Set up a new membership plan for your gym."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Monthly Unlimited" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what's included in this plan..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="recurring">Recurring Subscription</SelectItem>
                          <SelectItem value="class_pack">Class Pack</SelectItem>
                          <SelectItem value="drop_in">Drop-in</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {gym?.currency === "GBP" ? "£" : gym?.currency === "USD" ? "$" : "€"}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-7"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchPlanType === "recurring" && (
                    <FormField
                      control={form.control}
                      name="billing_interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Interval</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || "month"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="week">Weekly</SelectItem>
                              <SelectItem value="month">Monthly</SelectItem>
                              <SelectItem value="year">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="setup_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup/Joining Fee</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {gym?.currency === "GBP" ? "£" : gym?.currency === "USD" ? "$" : "€"}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-7"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>One-time fee charged at signup</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchPlanType === "recurring" && (
                  <FormField
                    control={form.control}
                    name="trial_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trial Period (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>Free trial before billing starts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Class Access */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Class Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="unlimited_classes"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Unlimited Classes</FormLabel>
                        <FormDescription>
                          Member can attend unlimited classes per billing period
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!watchUnlimited && (
                  <>
                    <FormField
                      control={form.control}
                      name="class_credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Credits</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseInt(e.target.value) : null)
                              }
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>Number of classes included</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchPlanType === "class_pack" && (
                      <FormField
                        control={form.control}
                        name="credits_expire_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credits Expire After (days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 90"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? parseInt(e.target.value) : null)
                                }
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {watchUnlimited && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="max_classes_per_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max/Week (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="No limit"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseInt(e.target.value) : null)
                              }
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_classes_per_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max/Day (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="No limit"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseInt(e.target.value) : null)
                              }
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Access */}
            {locations && locations.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location_access_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Which locations can members use?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer">
                              <RadioGroupItem value="all" id="all_locations" />
                              <div className="flex-1">
                                <label htmlFor="all_locations" className="flex items-center gap-2 font-medium cursor-pointer">
                                  <Crown className="h-4 w-4 text-amber-500" />
                                  All Locations (Platinum)
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Member can access any gym location
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer">
                              <RadioGroupItem value="selected" id="selected_locations" />
                              <div className="flex-1">
                                <label htmlFor="selected_locations" className="flex items-center gap-2 font-medium cursor-pointer">
                                  <Building2 className="h-4 w-4" />
                                  Selected Locations
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Member can access specific locations only
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer">
                              <RadioGroupItem value="single" id="single_location" />
                              <div className="flex-1">
                                <label htmlFor="single_location" className="flex items-center gap-2 font-medium cursor-pointer">
                                  <MapPin className="h-4 w-4" />
                                  Single Location
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Member can only access one location
                                </p>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(form.watch("location_access_type") === "selected" || 
                    form.watch("location_access_type") === "single") && (
                    <FormField
                      control={form.control}
                      name="locations_access"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch("location_access_type") === "single" 
                              ? "Select Location" 
                              : "Select Locations"}
                          </FormLabel>
                          <div className="space-y-2">
                            {locations?.map((location) => (
                              <div
                                key={location.id}
                                className="flex items-center space-x-3 rounded-lg border p-3"
                              >
                                <Checkbox
                                  id={location.id}
                                  checked={field.value?.includes(location.id) || false}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (form.watch("location_access_type") === "single") {
                                      // Single selection mode
                                      field.onChange(checked ? [location.id] : []);
                                    } else {
                                      // Multiple selection mode
                                      if (checked) {
                                        field.onChange([...currentValue, location.id]);
                                      } else {
                                        field.onChange(currentValue.filter(id => id !== location.id));
                                      }
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={location.id}
                                  className="flex-1 cursor-pointer"
                                >
                                  <span className="font-medium">{location.name}</span>
                                  {location.city && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {location.city}
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cancellation */}
            {watchPlanType === "recurring" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="min_commitment_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Commitment (months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="No minimum"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : null)
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notice_period_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Period (days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Days notice required to cancel</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cancellation_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Early Cancellation Fee</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {gym?.currency === "GBP" ? "£" : gym?.currency === "USD" ? "$" : "€"}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-7"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                              }
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Fee if cancelled before commitment ends
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Features List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visibility */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Display Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>Plan can be purchased by members</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visible on Website</FormLabel>
                        <FormDescription>Show on public pricing page</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Plan</FormLabel>
                        <FormDescription>Highlight as "Most Popular"</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="badge_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Best Value"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="badge_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Color</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="amber">Amber</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
