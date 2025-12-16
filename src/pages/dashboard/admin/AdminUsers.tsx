import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MoreHorizontal, Pencil, Trash2, KeyRound, Loader2, Eye, Pause, Ban, CheckCircle } from "lucide-react";
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
import EditUserModal from "@/components/admin/EditUserModal";
import { UserDetailDrawer } from "@/components/admin/UserDetailDrawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { AccountStatusModal } from "@/components/admin/AccountStatusModal";
import { useAdminUserManagement } from "@/hooks/useAdminUserManagement";
import { useLogAdminAction } from "@/hooks/useAuditLog";
import { useAdminBadges } from "@/hooks/useSidebarBadges";

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
  avatar_url?: string | null;
  status?: string | null;
  status_reason?: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [viewingUser, setViewingUser] = useState<ClientUser | null>(null);
  const [statusUser, setStatusUser] = useState<ClientUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  const { loading: actionLoading, bulkUpdateStatus, bulkDelete } = useAdminUserManagement("client");
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
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

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

    const email = prompt("Enter the user's email address to send password reset:");
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
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "suspended":
        return <Pause className="h-4 w-4" />;
      case "banned":
        return <Ban className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground mt-1">Manage all client accounts</p>
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
            <div className="flex items-center justify-between">
              <CardTitle>All Users ({users.length})</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
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
                    <TableHead>Age</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Onboarding</TableHead>
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
                      <TableCell>{user.age || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.status || "active"} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={user.onboarding_completed ? "active" : "suspended"} 
                          className={user.onboarding_completed ? "" : "bg-muted/50 text-muted-foreground border-muted"}
                        />
                      </TableCell>
                      <TableCell>
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
