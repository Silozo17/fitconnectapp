import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymMemberships } from "@/hooks/gym/useGymMemberships";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  Pause,
  Play,
  XCircle,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PauseMembershipDialog } from "../dialogs/PauseMembershipDialog";
import { CancelMembershipDialog } from "../dialogs/CancelMembershipDialog";
import { UnpauseMembershipDialog } from "../dialogs/UnpauseMembershipDialog";

interface Membership {
  id: string;
  member_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string | null;
  credits_remaining: number | null;
  cancel_at_period_end: boolean;
  paused_at: string | null;
  pause_until: string | null;
  member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
  };
  plan?: {
    id: string;
    name: string;
    price_amount: number;
    billing_interval: string | null;
  };
}

export function ActiveSubscriptionsTable() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [unpauseDialogOpen, setUnpauseDialogOpen] = useState(false);

  const { data: memberships, isLoading, refetch } = useGymMemberships({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const formatPrice = (amount: number, interval?: string | null) => {
    const formatted = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: gym?.currency || "GBP",
    }).format(amount / 100);

    if (interval) {
      return `${formatted}/${interval}`;
    }
    return formatted;
  };

  const getStatusBadge = (membership: Membership) => {
    if (membership.cancel_at_period_end) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Cancelling
        </Badge>
      );
    }
    
    switch (membership.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "paused":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            Paused
            {membership.pause_until && (
              <span className="ml-1">
                until {format(new Date(membership.pause_until), "MMM d")}
              </span>
            )}
          </Badge>
        );
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{membership.status}</Badge>;
    }
  };

  const handlePause = (membership: Membership) => {
    setSelectedMembership(membership);
    setPauseDialogOpen(true);
  };

  const handleUnpause = (membership: Membership) => {
    setSelectedMembership(membership);
    setUnpauseDialogOpen(true);
  };

  const handleCancel = (membership: Membership) => {
    setSelectedMembership(membership);
    setCancelDialogOpen(true);
  };

  // Filter memberships by search
  const filteredMemberships = memberships?.filter((m) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const memberName = `${m.member?.first_name || ""} ${m.member?.last_name || ""}`.toLowerCase();
    const email = (m.member?.email || "").toLowerCase();
    const planName = (m.plan?.name || "").toLowerCase();
    return memberName.includes(searchLower) || email.includes(searchLower) || planName.includes(searchLower);
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                Manage member subscriptions - pause, cancel, or modify
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by member, email, or plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : !filteredMemberships || filteredMemberships.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No subscriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={(membership.member as any)?.avatar_url || undefined} />
                          <AvatarFallback>
                            {membership.member?.first_name?.charAt(0) || ""}
                            {membership.member?.last_name?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {membership.member?.first_name} {membership.member?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {membership.member?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{membership.plan?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(
                            membership.plan?.price_amount || 0,
                            membership.plan?.billing_interval
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(membership)}</TableCell>
                    <TableCell>
                      {membership.current_period_end
                        ? format(new Date(membership.current_period_end), "PP")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {membership.credits_remaining !== null
                        ? membership.credits_remaining
                        : "∞"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/gym-admin/${gymId}/members/${membership.member_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Member
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {membership.status === "paused" ? (
                            <DropdownMenuItem onClick={() => handleUnpause(membership)}>
                              <Play className="mr-2 h-4 w-4" />
                              Resume Membership
                            </DropdownMenuItem>
                          ) : membership.status === "active" ? (
                            <DropdownMenuItem onClick={() => handlePause(membership)}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Membership
                            </DropdownMenuItem>
                          ) : null}
                          {membership.status !== "cancelled" && !membership.cancel_at_period_end && (
                            <DropdownMenuItem
                              onClick={() => handleCancel(membership)}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Membership
                            </DropdownMenuItem>
                          )}
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

      {/* Dialogs */}
      {selectedMembership && (
        <>
          <PauseMembershipDialog
            open={pauseDialogOpen}
            onOpenChange={setPauseDialogOpen}
            membership={selectedMembership}
            memberName={`${selectedMembership.member?.first_name} ${selectedMembership.member?.last_name}`}
          />
          <CancelMembershipDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            membership={selectedMembership}
            memberName={`${selectedMembership.member?.first_name} ${selectedMembership.member?.last_name}`}
          />
          <UnpauseMembershipDialog
            open={unpauseDialogOpen}
            onOpenChange={setUnpauseDialogOpen}
            membership={selectedMembership}
            memberName={`${selectedMembership.member?.first_name} ${selectedMembership.member?.last_name}`}
          />
        </>
      )}
    </>
  );
}
