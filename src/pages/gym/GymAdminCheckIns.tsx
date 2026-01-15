import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { useCheckInFeedback } from "@/hooks/gym/useCheckInFeedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, startOfDay, endOfDay, isToday } from "date-fns";
import {
  QrCode,
  Search,
  Check,
  X,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Volume2,
  VolumeX,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5QrcodeScanner } from "html5-qrcode";
import { cn } from "@/lib/utils";

interface CheckIn {
  id: string;
  checked_in_at: string;
  checked_out_at: string | null;
  check_in_method: string;
  member: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  class_session: {
    id: string;
    class_type: {
      name: string;
    } | null;
    scheduled_at: string;
  } | null;
}

interface MemberSearchResult {
  id: string;
  user_id: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  memberships: Array<{
    id: string;
    status: string;
    plan: {
      name: string;
    } | null;
  }>;
}

export default function GymAdminCheckIns() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [manualMemberId, setManualMemberId] = useState("");
  const [searchResults, setSearchResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Check-in feedback with audio/visual
  const { validateAndCheckIn, isProcessing, lastResult, flashColor } = useCheckInFeedback({
    gymId: gymId || "",
    onCheckInSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-checkins", gymId] });
      setSearchResults([]);
      setSearchQuery("");
    },
    onCheckInError: () => {
      // Errors are handled by the hook with notifications
    },
  });
  
  // Fetch today's check-ins
  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["gym-checkins", gymId, format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_check_ins")
        .select(`
          id,
          checked_in_at,
          checked_out_at,
          check_in_method,
          member:gym_members!inner(
            id,
            first_name, last_name, email
          ),
          class_session:gym_class_sessions(
            id,
            scheduled_at,
            class_type:gym_class_types(name)
          )
        `)
        .eq("gym_id", gymId)
        .gte("checked_in_at", startOfDay(selectedDate).toISOString())
        .lte("checked_in_at", endOfDay(selectedDate).toISOString())
        .order("checked_in_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as CheckIn[];
    },
    enabled: !!gymId,
  });

  // Manual check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (memberId: string) => {
      // Verify membership is active
      const { data: membership, error: membershipError } = await supabase
        .from("gym_memberships")
        .select("id, status, plan:membership_plans(name)")
        .eq("member_id", memberId)
        .eq("gym_id", gymId)
        .eq("status", "active")
        .maybeSingle();
      
      if (membershipError) throw membershipError;
      if (!membership) {
        throw new Error("Member does not have an active membership");
      }

      // Create check-in record
      const { data, error } = await supabase
        .from("gym_check_ins")
        .insert({
          gym_id: gymId!,
          member_id: memberId,
          check_in_method: "manual",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Member checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["gym-checkins", gymId] });
      setManualMemberId("");
      setSearchResults([]);
      setSearchQuery("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check in member");
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (checkInId: string) => {
      const { error } = await supabase
        .from("gym_check_ins")
        .update({ checked_out_at: new Date().toISOString() })
        .eq("id", checkInId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member checked out");
      queryClient.invalidateQueries({ queryKey: ["gym-checkins", gymId] });
    },
  });

  // Search members
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !gymId) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("gym_members")
        .select(`
          id,
          user_id,
          status,
          first_name, last_name, email,
          memberships:gym_memberships(id, status, plan:membership_plans(name))
        `)
        .eq("gym_id", gymId)
        .eq("status", "active")
        .limit(10);
      
      if (error) throw error;
      
      // Filter by search query
      const results = (data || []).filter((m: any) => {
        const name = `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
        const email = m.email?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query);
      }) as MemberSearchResult[];
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search members");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, gymId]);

  // QR Scanner Component with feedback integration
  const QrScannerDialog = () => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
      if (!showQrScanner) return;

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          // Expected format: gym-member:{memberId}
          const match = decodedText.match(/gym-member:([a-f0-9-]+)/);
          if (match) {
            setShowQrScanner(false);
            await validateAndCheckIn(match[1]);
          } else {
            toast.error("Invalid QR code format");
          }
        },
        (error) => {
          // Ignore scan errors (no QR code in view)
        }
      );

      return () => {
        scannerRef.current?.clear();
      };
    }, [showQrScanner]);

    return (
      <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Scan Member QR Code
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </DialogTitle>
            <DialogDescription>
              Point the camera at a member's QR code to check them in
            </DialogDescription>
          </DialogHeader>
          <div id="qr-reader" className="w-full" />
          
          {/* Last scan result */}
          {lastResult && (
            <div className={cn(
              "p-4 rounded-lg text-center",
              lastResult.success 
                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              <p className="font-medium">{lastResult.memberName}</p>
              {lastResult.success ? (
                <p className="text-sm">✓ Checked in successfully</p>
              ) : (
                <p className="text-sm">✗ {lastResult.reason}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const activeCheckIns = checkIns.filter((c) => !c.checked_out_at).length;
  const totalCheckIns = checkIns.length;

  return (
    <div className={cn(
      "space-y-6 transition-all duration-300",
      flashColor === "green" && "ring-4 ring-green-500 ring-opacity-50 rounded-lg",
      flashColor === "red" && "ring-4 ring-red-500 ring-opacity-50 rounded-lg"
    )}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-Ins</h1>
          <p className="text-muted-foreground">
            Manage member check-ins and attendance
          </p>
        </div>
        <Button onClick={() => setShowQrScanner(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currently In</p>
                <p className="text-2xl font-bold">{activeCheckIns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Today</p>
                <p className="text-2xl font-bold">{totalCheckIns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Check-In</CardTitle>
          <CardDescription>
            Search for a member to check them in manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((member) => {
                const activeMembership = member.memberships?.find(
                  (m) => m.status === "active"
                );
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeMembership ? (
                        <Badge variant="default" className="bg-green-500">
                          {(activeMembership.plan as any)?.name || "Active"}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">No Active Plan</Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => checkInMutation.mutate(member.id)}
                        disabled={!activeMembership || checkInMutation.isPending}
                      >
                        {checkInMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Check In
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-ins Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isToday(selectedDate) ? "Today's" : format(selectedDate, "MMM d")} Check-Ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No check-ins for this date
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {checkIn.member?.first_name}{" "}
                            {checkIn.member?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {checkIn.member?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(checkIn.checked_in_at), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{checkIn.check_in_method}</Badge>
                    </TableCell>
                    <TableCell>
                      {checkIn.class_session ? (
                        <span>
                          {(checkIn.class_session.class_type as any)?.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Open Gym</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {checkIn.checked_out_at ? (
                        <Badge variant="secondary">
                          <XCircle className="mr-1 h-3 w-3" />
                          Out at {format(new Date(checkIn.checked_out_at), "h:mm a")}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!checkIn.checked_out_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => checkOutMutation.mutate(checkIn.id)}
                          disabled={checkOutMutation.isPending}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Check Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <QrScannerDialog />
    </div>
  );
}
