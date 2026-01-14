import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Search, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_date: string;
  stripe_payment_intent_id: string | null;
  payment_method: string | null;
  failure_reason: string | null;
  retry_count: number;
  last_retry_at: string | null;
  next_retry_at: string | null;
  member?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export default function GymAdminPayments() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const queryClient = useQueryClient();
  const client = supabase as any;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);

  // Fetch payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ["gym-payments", gymId],
    queryFn: async () => {
      const { data, error } = await client
        .from("gym_payments")
        .select(`
          *,
          member:gym_members(first_name, last_name, email)
        `)
        .eq("gym_id", gymId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!gymId,
  });

  // Retry payment mutation
  const retryPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await client.functions.invoke("gym-retry-payment", {
        body: { paymentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Payment retry initiated");
      queryClient.invalidateQueries({ queryKey: ["gym-payments"] });
      setRetryDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to retry payment");
    },
  });

  // Filter payments
  const filteredPayments = payments?.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const memberName = `${payment.member?.first_name || ""} ${payment.member?.last_name || ""}`.toLowerCase();
    const memberEmail = payment.member?.email?.toLowerCase() || "";
    return (
      memberName.includes(search) ||
      memberEmail.includes(search) ||
      payment.id.toLowerCase().includes(search)
    );
  });

  // Get status counts
  const statusCounts = {
    all: payments?.length || 0,
    completed: payments?.filter((p) => p.status === "completed").length || 0,
    pending: payments?.filter((p) => p.status === "pending").length || 0,
    failed: payments?.filter((p) => p.status === "failed").length || 0,
    refunded: payments?.filter((p) => p.status === "refunded").length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="secondary">
            <RefreshCw className="mr-1 h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = "gbp") => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const PaymentsTable = ({ payments }: { payments: Payment[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No payments found
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {format(new Date(payment.payment_date), "dd MMM yyyy")}
                <br />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(payment.payment_date), "HH:mm")}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  {payment.member?.first_name} {payment.member?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {payment.member?.email}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(payment.amount, payment.currency)}
              </TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell className="capitalize">
                {payment.payment_method || "—"}
              </TableCell>
              <TableCell>
                {payment.status === "failed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setRetryDialogOpen(true);
                    }}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Retry
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            View and manage member payments and subscriptions.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payments</CardDescription>
            <CardTitle className="text-2xl">{statusCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{statusCounts.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{statusCounts.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{statusCounts.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Failed Payments Alert */}
      {statusCounts.failed > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Failed Payments Require Attention</CardTitle>
            </div>
            <CardDescription>
              {statusCounts.failed} payment(s) have failed and may need manual intervention or retry.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by member name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="failed">Failed ({statusCounts.failed})</TabsTrigger>
              </TabsList>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="m-0">
                  <PaymentsTable payments={filteredPayments || []} />
                </TabsContent>
                <TabsContent value="completed" className="m-0">
                  <PaymentsTable
                    payments={filteredPayments?.filter((p) => p.status === "completed") || []}
                  />
                </TabsContent>
                <TabsContent value="pending" className="m-0">
                  <PaymentsTable
                    payments={filteredPayments?.filter((p) => p.status === "pending") || []}
                  />
                </TabsContent>
                <TabsContent value="failed" className="m-0">
                  <PaymentsTable
                    payments={filteredPayments?.filter((p) => p.status === "failed") || []}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Retry Payment Dialog */}
      <Dialog open={retryDialogOpen} onOpenChange={setRetryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry Failed Payment</DialogTitle>
            <DialogDescription>
              This will attempt to charge the member's saved payment method again.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member</span>
                  <span>
                    {selectedPayment.member?.first_name} {selectedPayment.member?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed on</span>
                  <span>{format(new Date(selectedPayment.payment_date), "dd MMM yyyy")}</span>
                </div>
                {selectedPayment.failure_reason && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="text-destructive">{selectedPayment.failure_reason}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retry attempts</span>
                  <span>{selectedPayment.retry_count}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRetryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedPayment && retryPayment.mutate(selectedPayment.id)}
              disabled={retryPayment.isPending}
            >
              {retryPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Retry Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
