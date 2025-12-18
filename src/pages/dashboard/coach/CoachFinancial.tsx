import { useState } from "react";
import { useCoachProfile, useCoachClients } from "@/hooks/useCoachClients";
import {
  useCoachInvoices,
  useCoachExpenses,
  useFinancialSummary,
  useUpdateInvoiceStatus,
  useDeleteInvoice,
  useDeleteExpense,
  EXPENSE_CATEGORIES,
  Invoice,
  Expense,
} from "@/hooks/useCoachFinancial";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FileText,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Send,
  Trash2,
  FileCheck,
  PieChart,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { CreateInvoiceModal } from "@/components/coach/CreateInvoiceModal";
import { CreateExpenseModal } from "@/components/coach/CreateExpenseModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const INVOICE_STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-500/10 text-blue-500", icon: Send },
  paid: { label: "Paid", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground line-through", icon: Trash2 },
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(142 76% 36%)", "hsl(221 83% 53%)", "hsl(262 83% 58%)", "hsl(24 95% 53%)", "hsl(173 80% 40%)"];

export default function CoachFinancial() {
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const coachId = coachProfile?.id;

  const { data: invoices, isLoading: invoicesLoading } = useCoachInvoices(coachId);
  const { data: expenses, isLoading: expensesLoading } = useCoachExpenses(coachId);
  const summary = useFinancialSummary(coachId);
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();
  const deleteExpense = useDeleteExpense();

  const [activeTab, setActiveTab] = useState("invoices");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "invoice" | "expense"; id: string } | null>(null);

  const isLoading = profileLoading || invoicesLoading || expensesLoading;

  // Calculate expense breakdown by category
  const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => {
    const total = expenses?.filter((e) => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0) || 0;
    return { name: cat.label, value: total / 100 };
  }).filter((item) => item.value > 0);

  // Calculate monthly income vs expenses for last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthInvoices = invoices?.filter((inv) => {
      const paidAt = inv.paid_at ? new Date(inv.paid_at) : null;
      return paidAt && paidAt >= monthStart && paidAt <= monthEnd && inv.status === "paid";
    }) || [];

    const monthExpenses = expenses?.filter((exp) => {
      const expDate = new Date(exp.expense_date);
      return expDate >= monthStart && expDate <= monthEnd;
    }) || [];

    const income = monthInvoices.reduce((sum, inv) => sum + inv.total, 0) / 100;
    const expenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 100;

    return {
      month: format(date, "MMM"),
      income,
      expenses: expenseTotal,
      profit: income - expenseTotal,
    };
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "invoice") {
      await deleteInvoice.mutateAsync(deleteTarget.id);
    } else {
      await deleteExpense.mutateAsync(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground">
              Manage invoices, track expenses, and view financial reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExpenseModal(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Total Paid</p>
                  <p className="text-xl font-bold truncate">{formatCurrency(summary.totalPaid / 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Outstanding</p>
                  <p className="text-xl font-bold truncate">{formatCurrency(summary.totalOutstanding / 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Expenses</p>
                  <p className="text-xl font-bold truncate">{formatCurrency(summary.totalExpenses / 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${summary.netProfit >= 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
                  {summary.netProfit >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Net Profit</p>
                  <p className={`text-xl font-bold truncate ${summary.netProfit >= 0 ? "text-green-500" : "text-destructive"}`}>
                    {formatCurrency(summary.netProfit / 100)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:block" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="h-4 w-4 hidden sm:block" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <PieChart className="h-4 w-4 hidden sm:block" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2">
              <FileCheck className="h-4 w-4 hidden sm:block" />
              Tax
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Manage your client invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {!invoices?.length ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No invoices yet</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => setShowInvoiceModal(true)}
                    >
                      Create your first invoice
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <InvoiceRow
                        key={invoice.id}
                        invoice={invoice}
                        onUpdateStatus={(status) =>
                          updateStatus.mutate({ invoiceId: invoice.id, status })
                        }
                        onDelete={() => setDeleteTarget({ type: "invoice", id: invoice.id })}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Track your business expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {!expenses?.length ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No expenses recorded</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => setShowExpenseModal(true)}
                    >
                      Add your first expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        onDelete={() => setDeleteTarget({ type: "expense", id: expense.id })}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Income vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Last 6 months overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `£${v}`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Bar dataKey="income" fill="hsl(142 76% 36%)" name="Income" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>By category</CardDescription>
                </CardHeader>
                <CardContent>
                  {expensesByCategory.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No expense data yet
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {expensesByCategory.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tax Tab */}
          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>Generate tax reports and summaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-2">Tax reporting coming soon</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    We're working on generating tax summaries, VAT reports, and annual statements to make your accounting easier.
                  </p>
                  <Button variant="outline" className="mt-4" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export Tax Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {coachId && (
        <>
          <CreateInvoiceModal
            open={showInvoiceModal}
            onOpenChange={setShowInvoiceModal}
            coachId={coachId}
          />
          <CreateExpenseModal
            open={showExpenseModal}
            onOpenChange={setShowExpenseModal}
            coachId={coachId}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deleteTarget?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function InvoiceRow({
  invoice,
  onUpdateStatus,
  onDelete,
}: {
  invoice: Invoice;
  onUpdateStatus: (status: Invoice["status"]) => void;
  onDelete: () => void;
}) {
  const config = INVOICE_STATUS_CONFIG[invoice.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="hidden sm:flex h-10 w-10 rounded-lg bg-primary/10 items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{invoice.invoice_number}</span>
            <Badge variant="secondary" className={config.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {invoice.client
              ? `${invoice.client.first_name} ${invoice.client.last_name}`
              : "No client assigned"}
            {invoice.due_date && ` • Due ${format(new Date(invoice.due_date), "MMM d, yyyy")}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold">{formatCurrency(invoice.total / 100)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {invoice.status === "draft" && (
              <DropdownMenuItem onClick={() => onUpdateStatus("sent")}>
                <Send className="h-4 w-4 mr-2" />
                Mark as Sent
              </DropdownMenuItem>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <DropdownMenuItem onClick={() => onUpdateStatus("paid")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            {invoice.status === "sent" && (
              <DropdownMenuItem onClick={() => onUpdateStatus("overdue")}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark as Overdue
              </DropdownMenuItem>
            )}
            {invoice.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => onUpdateStatus("cancelled")}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ExpenseRow({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: () => void;
}) {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="hidden sm:flex h-10 w-10 rounded-lg bg-destructive/10 items-center justify-center shrink-0">
          <Receipt className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{expense.description}</span>
            <Badge variant="secondary">{category?.label || expense.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(expense.expense_date), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-destructive">-{formatCurrency(expense.amount / 100)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
