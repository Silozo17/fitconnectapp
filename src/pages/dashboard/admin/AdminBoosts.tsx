import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Users, DollarSign, TrendingUp, Settings } from "lucide-react";
import { useAllBoosts, useBoostStats, useBoostSettings, useUpdateBoostSettings, useAllAttributions } from "@/hooks/useCoachBoost";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardSectionHeader, MetricCard, ContentSection, StatsGrid } from "@/components/shared";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminBoosts = () => {
  const { data: boosts, isLoading: boostsLoading } = useAllBoosts();
  const { data: stats, isLoading: statsLoading } = useBoostStats();
  const { data: settings, isLoading: settingsLoading } = useBoostSettings();
  const { data: attributions, isLoading: attributionsLoading } = useAllAttributions(20);
  const updateSettings = useUpdateBoostSettings();

  const [editSettings, setEditSettings] = useState({
    commission_rate: 0.30,
    min_fee: 10,
    max_fee: 100,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const isLoading = boostsLoading || statsLoading || settingsLoading || attributionsLoading;

  const handleOpenDialog = () => {
    if (settings) {
      setEditSettings({
        commission_rate: settings.commission_rate,
        min_fee: settings.min_fee,
        max_fee: settings.max_fee,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(editSettings, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const activeBoosts = boosts?.filter(b => b.is_active) || [];

  return (
    <AdminLayout>
      <Helmet>
        <title>Boosts | Admin Dashboard</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <DashboardSectionHeader
          title="Boost Management"
          description="Manage coach boosts and view performance"
          action={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleOpenDialog}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Boost Settings</DialogTitle>
                  <DialogDescription>
                    Configure the commission rate and fee limits for Boost
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      min="0"
                      max="100"
                      value={editSettings.commission_rate * 100}
                      onChange={(e) => setEditSettings(prev => ({
                        ...prev,
                        commission_rate: Number(e.target.value) / 100
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of first booking charged as Boost fee
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_fee">Minimum Fee (£)</Label>
                      <Input
                        id="min_fee"
                        type="number"
                        min="0"
                        value={editSettings.min_fee}
                        onChange={(e) => setEditSettings(prev => ({
                          ...prev,
                          min_fee: Number(e.target.value)
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_fee">Maximum Fee (£)</Label>
                      <Input
                        id="max_fee"
                        type="number"
                        min="0"
                        value={editSettings.max_fee}
                        onChange={(e) => setEditSettings(prev => ({
                          ...prev,
                          max_fee: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
          className="mb-0"
        />

        {/* Stats - 2x2 grid */}
        {isLoading ? (
          <StatsGrid columns={2}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
            ))}
          </StatsGrid>
        ) : (
          <StatsGrid columns={2}>
            <MetricCard
              icon={Rocket}
              label="Active Boosts"
              value={stats?.activeBoosts || 0}
              description="coaches boosted"
              color="primary"
              size="sm"
            />
            <MetricCard
              icon={Users}
              label="Clients This Month"
              value={stats?.monthlyClients || 0}
              description="acquired via Boost"
              color="blue"
              size="sm"
            />
            <MetricCard
              icon={DollarSign}
              label="Revenue This Month"
              value={formatCurrency(stats?.monthlyRevenue || 0, "GBP")}
              description="from Boost fees"
              color="green"
              size="sm"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0, "GBP")}
              description="all time"
              color="purple"
              size="sm"
            />
          </StatsGrid>
        )}

        {/* Current Settings - No card wrapper */}
        {settings && (
          <ContentSection colorTheme="muted" withAccent>
            <h3 className="font-semibold text-foreground mb-4">Current Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
                <p className="text-xl sm:text-2xl font-bold">{Math.round(settings.commission_rate * 100)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Minimum Fee</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(settings.min_fee, "GBP")}</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Maximum Fee</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(settings.max_fee, "GBP")}</p>
              </div>
            </div>
          </ContentSection>
        )}

        {/* Active Boosts Table */}
        <ContentSection colorTheme="blue" withAccent padding="none">
          <div className="p-4 md:p-5 pb-0">
            <h3 className="font-semibold text-foreground">Active Boosted Coaches</h3>
            <p className="text-sm text-muted-foreground">{activeBoosts.length} coaches currently boosted</p>
          </div>
          <div className="p-4 md:p-5 pt-3">
            {activeBoosts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coach</TableHead>
                      <TableHead className="hidden sm:table-cell">Location</TableHead>
                      <TableHead className="hidden md:table-cell">Activated</TableHead>
                      <TableHead className="text-right">Clients</TableHead>
                      <TableHead className="text-right">Fees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBoosts.map((boost: any) => (
                      <TableRow key={boost.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              src={boost.coach_profiles?.profile_image_url} 
                              name={boost.coach_profiles?.display_name}
                              className="h-8 w-8"
                            />
                            <span className="font-medium">{boost.coach_profiles?.display_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{boost.coach_profiles?.location || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {boost.activated_at ? format(new Date(boost.activated_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="text-right">{boost.total_clients_acquired}</TableCell>
                        <TableCell className="text-right">{formatCurrency(boost.total_fees_paid, "GBP")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No coaches currently have Boost enabled
              </p>
            )}
          </div>
        </ContentSection>

        {/* Recent Attributions */}
        <ContentSection colorTheme="green" withAccent padding="none">
          <div className="p-4 md:p-5 pb-0">
            <h3 className="font-semibold text-foreground">Recent Client Acquisitions</h3>
            <p className="text-sm text-muted-foreground">Clients acquired through Boost</p>
          </div>
          <div className="p-4 md:p-5 pt-3">
            {attributions && attributions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">Coach</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Booking</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Fee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributions.map((attr: any) => (
                      <TableRow key={attr.id}>
                        <TableCell>
                          {attr.client_profiles?.first_name} {attr.client_profiles?.last_name?.charAt(0)}.
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{attr.coach_profiles?.display_name || "Unknown"}</TableCell>
                        <TableCell className="hidden md:table-cell">{format(new Date(attr.attributed_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          {attr.booking_amount ? formatCurrency(attr.booking_amount, "GBP") : "—"}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {attr.fee_amount ? formatCurrency(attr.fee_amount, "GBP") : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              attr.fee_status === "charged" ? "default" : 
                              attr.fee_status === "waived" ? "secondary" : "outline"
                            }
                          >
                            {attr.fee_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No client acquisitions via Boost yet
              </p>
            )}
          </div>
        </ContentSection>
      </div>
    </AdminLayout>
  );
};

export default AdminBoosts;