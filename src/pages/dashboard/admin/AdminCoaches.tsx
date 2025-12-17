import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Search, MoreHorizontal, Pencil, Trash2, KeyRound, Eye, Gift, Users, DollarSign, Loader2, Pause, Ban, CheckCircle, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import EditCoachModal from "@/components/admin/EditCoachModal";
import { CoachDetailDrawer } from "@/components/admin/CoachDetailDrawer";
import { AssignFreePlanModal } from "@/components/admin/AssignFreePlanModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { AccountStatusModal } from "@/components/admin/AccountStatusModal";
import { AdminCoachCard } from "@/components/admin/AdminCoachCard";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { arrayToCSV, downloadCSV, formatDateForCSV, formatArrayForCSV, generateExportFilename } from "@/lib/csv-export";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
  created_at: string;
  stripe_connect_onboarded: boolean | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  experience_years: number | null;
  status?: string | null;
  status_reason?: string | null;
  marketplace_visible?: boolean | null;
}

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<CoachUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoach, setEditingCoach] = useState<CoachUser | null>(null);
  const [viewingCoach, setViewingCoach] = useState<CoachUser | null>(null);
  const [assignPlanCoach, setAssignPlanCoach] = useState<CoachUser | null>(null);
  const [statusCoach, setStatusCoach] = useState<CoachUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [selectedCoaches, setSelectedCoaches] = useState<Set<string>>(new Set());
  const [coachLastLogins, setCoachLastLogins] = useState<Record<string, string | null>>({});
  const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);
  
  const { loading: actionLoading, bulkUpdateStatus, bulkDelete, getUserAuthInfo } = useAdminUserManagement("coach");
  const logAction = useLogAdminAction();

  const handleToggleVisibility = async (coach: CoachUser, newValue: boolean) => {
    setTogglingVisibility(coach.id);
    try {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ marketplace_visible: newValue })
        .eq("id", coach.id);

      if (error) throw error;

      // Update local state
      setCoaches(prev => prev.map(c => 
        c.id === coach.id ? { ...c, marketplace_visible: newValue } : c
      ));

      logAction.log({
        action: newValue ? "SHOW_COACH_IN_MARKETPLACE" : "HIDE_COACH_FROM_MARKETPLACE",
        entityType: "coach_profiles",
        entityId: coach.id,
        oldValues: { marketplace_visible: !newValue },
        newValues: { marketplace_visible: newValue },
      });

      toast.success(newValue ? "Coach visible in search" : "Coach hidden from search");
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      toast.error("Failed to update visibility");
    } finally {
      setTogglingVisibility(null);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coach_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch coaches");
      console.error(error);
      setLoading(false);
      return;
    }
    
    setCoaches(data || []);
    
    // Fetch last login for all coaches
    const authPromises = (data || []).map(async (coach) => {
      const info = await getUserAuthInfo(coach.user_id);
      return { userId: coach.user_id, lastSignInAt: info.lastSignInAt };
    });
    
    const authInfos = await Promise.all(authPromises);
    const lastLoginMap: Record<string, string | null> = {};
    authInfos.forEach(({ userId, lastSignInAt }) => {
      lastLoginMap[userId] = lastSignInAt;
    });
    setCoachLastLogins(lastLoginMap);
    
    setLoading(false);
  };

  const handleDeleteCoach = async (coach: CoachUser) => {
    if (!confirm("Are you sure you want to delete this coach? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("coach_profiles")
      .delete()
      .eq("id", coach.id);

    if (error) {
      toast.error("Failed to delete coach");
      console.error(error);
    } else {
      logAction.log({
        action: "DELETE_COACH",
        entityType: "coach_profiles",
        entityId: coach.id,
        oldValues: { display_name: coach.display_name, tier: coach.subscription_tier },
      });
      toast.success("Coach deleted successfully");
      fetchCoaches();
    }
  };

  const handleResetPassword = async (coach: CoachUser) => {
    if (!coach.user_id) {
      toast.error("User ID not found");
      return;
    }

    const email = prompt("Enter the coach's email address to send password reset:");
    if (!email) return;

    setResettingPassword(coach.user_id);
    
    try {
      const response = await supabase.functions.invoke("admin-password-reset", {
        body: { userId: coach.user_id, email },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to reset password");
      }

      logAction.log({
        action: "RESET_PASSWORD",
        entityType: "coach_profiles",
        entityId: coach.id,
        newValues: { email },
      });
      
      toast.success("Password reset email sent successfully");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResettingPassword(null);
    }
  };

  const filteredCoaches = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return coaches.filter((coach) => {
      const name = (coach.display_name || "").toLowerCase();
      const location = (coach.location || "").toLowerCase();
      return name.includes(query) || location.includes(query);
    });
  }, [coaches, searchQuery]);

  const selectedCoachesList = useMemo(() => {
    return coaches.filter((c) => selectedCoaches.has(c.id));
  }, [coaches, selectedCoaches]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoaches(new Set(filteredCoaches.map((c) => c.id)));
    } else {
      setSelectedCoaches(new Set());
    }
  };

  const handleSelectCoach = (coachId: string, checked: boolean) => {
    const newSet = new Set(selectedCoaches);
    if (checked) {
      newSet.add(coachId);
    } else {
      newSet.delete(coachId);
    }
    setSelectedCoaches(newSet);
  };

  const handleBulkAction = async (status: string) => {
    const reason = status !== "active" 
      ? prompt(`Enter reason for ${status === "banned" ? "banning" : "suspending"} ${selectedCoaches.size} coaches:`)
      : undefined;
    
    if (status !== "active" && !reason) return;

    const success = await bulkUpdateStatus(selectedCoachesList, status, reason || undefined);
    if (success) {
      setSelectedCoaches(new Set());
      fetchCoaches();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCoaches.size} coaches? This cannot be undone.`)) {
      return;
    }

    const success = await bulkDelete(selectedCoachesList);
    if (success) {
      setSelectedCoaches(new Set());
      fetchCoaches();
    }
  };

  // Stats
  const totalCoaches = coaches.length;
  const activeCoaches = coaches.filter((c) => c.onboarding_completed).length;
  const paidCoaches = coaches.filter((c) => c.subscription_tier && c.subscription_tier !== "free").length;
  const stripeConnected = coaches.filter((c) => c.stripe_connect_onboarded).length;

  const handleExportCoaches = () => {
    const columns = [
      { key: "display_name", header: "Display Name" },
      { key: "coach_types", header: "Specialties" },
      { key: "bio", header: "Bio" },
      { key: "location", header: "Location" },
      { key: "hourly_rate", header: "Hourly Rate (£)" },
      { key: "experience_years", header: "Experience (Years)" },
      { key: "subscription_tier", header: "Subscription Tier" },
      { key: "stripe_connected", header: "Stripe Connected" },
      { key: "status", header: "Account Status" },
      { key: "onboarding_completed", header: "Onboarding Completed" },
      { key: "created_at", header: "Joined Date" },
    ];

    const exportData = filteredCoaches.map((coach) => ({
      display_name: coach.display_name || "-",
      coach_types: formatArrayForCSV(coach.coach_types),
      bio: coach.bio || "-",
      location: coach.location || "-",
      hourly_rate: coach.hourly_rate || "-",
      experience_years: coach.experience_years || "-",
      subscription_tier: coach.subscription_tier || "free",
      stripe_connected: coach.stripe_connect_onboarded ? "Yes" : "No",
      status: coach.status || "active",
      onboarding_completed: coach.onboarding_completed ? "Yes" : "No",
      created_at: formatDateForCSV(coach.created_at),
    }));

    const csv = arrayToCSV(exportData, columns);
    downloadCSV(csv, generateExportFilename("coaches-export"));
    toast.success(`Exported ${filteredCoaches.length} coaches to CSV`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Coaches Management</h1>
            <p className="text-muted-foreground mt-1">Manage all coach accounts, subscriptions, and features</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCoaches} disabled={filteredCoaches.length === 0} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCoaches}</p>
                  <p className="text-xs text-muted-foreground">Total Coaches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCoaches}</p>
                  <p className="text-xs text-muted-foreground">Active (Onboarded)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{paidCoaches}</p>
                  <p className="text-xs text-muted-foreground">Paid Subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stripeConnected}</p>
                  <p className="text-xs text-muted-foreground">Stripe Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedCoaches.size > 0 && (
          <BulkActionBar
            count={selectedCoaches.size}
            onActivate={() => handleBulkAction("active")}
            onSuspend={() => handleBulkAction("suspended")}
            onBan={() => handleBulkAction("banned")}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedCoaches(new Set())}
            loading={actionLoading}
          />
        )}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Coaches ({filteredCoaches.length})</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading coaches...</div>
            ) : filteredCoaches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No coaches found</div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {filteredCoaches.map((coach) => (
                    <AdminCoachCard
                      key={coach.id}
                      coach={coach}
                      selected={selectedCoaches.has(coach.id)}
                      onSelect={(checked) => handleSelectCoach(coach.id, !!checked)}
                      onClick={() => setViewingCoach(coach)}
                    />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCoaches.size === filteredCoaches.length && filteredCoaches.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Visible</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoaches.map((coach) => (
                        <TableRow key={coach.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewingCoach(coach)}>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedCoaches.has(coach.id)}
                              onCheckedChange={(checked) => handleSelectCoach(coach.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {coach.display_name || "Unnamed Coach"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {coach.coach_types?.slice(0, 2).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                              {(coach.coach_types?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(coach.coach_types?.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {coach.hourly_rate ? `£${coach.hourly_rate}/hr` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {coach.subscription_tier || "free"}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={coach.marketplace_visible !== false}
                              onCheckedChange={(checked) => handleToggleVisibility(coach, checked)}
                              disabled={togglingVisibility === coach.id}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={coach.status || "active"} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {coachLastLogins[coach.user_id] 
                              ? new Date(coachLastLogins[coach.user_id]!).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(coach.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewingCoach(coach)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingCoach(coach)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAssignPlanCoach(coach)}>
                                  <Gift className="h-4 w-4 mr-2" />
                                  Assign Free Plan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleResetPassword(coach)}
                                  disabled={resettingPassword === coach.user_id}
                                >
                                  {resettingPassword === coach.user_id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <KeyRound className="h-4 w-4 mr-2" />
                                  )}
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {coach.status !== "active" && (
                                  <DropdownMenuItem onClick={() => setStatusCoach(coach)}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Activate Account
                                  </DropdownMenuItem>
                                )}
                                {coach.status !== "suspended" && (
                                  <DropdownMenuItem onClick={() => setStatusCoach(coach)}>
                                    <Pause className="h-4 w-4 mr-2 text-amber-500" />
                                    Suspend Account
                                  </DropdownMenuItem>
                                )}
                                {coach.status !== "banned" && (
                                  <DropdownMenuItem onClick={() => setStatusCoach(coach)} className="text-destructive">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Ban Account
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCoach(coach)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Coach
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {editingCoach && (
        <EditCoachModal
          coach={editingCoach}
          open={!!editingCoach}
          onClose={() => setEditingCoach(null)}
          onSaved={fetchCoaches}
        />
      )}

      {/* Status Modal */}
      {statusCoach && (
        <AccountStatusModal
          open={!!statusCoach}
          onClose={() => setStatusCoach(null)}
          onSaved={fetchCoaches}
          user={{
            id: statusCoach.id,
            user_id: statusCoach.user_id,
            name: statusCoach.display_name || "Unnamed Coach",
            currentStatus: statusCoach.status || "active",
          }}
          userType="coach"
        />
      )}

      {/* Detail Drawer */}
      <CoachDetailDrawer
        coach={viewingCoach}
        open={!!viewingCoach}
        onOpenChange={(open) => !open && setViewingCoach(null)}
        onAssignFreePlan={() => {
          if (viewingCoach) setAssignPlanCoach(viewingCoach);
        }}
        onEdit={() => viewingCoach && setEditingCoach(viewingCoach)}
        onResetPassword={() => viewingCoach && handleResetPassword(viewingCoach)}
        onChangeStatus={() => viewingCoach && setStatusCoach(viewingCoach)}
        onDelete={() => viewingCoach && handleDeleteCoach(viewingCoach)}
        onRefresh={fetchCoaches}
      />

      {/* Assign Free Plan Modal */}
      <AssignFreePlanModal
        coach={assignPlanCoach ? {
          id: assignPlanCoach.id,
          display_name: assignPlanCoach.display_name || "Unknown",
          subscription_tier: assignPlanCoach.subscription_tier || "free",
        } : null}
        open={!!assignPlanCoach}
        onOpenChange={(open) => !open && setAssignPlanCoach(null)}
      />
    </AdminLayout>
  );
};

export default AdminCoaches;
