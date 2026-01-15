import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGym } from "@/contexts/GymContext";
import { useMembershipPlans } from "@/hooks/gym/useGymMemberships";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, addMonths, addYears } from "date-fns";

const assignMembershipSchema = z.object({
  plan_id: z.string().min(1, "Please select a membership plan"),
  start_date: z.string().min(1, "Start date is required"),
  payment_method: z.enum(["cash", "stripe", "free"]),
  credits: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type AssignMembershipFormValues = z.infer<typeof assignMembershipSchema>;

interface AssignMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

export function AssignMembershipDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
}: AssignMembershipDialogProps) {
  const { gym } = useGym();
  const queryClient = useQueryClient();
  const { data: plans, isLoading: plansLoading } = useMembershipPlans();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignMembershipFormValues>({
    resolver: zodResolver(assignMembershipSchema),
    defaultValues: {
      plan_id: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      payment_method: "cash",
      credits: undefined,
      notes: "",
    },
  });

  const selectedPlanId = form.watch("plan_id");
  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  const calculateEndDate = (startDate: string, plan: typeof selectedPlan) => {
    if (!plan) return null;
    const start = new Date(startDate);
    
    if (plan.billing_interval === "monthly") {
      return addMonths(start, 1);
    } else if (plan.billing_interval === "yearly") {
      return addYears(start, 1);
    }
    return null;
  };

  const onSubmit = async (values: AssignMembershipFormValues) => {
    if (!gym?.id || !selectedPlan) {
      toast.error("Missing required data");
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(values.start_date);
      const endDate = calculateEndDate(values.start_date, selectedPlan);

      // If Stripe payment, generate checkout link
      if (values.payment_method === "stripe" && selectedPlan.price_amount > 0) {
        // First, get member details
        const { data: member, error: memberError } = await supabase
          .from("gym_members")
          .select("email, first_name, last_name, phone")
          .eq("id", memberId)
          .single();

        if (memberError || !member) {
          throw new Error("Could not find member details");
        }

        if (!member.email) {
          throw new Error("Member must have an email address for card payments");
        }

        // Call the checkout edge function
        const response = await supabase.functions.invoke("gym-create-membership-checkout", {
          body: {
            gymId: gym.id,
            planId: values.plan_id,
            memberData: {
              firstName: member.first_name || "",
              lastName: member.last_name || "",
              email: member.email,
              phone: member.phone || "",
              emergencyContactName: "",
              emergencyContactPhone: "",
            },
            contractIds: [],
            successUrl: `${window.location.origin}/gym/${gym.slug}/member/dashboard?membership_success=true`,
            cancelUrl: `${window.location.origin}/gym-admin/${gym.id}/members/${memberId}`,
            emailVerified: true, // Admin is assigning, so skip OTP
          },
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to create checkout session");
        }

        const data = response.data;
        if (data.url) {
          // Copy the URL to clipboard and show it to staff
          await navigator.clipboard.writeText(data.url);
          toast.success("Payment link copied to clipboard! Share with member to complete payment.", {
            duration: 5000,
          });
          onOpenChange(false);
          return;
        } else {
          throw new Error("No checkout URL returned");
        }
      }

      // For cash or free payments, create the membership directly
      const membershipData = {
        gym_id: gym.id,
        member_id: memberId,
        plan_id: values.plan_id,
        status: "active",
        current_period_start: startDate.toISOString(),
        current_period_end: endDate?.toISOString() || null,
        credits_remaining: values.credits ?? selectedPlan.class_credits ?? null,
        payment_status: values.payment_method === "free" ? "free" : "paid",
      };

      const { error: membershipError } = await supabase
        .from("gym_memberships")
        .insert([membershipData]);

      if (membershipError) throw membershipError;

      // If cash payment, create a payment record
      if (values.payment_method === "cash" && selectedPlan.price_amount > 0) {
        const paymentData = {
          gym_id: gym.id,
          member_id: memberId,
          amount: selectedPlan.price_amount,
          currency: selectedPlan.currency || "GBP",
          payment_method: "cash",
          payment_type: "membership",
          status: "completed",
          description: `${selectedPlan.name} - Cash payment`,
        };

        await supabase.from("gym_payments").insert([paymentData]);
      }

      queryClient.invalidateQueries({ queryKey: ["gym-member", memberId] });
      queryClient.invalidateQueries({ queryKey: ["gym-members"] });
      
      toast.success("Membership assigned successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Failed to assign membership:", error);
      toast.error(error instanceof Error ? error.message : "Failed to assign membership");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePlans = plans?.filter(p => p.is_active) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Membership</DialogTitle>
          <DialogDescription>
            Assign a membership plan to {memberName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Plan *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plansLoading ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Loading plans...
                        </div>
                      ) : activePlans.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No active plans available
                        </div>
                      ) : (
                        activePlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{plan.name}</span>
                              <span className="text-muted-foreground">
                                £{(plan.price_amount / 100).toFixed(2)}/{plan.billing_interval}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPlan && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p><strong>{selectedPlan.name}</strong></p>
                <p className="text-muted-foreground">{selectedPlan.description}</p>
                <p>Price: £{(selectedPlan.price_amount / 100).toFixed(2)} / {selectedPlan.billing_interval}</p>
                {selectedPlan.class_credits && (
                  <p>Credits: {selectedPlan.class_credits} per period</p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPlan?.class_credits && (
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Credits</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        placeholder={String(selectedPlan.class_credits)}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Default: {selectedPlan.class_credits} credits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="cash"
                          id="cash"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="cash"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Banknote className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">Cash</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="stripe"
                          id="stripe"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="stripe"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <CreditCard className="h-6 w-6 mb-2" />
                          <span className="text-sm font-medium">Card</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="free"
                          id="free"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="free"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="h-6 w-6 mb-2 flex items-center justify-center text-xl font-bold">£0</span>
                          <span className="text-sm font-medium">Free</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("payment_method") === "stripe" && (
              <p className="text-sm text-muted-foreground">
                A payment link will be generated and can be shared with the member.
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedPlan}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Membership
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
