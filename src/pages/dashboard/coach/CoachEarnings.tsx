import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  PoundSterling,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { useCoachEarnings, useCoachProfile } from "@/hooks/useCoachEarnings";
import { format } from "date-fns";

const CoachEarnings = () => {
  const { formatCurrency } = useLocale();
  const [period, setPeriod] = useState("month");
  
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const { transactions, stats, monthlyData, isLoading } = useCoachEarnings(coachProfile?.id || null);

  const hasStripeConnected = coachProfile?.stripe_connect_onboarded;
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 100);

  if (profileLoading || isLoading) {
    return (
      <DashboardLayout title="Earnings" description="Track your revenue and manage payouts.">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Earnings" description="Track your revenue and manage payouts.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground">Track your revenue, transactions, and payouts</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stripe Connect Notice */}
      {!hasStripeConnected && (
        <div className="card-elevated p-4 mb-6 border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Connect Stripe to receive payments</p>
              <p className="text-sm text-muted-foreground">Set up your Stripe account to accept client payments and receive payouts.</p>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground">
              Connect Stripe
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-success" />
            </div>
            {stats.revenueChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${stats.revenueChange > 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.revenueChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.revenueChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.revenue)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            {stats.sessionsChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${stats.sessionsChange > 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.sessionsChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.sessionsChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.sessions}</p>
          <p className="text-sm text-muted-foreground">Sessions Completed</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.avgSession)}</p>
          <p className="text-sm text-muted-foreground">Avg. per Session</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.pending)}</p>
          <p className="text-sm text-muted-foreground">Pending Payments</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card-elevated p-6 mb-6">
        <h3 className="font-display font-bold text-foreground mb-4">Revenue Overview</h3>
        {transactions.length > 0 ? (
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/30 transition-colors relative group"
                  style={{ height: `${Math.max((data.revenue / maxRevenue) * 200, 4)}px` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all"
                    style={{ height: data.revenue > 0 ? "100%" : "0%" }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(data.revenue)}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PoundSterling className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Revenue data will appear here as you receive payments</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Recent Transactions</h3>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            {transactions.length > 0 ? (
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.status === 'completed' ? 'bg-success/10' : 
                        tx.status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                      }`}>
                        {tx.status === 'completed' ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : tx.status === 'pending' ? (
                          <Clock className="w-5 h-5 text-warning" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.client_name}</p>
                        <p className="text-sm text-muted-foreground">{tx.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.status === 'refunded' ? 'text-destructive' : 'text-foreground'}`}>
                        {tx.status === 'refunded' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</span>
                        <Badge
                          variant="outline"
                          className={
                            tx.status === 'completed' ? 'bg-success/10 text-success border-success/30' :
                            tx.status === 'pending' ? 'bg-warning/10 text-warning border-warning/30' :
                            'bg-destructive/10 text-destructive border-destructive/30'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Transactions will appear here when clients purchase your packages or subscriptions.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card-elevated">
                <div className="p-4 border-b border-border">
                  <h3 className="font-display font-bold text-foreground">Payout History</h3>
                </div>
                {hasStripeConnected ? (
                  <div className="p-12 text-center">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No payouts yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Payouts will appear here once you start receiving payments.</p>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-warning/50" />
                    <p className="text-muted-foreground">Connect Stripe to receive payouts</p>
                    <p className="text-sm text-muted-foreground mt-1">You need to connect your Stripe account to receive payouts from client payments.</p>
                    <Button className="mt-4 bg-primary text-primary-foreground">
                      Connect Stripe
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Payout Settings */}
            <div className="card-elevated p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Payout Settings</h3>
              {hasStripeConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Payout Schedule</p>
                    <p className="font-medium text-foreground">Managed by Stripe</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <p className="font-medium text-foreground">{formatCurrency(stats.revenue - stats.pending)}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage in Stripe
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">Connect Stripe to configure payout settings</p>
                  <Button className="w-full bg-primary text-primary-foreground">
                    Connect Stripe
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="card-elevated p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground mt-1">Invoice history will appear here as transactions are completed.</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CoachEarnings;
