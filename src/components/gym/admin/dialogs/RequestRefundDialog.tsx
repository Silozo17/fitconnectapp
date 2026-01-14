import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useGymMembers } from "@/hooks/gym/useGymMembers";

const REASON_CATEGORIES = [
  { value: "duplicate_payment", label: "Duplicate Payment" },
  { value: "service_not_provided", label: "Service Not Provided" },
  { value: "membership_cancellation", label: "Membership Cancellation" },
  { value: "class_cancellation", label: "Class Cancellation" },
  { value: "billing_error", label: "Billing Error" },
  { value: "customer_request", label: "Customer Request" },
  { value: "other", label: "Other" },
];

const REQUEST_TYPES = [
  { value: "full_refund", label: "Full Refund" },
  { value: "partial_refund", label: "Partial Refund" },
  { value: "credit_adjustment", label: "Credit Adjustment" },
  { value: "membership_extension", label: "Membership Extension" },
];

const formSchema = z.object({
  member_id: z.string().min(1, "Please select a member"),
  request_type: z.string().min(1, "Please select a request type"),
  reason_category: z.string().min(1, "Please select a reason"),
  amount: z.coerce.number().min(0).optional(),
  description: z.string().min(10, "Please provide at least 10 characters of detail"),
  supporting_evidence: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RequestRefundDialogProps {
  children?: React.ReactNode;
}

export function RequestRefundDialog({ children }: RequestRefundDialogProps) {
  const [open, setOpen] = useState(false);
  const { gymId } = useParams<{ gymId: string }>();
  const { staffRecord } = useGym();
  const queryClient = useQueryClient();
  const { data: members } = useGymMembers({ status: "active" });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: "",
      request_type: "",
      reason_category: "",
      amount: undefined,
      description: "",
      supporting_evidence: "",
    },
  });

  const submitRequest = useMutation({
    mutationFn: async (data: FormData) => {
      if (!gymId || !staffRecord?.id) throw new Error("Missing context");

      const { error } = await supabase.from("gym_refund_requests").insert({
        gym_id: gymId,
        member_id: data.member_id,
        requested_by: staffRecord.id,
        request_type: data.request_type,
        reason_category: data.reason_category,
        amount: data.amount || null,
        reason: data.description,
        status: "pending",
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Refund request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["gym-refund-requests"] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to submit request", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    submitRequest.mutate(data);
  };

  const showAmountField = ["full_refund", "partial_refund", "credit_adjustment"].includes(
    form.watch("request_type")
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Request Refund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Refund Request</DialogTitle>
          <DialogDescription>
            Submit a refund or adjustment request for owner approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members?.members?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="request_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REQUEST_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REASON_CATEGORIES.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showAmountField && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the refund amount in pounds
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this request..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supporting_evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supporting Evidence (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reference payment IDs, dates, emails, etc."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitRequest.isPending}>
                {submitRequest.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
