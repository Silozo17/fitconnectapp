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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Boost Management
            </h1>
            <p className="text-muted-foreground">
              Manage coach boosts and view performance
            </p>
          </div>
          
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
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Active Boosts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.activeBoosts || 0}</p>
                <p className="text-xs text-muted-foreground">coaches boosted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clients This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.monthlyClients || 0}</p>
                <p className="text-xs text-muted-foreground">acquired via Boost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0, "GBP")}</p>
                <p className="text-xs text-muted-foreground">from Boost fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0, "GBP")}</p>
                <p className="text-xs text-muted-foreground">all time</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Settings */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold">{Math.round(settings.commission_rate * 100)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Minimum Fee</p>
                  <p className="text-2xl font-bold">{formatCurrency(settings.min_fee, "GBP")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Maximum Fee</p>
                  <p className="text-2xl font-bold">{formatCurrency(settings.max_fee, "GBP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Boosts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Boosted Coaches</CardTitle>
            <CardDescription>{activeBoosts.length} coaches currently boosted</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBoosts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Activated</TableHead>
                    <TableHead className="text-right">Clients Acquired</TableHead>
                    <TableHead className="text-right">Fees Paid</TableHead>
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
                      <TableCell>{boost.coach_profiles?.location || "—"}</TableCell>
                      <TableCell>
                        {boost.activated_at ? format(new Date(boost.activated_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">{boost.total_clients_acquired}</TableCell>
                      <TableCell className="text-right">{formatCurrency(boost.total_fees_paid, "GBP")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No coaches currently have Boost enabled
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Attributions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Client Acquisitions</CardTitle>
            <CardDescription>Clients acquired through Boost</CardDescription>
          </CardHeader>
          <CardContent>
            {attributions && attributions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Booking</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributions.map((attr: any) => (
                    <TableRow key={attr.id}>
                      <TableCell>
                        {attr.client_profiles?.first_name} {attr.client_profiles?.last_name?.charAt(0)}.
                      </TableCell>
                      <TableCell>{attr.coach_profiles?.display_name || "Unknown"}</TableCell>
                      <TableCell>{format(new Date(attr.attributed_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        {attr.booking_amount ? formatCurrency(attr.booking_amount, "GBP") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
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
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No client acquisitions via Boost yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBoosts;
