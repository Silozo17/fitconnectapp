import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Info,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLocale } from "@/contexts/LocaleContext";
import { useCoachEarnings, useCoachProfile, useStripeExpressLogin } from "@/hooks/useCoachEarnings";
import { format } from "date-fns";
import { FeatureGate } from "@/components/FeatureGate";

type PeriodType = "week" | "month" | "quarter" | "year";

const CoachEarnings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("coach");
  const { formatCurrency } = useLocale();
  const [period, setPeriod] = useState<PeriodType>("month");
  
  const { data: coachProfile, isLoading: profileLoading } = useCoachProfile();
  const { transactions, stats, monthlyData, isLoading } = useCoachEarnings(coachProfile?.id || null, period);
  const stripeExpressLogin = useStripeExpressLogin();

  const hasStripeConnected = coachProfile?.stripe_connect_onboarded;
  const maxRevenue = Math.max(...monthlyData.map(d => d.netRevenue), 100);

  const handleConnectStripe = () => {
    navigate("/dashboard/coach/settings?tab=subscription");
  };

  const handleManageStripe = () => {
    stripeExpressLogin.mutate();
  };

  if (profileLoading || isLoading) {
    return (
      <DashboardLayout title={t("earnings.title")} description={t("earnings.pageDescription")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("earnings.title")} description={t("earnings.pageDescription")}>
      <FeatureGate feature="basic_analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("earnings.title")}</h1>
          <p className="text-muted-foreground">{t("earnings.pageSubtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("earnings.thisWeek")}</SelectItem>
              <SelectItem value="month">{t("earnings.thisMonth")}</SelectItem>
              <SelectItem value="quarter">{t("earnings.thisQuarter")}</SelectItem>
              <SelectItem value="year">{t("earnings.thisYear")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("earnings.export")}
          </Button>
        </div>
      </div>

      {/* Stripe Connect Notice */}
      {!hasStripeConnected && (
        <div className="card-elevated p-4 mb-6 border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("earnings.connectStripeNotice")}</p>
              <p className="text-sm text-muted-foreground">{t("earnings.connectStripeDescription")}</p>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleConnectStripe}>
              {t("earnings.connectStripe")}
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Net Revenue (Primary) */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-success" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    <span className="text-muted-foreground">{t("earnings.grossRevenue")}: </span>
                    <span className="font-medium">{formatCurrency(stats.grossRevenue)}</span>
                    <br />
                    <span className="text-muted-foreground">{t("earnings.platformFee", { rate: stats.commissionRate })}: </span>
                    <span className="font-medium">-{formatCurrency(stats.commissionPaid)}</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.netRevenue)}</p>
          <p className="text-sm text-muted-foreground">{t("earnings.netRevenue")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("earnings.afterPlatformFee", { rate: stats.commissionRate })}</p>
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
          <p className="text-sm text-muted-foreground">{t("earnings.sessionsCompleted")}</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.avgSession)}</p>
          <p className="text-sm text-muted-foreground">{t("earnings.avgNetPerSession")}</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(stats.pending)}</p>
          <p className="text-sm text-muted-foreground">{t("earnings.pendingNet")}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground">{t("earnings.revenueOverview")}</h3>
          <Badge variant="outline" className="text-xs">
            {t("earnings.netEarningsAfterFee", { rate: stats.commissionRate })}
          </Badge>
        </div>
        {transactions.length > 0 ? (
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/30 transition-colors relative group"
                  style={{ height: `${Math.max((data.netRevenue / maxRevenue) * 200, 4)}px` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all"
                    style={{ height: data.netRevenue > 0 ? "100%" : "0%" }}
                  />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                    <span className="text-success">{formatCurrency(data.netRevenue)}</span>
                    <span className="text-muted-foreground text-xs ml-1">net</span>
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
              <p>{t("earnings.revenueDataWillAppear")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="transactions">{t("earnings.tabs.transactions")}</TabsTrigger>
          <TabsTrigger value="payouts">{t("earnings.tabs.payouts")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("earnings.tabs.invoices")}</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">{t("earnings.recentTransactions")}</h3>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("earnings.filter")}
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className={`font-bold ${tx.status === 'refunded' ? 'text-destructive' : 'text-foreground'}`}>
                              {tx.status === 'refunded' ? '-' : '+'}{formatCurrency(tx.netAmount)}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              <span className="text-muted-foreground">{t("earnings.grossRevenue")}: </span>
                              <span>{formatCurrency(tx.amount)}</span>
                              <br />
                              <span className="text-muted-foreground">Fee: </span>
                              <span>-{formatCurrency(tx.commission)}</span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                <p className="text-muted-foreground">{t("earnings.noTransactions")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("earnings.transactionsWillAppear")}</p>
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
                  <h3 className="font-display font-bold text-foreground">{t("earnings.payoutHistory")}</h3>
                </div>
                {hasStripeConnected ? (
                  <div className="p-12 text-center">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t("earnings.noPayoutsYet")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("earnings.payoutsWillAppear")}</p>
                    <Button variant="outline" className="mt-4" onClick={handleManageStripe} disabled={stripeExpressLogin.isPending}>
                      {stripeExpressLogin.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      {t("earnings.viewInStripeDashboard")}
                    </Button>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-warning/50" />
                    <p className="text-muted-foreground">{t("earnings.connectStripeToReceive")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("earnings.connectStripePayoutsDesc")}</p>
                    <Button className="mt-4 bg-primary text-primary-foreground" onClick={handleConnectStripe}>
                      {t("earnings.connectStripe")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Payout Settings */}
            <div className="card-elevated p-6">
              <h3 className="font-display font-bold text-foreground mb-4">{t("earnings.payoutSettings")}</h3>
              {hasStripeConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("earnings.platformFee", { rate: "" }).replace("()", "")}</p>
                    <p className="font-medium text-foreground">{stats.commissionRate}% ({stats.tier} tier)</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("earnings.payoutSchedule")}</p>
                    <p className="font-medium text-foreground">{t("earnings.managedByStripe")}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("earnings.estimatedNetBalance")}</p>
                    <p className="font-medium text-foreground">{formatCurrency(stats.netRevenue - stats.pending)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("earnings.viewActualBalance")}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleManageStripe}
                    disabled={stripeExpressLogin.isPending}
                  >
                    {stripeExpressLogin.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    {t("earnings.manageInStripe")}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">{t("earnings.connectStripePayoutsDesc")}</p>
                  <Button className="w-full bg-primary text-primary-foreground" onClick={handleConnectStripe}>
                    {t("earnings.connectStripe")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">{t("invoices.allInvoices")}</h3>
              <Button className="bg-primary text-primary-foreground">
                {t("invoices.createInvoice")}
              </Button>
            </div>
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">{t("common:comingSoon")}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default CoachEarnings;