import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, MoreHorizontal, Pencil, Trash2, KeyRound, Loader2, Eye, Pause, Ban, CheckCircle, 
  UserPlus, Users, UserCheck, UsersRound, Calendar, Download
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import EditUserModal from "@/components/admin/EditUserModal";
import AddUserModal from "@/components/admin/AddUserModal";
import { UserDetailDrawer } from "@/components/admin/UserDetailDrawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { AccountStatusModal } from "@/components/admin/AccountStatusModal";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { useAdminBadges } from "@/hooks/useSidebarBadges";
import { arrayToCSV, downloadCSV, formatDateForCSV, formatArrayForCSV, generateExportFilename } from "@/lib/csv-export";

interface ClientUser {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  onboarding_completed: boolean;
  created_at: string;
  email?: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  status_reason?: string | null;
  gender_pronouns?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_goals?: string[] | null;
  medical_conditions?: string[] | null;
  allergies?: string[] | null;
  dietary_restrictions?: string[] | null;
  leaderboard_visible?: boolean | null;
  leaderboard_display_name?: string | null;
  coach_count?: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [onboardingFilter, setOnboardingFilter] = useState<string>("all");
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ClientUser | null>(null);
  const [statusUser, setStatusUser] = useState<ClientUser | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [userLastLogins, setUserLastLogins] = useState<Record<string, string | null>>({});
  
  const { loading: actionLoading, bulkUpdateStatus, bulkDelete, getUserAuthInfo } = useAdminUserManagement("client");
  const logAction = useLogAdminAction();
  const { markUsersViewed } = useAdminBadges();

  // Mark users as viewed when page loads
  useEffect(() => {
    markUsersViewed();
  }, [markUsersViewed]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch users with coach count
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch users");
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch coach counts for each user
    const usersWithCoachCount = await Promise.all(
      (data || []).map(async (user) => {
        const { count } = await supabase
          .from("coach_clients")
          .select("*", { count: "exact", head: true })
          .eq("client_id", user.id);
        
        return { ...user, coach_count: count || 0 };
      })
    );

    setUsers(usersWithCoachCount);
    
    // Fetch emails and last login for all users
    const authPromises = usersWithCoachCount.map(async (user) => {
      const info = await getUserAuthInfo(user.user_id);
      return { userId: user.user_id, email: info.email, lastSignInAt: info.lastSignInAt };
    });
    
    const authInfos = await Promise.all(authPromises);
    const emailMap: Record<string, string> = {};
    const lastLoginMap: Record<string, string | null> = {};
    authInfos.forEach(({ userId, email, lastSignInAt }) => {
      if (email) emailMap[userId] = email;
      lastLoginMap[userId] = lastSignInAt;
    });
    setUserEmails(emailMap);
    setUserLastLogins(lastLoginMap);
    
    setLoading(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: users.length,
      active: users.filter(u => u.onboarding_completed && u.status !== "banned" && u.status !== "suspended").length,
      withCoaches: users.filter(u => (u.coach_count || 0) > 0).length,
      newThisWeek: users.filter(u => new Date(u.created_at) > oneWeekAgo).length,
    };
  }, [users]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("client_profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } else {
      logAction.mutate({
        action: "DELETE_USER",
        entityType: "client_profiles",
        entityId: userId,
      });
      toast.success("User deleted successfully");
      fetchUsers();
    }
  };

  const handleResetPassword = async (user: ClientUser) => {
    if (!user.user_id) {
      toast.error("User ID not found");
      return;
    }

    const email = userEmails[user.user_id] || prompt("Enter the user's email address to send password reset:");
    if (!email) return;

    setResettingPassword(user.user_id);
    
    try {
      const response = await supabase.functions.invoke("admin-password-reset", {
        body: { userId: user.user_id, email },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to reset password");
      }

      logAction.mutate({
        action: "RESET_PASSWORD",
        entityType: "client_profiles",
        entityId: user.id,
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = userEmails[user.user_id]?.toLowerCase() || "";
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                           email.includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter || 
                          (statusFilter === "active" && !user.status);
      
      // Onboarding filter
      const matchesOnboarding = onboardingFilter === "all" || 
                               (onboardingFilter === "completed" && user.onboarding_completed) ||
                               (onboardingFilter === "incomplete" && !user.onboarding_completed);
      
      // Coach filter
      const matchesCoach = coachFilter === "all" ||
                          (coachFilter === "with_coaches" && (user.coach_count || 0) > 0) ||
                          (coachFilter === "no_coaches" && (user.coach_count || 0) === 0);
      
      return matchesSearch && matchesStatus && matchesOnboarding && matchesCoach;
    });
  }, [users, searchQuery, statusFilter, onboardingFilter, coachFilter, userEmails]);

  const selectedUsersList = useMemo(() => {
    return users.filter((u) => selectedUsers.has(u.id));
  }, [users, selectedUsers]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSet = new Set(selectedUsers);
    if (checked) {
      newSet.add(userId);
    } else {
      newSet.delete(userId);
    }
    setSelectedUsers(newSet);
  };

  const handleBulkAction = async (status: string) => {
    const reason = status !== "active" 
      ? prompt(`Enter reason for ${status === "banned" ? "banning" : "suspending"} ${selectedUsers.size} users:`)
      : undefined;
    
    if (status !== "active" && !reason) return;

    const success = await bulkUpdateStatus(selectedUsersList, status, reason || undefined);
    if (success) {
      setSelectedUsers(new Set());
      fetchUsers();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} users? This cannot be undone.`)) {
      return;
    }

    const success = await bulkDelete(selectedUsersList);
    if (success) {
      setSelectedUsers(new Set());
      fetchUsers();
    }
  };

  const getLocationDisplay = (user: ClientUser) => {
    if (user.city && user.country) return `${user.city}, ${user.country}`;
    if (user.city) return user.city;
    if (user.country) return user.country;
    if (user.location) return user.location;
    return "-";
  };

  const handleExportUsers = () => {
    const columns = [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "age", header: "Age" },
      { key: "gender_pronouns", header: "Gender/Pronouns" },
      { key: "location", header: "Location" },
      { key: "height_cm", header: "Height (cm)" },
      { key: "weight_kg", header: "Weight (kg)" },
      { key: "fitness_goals", header: "Fitness Goals" },
      { key: "dietary_restrictions", header: "Dietary Restrictions" },
      { key: "allergies", header: "Allergies" },
      { key: "medical_conditions", header: "Medical Conditions" },
      { key: "coach_count", header: "Number of Coaches" },
      { key: "status", header: "Account Status" },
      { key: "onboarding_completed", header: "Onboarding Completed" },
      { key: "leaderboard_visible", header: "Leaderboard Visible" },
      { key: "leaderboard_display_name", header: "Leaderboard Name" },
      { key: "created_at", header: "Joined Date" },
    ];

    const exportData = filteredUsers.map((user) => ({
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "-",
      email: userEmails[user.user_id] || "-",
      age: user.age || "-",
      gender_pronouns: user.gender_pronouns || "-",
      location: getLocationDisplay(user),
      height_cm: user.height_cm || "-",
      weight_kg: user.weight_kg || "-",
      fitness_goals: formatArrayForCSV(user.fitness_goals),
      dietary_restrictions: formatArrayForCSV(user.dietary_restrictions),
      allergies: formatArrayForCSV(user.allergies),
      medical_conditions: formatArrayForCSV(user.medical_conditions),
      coach_count: user.coach_count || 0,
      status: user.status || "active",
      onboarding_completed: user.onboarding_completed ? "Yes" : "No",
      leaderboard_visible: user.leaderboard_visible ? "Yes" : "No",
      leaderboard_display_name: user.leaderboard_display_name || "-",
      created_at: formatDateForCSV(user.created_at),
    }));

    const csv = arrayToCSV(exportData, columns);
    downloadCSV(csv, generateExportFilename("users-export"));
    toast.success(`Exported ${filteredUsers.length} users to CSV`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage all client accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportUsers} disabled={filteredUsers.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500">
                  <UsersRound className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.withCoaches}</p>
                  <p className="text-sm text-muted-foreground">With Coaches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.newThisWeek}</p>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedUsers.size > 0 && (
          <BulkActionBar
            count={selectedUsers.size}
            onActivate={() => handleBulkAction("active")}
            onSuspend={() => handleBulkAction("suspended")}
            onBan={() => handleBulkAction("banned")}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedUsers(new Set())}
            loading={actionLoading}
          />
        )}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Onboarding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Onboarding</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={coachFilter} onValueChange={setCoachFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Coaches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="with_coaches">Has Coaches</SelectItem>
                    <SelectItem value="no_coaches">No Coaches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Coaches</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewingUser(user)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                          : "Unnamed User"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {userEmails[user.user_id] || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getLocationDisplay(user)}
                      </TableCell>
                      <TableCell>
                        <span className={user.coach_count ? "text-primary font-medium" : "text-muted-foreground"}>
                          {user.coach_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status || "active"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {userLastLogins[user.user_id] 
                          ? new Date(userLastLogins[user.user_id]!).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setViewingUser(user);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditingUser(user);
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetPassword(user);
                              }}
                              disabled={resettingPassword === user.user_id}
                            >
                              {resettingPassword === user.user_id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <KeyRound className="h-4 w-4 mr-2" />
                              )}
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== "active" && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setStatusUser(user);
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Activate Account
                              </DropdownMenuItem>
                            )}
                            {user.status !== "suspended" && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setStatusUser(user);
                              }}>
                                <Pause className="h-4 w-4 mr-2 text-amber-500" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}
                            {user.status !== "banned" && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setStatusUser(user);
                              }} className="text-destructive">
                                <Ban className="h-4 w-4 mr-2" />
                                Ban Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
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

      <AddUserModal
        isOpen={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSuccess={fetchUsers}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={fetchUsers}
        />
      )}

      {statusUser && (
        <AccountStatusModal
          open={!!statusUser}
          onClose={() => setStatusUser(null)}
          onSaved={fetchUsers}
          user={{
            id: statusUser.id,
            user_id: statusUser.user_id,
            name: `${statusUser.first_name || ""} ${statusUser.last_name || ""}`.trim() || "Unnamed User",
            currentStatus: statusUser.status || "active",
          }}
          userType="client"
        />
      )}

      <UserDetailDrawer
        open={!!viewingUser}
        onOpenChange={(open) => !open && setViewingUser(null)}
        user={viewingUser}
        onSaved={fetchUsers}
      />
    </AdminLayout>
  );
};

export default AdminUsers;