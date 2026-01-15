import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { GymDetailDrawer } from "@/components/admin/gym/GymDetailDrawer";
import { SendGymAnnouncementModal } from "@/components/admin/gym/SendGymAnnouncementModal";
import { 
  useAdminGyms, 
  useAdminGymStats, 
  useBulkUpdateGymStatus,
  type GymProfile,
  type GymFilters,
} from "@/hooks/admin/useAdminGyms";
import { 
  Building2, Users, CreditCard, BadgeCheck, MapPin, 
  Download, Search, Eye, Megaphone, Loader2, PoundSterling,
  TrendingUp
} from "lucide-react";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { format } from "date-fns";
import { arrayToCSV, downloadCSV, generateExportFilename, formatDateForCSV } from "@/lib/csv-export";

export default function AdminGyms() {
  const [filters, setFilters] = useState<GymFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGyms, setSelectedGyms] = useState<Set<string>>(new Set());
  const [selectedGymId, setSelectedGymId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const { data: gyms, isLoading } = useAdminGyms({ ...filters, search: searchTerm });
  const { data: stats } = useAdminGymStats();
  const bulkUpdateStatus = useBulkUpdateGymStatus();

  const filteredGyms = useMemo(() => {
    return gyms || [];
  }, [gyms]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGyms(new Set(filteredGyms.map(g => g.id)));
    } else {
      setSelectedGyms(new Set());
    }
  };

  const handleSelectGym = (gymId: string, checked: boolean) => {
    const newSelected = new Set(selectedGyms);
    if (checked) {
      newSelected.add(gymId);
    } else {
      newSelected.delete(gymId);
    }
    setSelectedGyms(newSelected);
  };

  const handleViewGym = (gymId: string) => {
    setSelectedGymId(gymId);
    setDrawerOpen(true);
  };

  const handleBulkAction = async (action: string) => {
    const gymIds = Array.from(selectedGyms);
    if (gymIds.length === 0) return;

    await bulkUpdateStatus.mutateAsync({
      gymIds,
      status: action,
    });
    setSelectedGyms(new Set());
  };

  const handleExport = () => {
    if (!filteredGyms.length) return;

    const columns = [
      { key: "name", header: "Gym Name" },
      { key: "owner_name", header: "Owner" },
      { key: "email", header: "Email" },
      { key: "city", header: "City" },
      { key: "location_count", header: "Locations" },
      { key: "member_count", header: "Members" },
      { key: "status", header: "Status" },
      { key: "subscription_status", header: "Subscription" },
      { key: "stripe_account_id", header: "Stripe Connected" },
      { key: "is_verified", header: "Verified" },
      { key: "created_at", header: "Created" },
    ];

    const exportData = filteredGyms.map(gym => ({
      ...gym,
      stripe_account_id: gym.stripe_account_id ? "Yes" : "No",
      is_verified: gym.is_verified ? "Yes" : "No",
      created_at: formatDateForCSV(gym.created_at),
    }));

    const csv = arrayToCSV(exportData, columns);
    downloadCSV(csv, generateExportFilename("gyms"));
  };

  const getStatusBadge = (gym: GymProfile) => {
    const status = gym.status || "pending";
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      onboarded: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      suspended: { variant: "destructive", label: "Suspended" },
      banned: { variant: "destructive", label: "Banned" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubscriptionLabel = (gym: GymProfile) => {
    const locations = gym.location_count || 1;
    const basePrice = 99;
    const additionalPrice = Math.max(0, locations - 1) * 25;
    const total = basePrice + additionalPrice;

    if (gym.subscription_status === "active") {
      return (
        <span className="text-green-600 dark:text-green-400 font-medium">
          £{total}/mo
        </span>
      );
    }
    return <span className="text-muted-foreground">Inactive</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-11">
        <DashboardSectionHeader
          title="Manage Gyms"
          description="View and manage all gym accounts, subscriptions, and revenue"
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAnnouncementOpen(true)}
                disabled={filteredGyms.length === 0}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Announce
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport} 
                disabled={filteredGyms.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <StatsGrid columns={5}>
          <MetricCard
            icon={Building2}
            label="Total Gyms"
            value={stats?.total || 0}
            color="purple"
            size="sm"
          />
          <MetricCard
            icon={Users}
            label="Active Gyms"
            value={stats?.active || 0}
            color="green"
            size="sm"
          />
          <MetricCard
            icon={MapPin}
            label="Total Locations"
            value={stats?.totalLocations || 0}
            color="blue"
            size="sm"
          />
          <MetricCard
            icon={PoundSterling}
            label="MRR (Subscriptions)"
            value={`£${stats?.monthlyRecurring || 0}`}
            color="primary"
            size="sm"
          />
          <MetricCard
            icon={TrendingUp}
            label="Fees This Month"
            value={`£${stats?.platformFeesThisMonth || 0}`}
            color="yellow"
            size="sm"
          />
        </StatsGrid>

        {/* Filters */}
        <ContentSection colorTheme="purple">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gyms by name, owner, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value === "all" ? undefined : value }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.subscriptionStatus || "all"}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, subscriptionStatus: value === "all" ? undefined : value }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                filters.stripeConnected === undefined 
                  ? "all" 
                  : filters.stripeConnected 
                    ? "yes" 
                    : "no"
              }
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  stripeConnected: value === "all" ? undefined : value === "yes" 
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stripe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stripe</SelectItem>
                <SelectItem value="yes">Connected</SelectItem>
                <SelectItem value="no">Not Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <BulkActionBar
            count={selectedGyms.size}
            onActivate={() => handleBulkAction("active")}
            onSuspend={() => handleBulkAction("suspended")}
            onBan={() => handleBulkAction("banned")}
            onDelete={() => {}}
            onClear={() => setSelectedGyms(new Set())}
            loading={bulkUpdateStatus.isPending}
          />

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No gyms found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedGyms.size === filteredGyms.length && filteredGyms.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Gym</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-center">Locations</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Stripe</TableHead>
                    <TableHead className="text-center">Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGyms.map((gym) => (
                    <TableRow key={gym.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGyms.has(gym.id)}
                          onCheckedChange={(checked) => 
                            handleSelectGym(gym.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={gym.logo_url}
                            name={gym.name}
                            size="sm"
                            variant="squircle"
                          />
                          <div>
                            <p className="font-medium">{gym.name}</p>
                            <p className="text-xs text-muted-foreground">{gym.city || "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{gym.owner_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{gym.email || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{gym.location_count || 1}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {gym.member_count || 0}
                      </TableCell>
                      <TableCell>{getSubscriptionLabel(gym)}</TableCell>
                      <TableCell>{getStatusBadge(gym)}</TableCell>
                      <TableCell className="text-center">
                        {gym.stripe_account_id ? (
                          <CreditCard className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {gym.is_verified ? (
                          <BadgeCheck className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewGym(gym.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ContentSection>
      </div>

      {/* Gym Detail Drawer */}
      <GymDetailDrawer
        gymId={selectedGymId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Send Announcement Modal */}
      <SendGymAnnouncementModal
        open={announcementOpen}
        onOpenChange={setAnnouncementOpen}
        selectedGymIds={selectedGyms.size > 0 ? Array.from(selectedGyms) : undefined}
      />
    </AdminLayout>
  );
}
