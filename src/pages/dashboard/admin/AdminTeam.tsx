import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, KeyRound, Loader2, MoreHorizontal, Pause, Plus, Search, Shield, Trash2, Users } from "lucide-react";
import AddTeamMemberModal from "@/components/admin/AddTeamMemberModal";
import EditTeamMemberModal from "@/components/admin/EditTeamMemberModal";
import ChangeRoleModal from "@/components/admin/ChangeRoleModal";
import { TeamStatusModal } from "@/components/admin/TeamStatusModal";
import { TeamMemberDetailDrawer } from "@/components/admin/TeamMemberDetailDrawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { useAdminTeamManagement } from "@/hooks/useAdminTeamManagement";
import { AdminTeamCard } from "@/components/admin/AdminTeamCard";

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  created_at: string;
  status: string | null;
  status_reason: string | null;
  role: string;
  email?: string;
}

const AdminTeam = () => {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [memberEmails, setMemberEmails] = useState<Record<string, string | null>>({});
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { loading: actionLoading, getUserEmailsBatch, updateStatus, bulkUpdateStatus, bulkDelete, resetPassword } = useAdminTeamManagement();

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("admin_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "manager", "staff"]);

      if (rolesError) throw rolesError;

      const mergedData = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || "staff"
      })) || [];

      setTeamMembers(mergedData);
      
      // Batch fetch emails for all team members in a single request
      const userIds = mergedData.map(member => member.user_id);
      const emailMap = await getUserEmailsBatch(userIds);
      setMemberEmails(emailMap);
    } catch (error: any) {
      toast.error("Failed to fetch team members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getUserEmailsBatch]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleDeleteMember = async (member: TeamMember) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    // Use bulkDelete with single member to ensure both profile AND auth user are deleted
    const success = await bulkDelete([{ id: member.id, user_id: member.user_id }]);
    if (success) {
      fetchTeamMembers();
    }
  };

  const handleResetPassword = async (member: TeamMember) => {
    const success = await resetPassword(member.user_id, member.id);
    if (success) {
      toast.success("Password reset email sent");
    }
  };

  const handleStatusChange = async (userId: string, profileId: string, status: string, reason?: string) => {
    const success = await updateStatus(userId, profileId, status, reason);
    if (success) {
      fetchTeamMembers();
    }
    return success;
  };

  const handleBulkActivate = async () => {
    const members = teamMembers.filter(m => selectedIds.has(m.id));
    const success = await bulkUpdateStatus(members.map(m => ({ id: m.id, user_id: m.user_id })), "active");
    if (success) {
      setSelectedIds(new Set());
      fetchTeamMembers();
    }
  };

  const handleBulkSuspend = async () => {
    const members = teamMembers.filter(m => selectedIds.has(m.id));
    const success = await bulkUpdateStatus(members.map(m => ({ id: m.id, user_id: m.user_id })), "suspended", "Bulk action by admin");
    if (success) {
      setSelectedIds(new Set());
      fetchTeamMembers();
    }
  };

  const handleBulkBan = async () => {
    const members = teamMembers.filter(m => selectedIds.has(m.id));
    const success = await bulkUpdateStatus(members.map(m => ({ id: m.id, user_id: m.user_id })), "banned", "Bulk action by admin");
    if (success) {
      setSelectedIds(new Set());
      fetchTeamMembers();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} team member(s)?`)) return;
    const members = teamMembers.filter(m => selectedIds.has(m.id));
    const success = await bulkDelete(members.map(m => ({ id: m.id, user_id: m.user_id })));
    if (success) {
      setSelectedIds(new Set());
      fetchTeamMembers();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground";
      case "manager":
        return "bg-primary text-primary-foreground";
      case "staff":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = 
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (member.status || "active") === statusFilter;
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const stats = {
    total: teamMembers.length,
    admins: teamMembers.filter(m => m.role === "admin").length,
    managers: teamMembers.filter(m => m.role === "manager").length,
    staff: teamMembers.filter(m => m.role === "staff").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Manage admins, managers, and staff</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.managers}</p>
                  <p className="text-sm text-muted-foreground">Managers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.staff}</p>
                  <p className="text-sm text-muted-foreground">Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BulkActionBar
          count={selectedIds.size}
          onActivate={handleBulkActivate}
          onSuspend={handleBulkSuspend}
          onBan={handleBulkBan}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
          loading={actionLoading}
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>All admins, managers, and staff</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {filteredMembers.map((member) => (
                    <AdminTeamCard
                      key={member.id}
                      member={member}
                      selected={selectedIds.has(member.id)}
                      onSelect={(checked) => toggleSelect(member.id)}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsDetailDrawerOpen(true);
                      }}
                    />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedIds.size === filteredMembers.length && filteredMembers.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow 
                          key={member.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDetailDrawerOpen(true);
                          }}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(member.id)}
                              onCheckedChange={() => toggleSelect(member.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {member.first_name?.[0] || member.display_name?.[0] || "T"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.display_name || `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Unnamed"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {memberEmails[member.user_id] || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={member.status || "active"} />
                          </TableCell>
                          <TableCell>{member.department || "—"}</TableCell>
                          <TableCell>
                            {new Date(member.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsDetailDrawerOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsRoleModalOpen(true);
                                  }}
                                >
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleResetPassword(member)}>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsStatusModalOpen(true);
                                  }}
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Change Status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteMember(member)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
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

      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTeamMembers}
      />

      <EditTeamMemberModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={fetchTeamMembers}
        member={selectedMember}
      />

      <ChangeRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={fetchTeamMembers}
        member={selectedMember}
      />

      <TeamStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onStatusChange={handleStatusChange}
      />

      <TeamMemberDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onEdit={() => {
          setIsDetailDrawerOpen(false);
          setIsEditModalOpen(true);
        }}
        onChangeRole={() => {
          setIsDetailDrawerOpen(false);
          setIsRoleModalOpen(true);
        }}
        onChangeStatus={() => {
          setIsDetailDrawerOpen(false);
          setIsStatusModalOpen(true);
        }}
        onResetPassword={() => selectedMember && handleResetPassword(selectedMember)}
      />
    </AdminLayout>
  );
};

export default AdminTeam;
