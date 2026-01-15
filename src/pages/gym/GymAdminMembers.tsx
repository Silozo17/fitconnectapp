import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGymMembers, useDeleteGymMember } from "@/hooks/gym/useGymMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberFiltersPanel } from "@/components/gym/admin/members/MemberFiltersPanel";
import { DeleteConfirmDialog } from "@/components/gym/admin/dialogs/DeleteConfirmDialog";
import { AddMemberModal } from "@/components/gym/admin/dialogs/AddMemberModal";

export default function GymAdminMembers() {
  const { gymId } = useParams<{ gymId: string }>();
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    planId: "",
    joinedFrom: "",
    joinedTo: "",
    dobFrom: "",
    dobTo: "",
    noActiveMembership: false,
    expiringWithinDays: undefined as number | undefined,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useGymMembers({
    status: filters.status,
    search: filters.search || undefined,
    planId: filters.planId || undefined,
    joinedFrom: filters.joinedFrom || undefined,
    joinedTo: filters.joinedTo || undefined,
    dobFrom: filters.dobFrom || undefined,
    dobTo: filters.dobTo || undefined,
    noActiveMembership: filters.noActiveMembership,
    expiringWithinDays: filters.expiringWithinDays,
  });

  const deleteMember = useDeleteGymMember();

  const members = data?.members || [];
  const totalCount = data?.count || 0;

  const handleDeleteClick = (member: { id: string; first_name: string | null; last_name: string | null }) => {
    setMemberToDelete({
      id: member.id,
      name: `${member.first_name || ""} ${member.last_name || ""}`.trim() || "this member",
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    await deleteMember.mutateAsync({ memberId: memberToDelete.id });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage your gym members and their memberships.
          </p>
        </div>
        <Button onClick={() => setAddMemberOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <MemberFiltersPanel filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>All Members</CardTitle>
            <span className="text-sm text-muted-foreground">
              {totalCount} members
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No members found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {filters.search
                  ? "Try adjusting your search or filters."
                  : "Get started by adding your first member."}
              </p>
              {!filters.search && (
                <Button className="mt-4" asChild>
                  <Link to={`/gym-admin/${gymId}/members/new`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Link
                        to={`/gym-admin/${gymId}/members/${member.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.first_name?.charAt(0) || ""}
                            {member.last_name?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          {member.member_number && (
                            <p className="text-xs text-muted-foreground">
                              #{member.member_number}
                            </p>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.active_membership ? (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{member.active_membership.plan_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No active plan</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(member.joined_at), "PP")}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/gym-admin/${gymId}/members/${member.id}`}>
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/gym-admin/${gymId}/members/${member.id}/edit`}>
                              Edit Member
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Member
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Member"
        description={`Are you sure you want to delete ${memberToDelete?.name}? This will mark their account as deleted and they won't be able to access the gym portal.`}
        onConfirm={handleDeleteConfirm}
      />

      {/* Add Member Modal */}
      <AddMemberModal open={addMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}
