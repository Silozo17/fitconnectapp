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

// Mock data
const monthlyStats = {
  revenue: 2450,
  revenueChange: 8.5,
  sessions: 32,
  sessionsChange: 12,
  avgSession: 76.56,
  pending: 375,
};

const transactions = [
  { id: "1", client: "John Smith", type: "Personal Training", amount: 75, date: "Dec 10, 2024", status: "completed" },
  { id: "2", client: "Sarah Johnson", type: "Nutrition Plan", amount: 150, date: "Dec 9, 2024", status: "completed" },
  { id: "3", client: "Mike Davis", type: "Boxing Session", amount: 60, date: "Dec 8, 2024", status: "completed" },
  { id: "4", client: "Emma Wilson", type: "Personal Training", amount: 75, date: "Dec 7, 2024", status: "pending" },
  { id: "5", client: "David Brown", type: "MMA Training", amount: 80, date: "Dec 6, 2024", status: "completed" },
  { id: "6", client: "Lisa Anderson", type: "Personal Training", amount: 75, date: "Dec 5, 2024", status: "completed" },
  { id: "7", client: "James Wilson", type: "Group Session", amount: 45, date: "Dec 4, 2024", status: "refunded" },
];

const payouts = [
  { id: "p1", amount: 1850, date: "Dec 1, 2024", status: "completed", method: "Bank Transfer" },
  { id: "p2", amount: 2100, date: "Nov 1, 2024", status: "completed", method: "Bank Transfer" },
  { id: "p3", amount: 1950, date: "Oct 1, 2024", status: "completed", method: "Bank Transfer" },
];

const monthlyData = [
  { month: "Jul", revenue: 1800 },
  { month: "Aug", revenue: 2100 },
  { month: "Sep", revenue: 1950 },
  { month: "Oct", revenue: 2300 },
  { month: "Nov", revenue: 2250 },
  { month: "Dec", revenue: 2450 },
];

const CoachEarnings = () => {
  const { formatCurrency } = useLocale();
  const [period, setPeriod] = useState("month");

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-success" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${monthlyStats.revenueChange > 0 ? 'text-success' : 'text-destructive'}`}>
              {monthlyStats.revenueChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(monthlyStats.revenueChange)}%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(monthlyStats.revenue)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${monthlyStats.sessionsChange > 0 ? 'text-success' : 'text-destructive'}`}>
              {monthlyStats.sessionsChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(monthlyStats.sessionsChange)}%
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{monthlyStats.sessions}</p>
          <p className="text-sm text-muted-foreground">Sessions Completed</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <PoundSterling className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(monthlyStats.avgSession)}</p>
          <p className="text-sm text-muted-foreground">Avg. per Session</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(monthlyStats.pending)}</p>
          <p className="text-sm text-muted-foreground">Pending Payments</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="card-elevated p-6 mb-6">
        <h3 className="font-display font-bold text-foreground mb-4">Revenue Overview</h3>
        <div className="h-64 flex items-end justify-between gap-4 px-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary/20 rounded-t-lg hover:bg-primary/30 transition-colors relative group"
                style={{ height: `${(data.revenue / 2500) * 200}px` }}
              >
                <div
                  className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all"
                  style={{ height: `${(data.revenue / 2500) * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(data.revenue)}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{data.month}</span>
            </div>
          ))}
        </div>
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
                      <p className="font-medium text-foreground">{tx.client}</p>
                      <p className="text-sm text-muted-foreground">{tx.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.status === 'refunded' ? 'text-destructive' : 'text-foreground'}`}>
                      {tx.status === 'refunded' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{tx.date}</span>
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
                <div className="divide-y divide-border">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{formatCurrency(payout.amount)}</p>
                          <p className="text-sm text-muted-foreground">{payout.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-success/10 text-success border-success/30">{payout.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{payout.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payout Settings */}
            <div className="card-elevated p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Payout Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bank Account</p>
                  <p className="font-medium text-foreground">•••• •••• •••• 4567</p>
                  <p className="text-sm text-muted-foreground">Barclays</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Payout Schedule</p>
                  <p className="font-medium text-foreground">Monthly (1st of month)</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
                  <p className="font-medium text-foreground">Jan 1, 2025</p>
                  <p className="text-sm text-success">~{formatCurrency(monthlyStats.revenue - monthlyStats.pending)}</p>
                </div>
                <Button variant="outline" className="w-full">Edit Payout Details</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <div className="card-elevated p-12 text-center">
            <p className="text-muted-foreground">Invoice history will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CoachEarnings;
