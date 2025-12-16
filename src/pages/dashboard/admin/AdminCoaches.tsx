import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Pencil, Trash2, KeyRound, Eye, Gift, Users, DollarSign, Loader2 } from "lucide-react";
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
import { useLogAdminAction } from "@/hooks/useAuditLog";

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
}

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<CoachUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoach, setEditingCoach] = useState<CoachUser | null>(null);
  const [viewingCoach, setViewingCoach] = useState<CoachUser | null>(null);
  const [assignPlanCoach, setAssignPlanCoach] = useState<CoachUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const logAction = useLogAdminAction();

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
    } else {
      setCoaches(data || []);
    }
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
      logAction.mutate({
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

      logAction.mutate({
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

  const filteredCoaches = coaches.filter((coach) => {
    const name = (coach.display_name || "").toLowerCase();
    const location = (coach.location || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || location.includes(query);
  });

  // Stats
  const totalCoaches = coaches.length;
  const activeCoaches = coaches.filter((c) => c.onboarding_completed).length;
  const paidCoaches = coaches.filter((c) => c.subscription_tier && c.subscription_tier !== "free").length;
  const stripeConnected = coaches.filter((c) => c.stripe_connect_onboarded).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coaches Management</h1>
          <p className="text-muted-foreground mt-1">Manage all coach accounts, subscriptions, and features</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Coaches ({filteredCoaches.length})</CardTitle>
              <div className="relative w-72">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Stripe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map((coach) => (
                    <TableRow key={coach.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewingCoach(coach)}>
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
                      <TableCell>
                        <Badge variant={coach.stripe_connect_onboarded ? "default" : "outline"}>
                          {coach.stripe_connect_onboarded ? "Connected" : "Not Connected"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coach.onboarding_completed ? "default" : "secondary"}>
                          {coach.onboarding_completed ? "Active" : "Onboarding"}
                        </Badge>
                      </TableCell>
                      <TableCell>
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

      {/* Detail Drawer */}
      <CoachDetailDrawer
        coach={viewingCoach}
        open={!!viewingCoach}
        onOpenChange={(open) => !open && setViewingCoach(null)}
        onAssignFreePlan={() => {
          if (viewingCoach) setAssignPlanCoach(viewingCoach);
        }}
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
