import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Check,
  X,
  Clock,
  Search,
  Save,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ClassBooking {
  id: string;
  member_id: string;
  status: string;
  booked_at: string;
  notes: string | null;
  member: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

interface ClassRegisterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  classTime: string;
}

type AttendanceStatus = "confirmed" | "attended" | "no_show" | "cancelled";

export function ClassRegister({
  open,
  onOpenChange,
  classId,
  className,
  classTime,
}: ClassRegisterProps) {
  const { gym } = useGym();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, { status?: AttendanceStatus; notes?: string }>>({});

  // Fetch class bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["class-bookings", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_class_bookings")
        .select(`
          id,
          member_id,
          status,
          booked_at,
          notes,
          member:member_id (
            id,
            first_name,
            last_name,
            avatar_url,
            email
          )
        `)
        .eq("class_id", classId)
        .order("booked_at", { ascending: true });

      if (error) throw error;
      return data as unknown as ClassBooking[];
    },
    enabled: open,
  });

  // Update booking mutation
  const updateBooking = useMutation({
    mutationFn: async ({ bookingId, status, notes }: { bookingId: string; status?: string; notes?: string }) => {
      const updateData: Record<string, any> = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { error } = await supabase
        .from("gym_class_bookings")
        .update(updateData)
        .eq("id", bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-bookings", classId] });
    },
  });

  // Save all changes
  const handleSaveAll = async () => {
    try {
      const updates = Object.entries(pendingChanges);
      for (const [bookingId, changes] of updates) {
        if (changes.status || changes.notes !== undefined) {
          await updateBooking.mutateAsync({
            bookingId,
            status: changes.status,
            notes: changes.notes,
          });
        }
      }
      setPendingChanges({});
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Failed to save attendance");
    }
  };

  const handleStatusChange = (bookingId: string, status: AttendanceStatus) => {
    setPendingChanges(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], status },
    }));
  };

  const handleNotesChange = (bookingId: string, notes: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], notes },
    }));
  };

  const filteredBookings = bookings?.filter(b => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      b.member?.first_name?.toLowerCase().includes(search) ||
      b.member?.last_name?.toLowerCase().includes(search) ||
      b.member?.email?.toLowerCase().includes(search)
    );
  });

  const attendedCount = bookings?.filter(b => 
    (pendingChanges[b.id]?.status || b.status) === "attended"
  ).length || 0;

  const noShowCount = bookings?.filter(b =>
    (pendingChanges[b.id]?.status || b.status) === "no_show"
  ).length || 0;

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Class Register - {className}
          </DialogTitle>
          <DialogDescription>
            {format(new Date(classTime), "EEEE, MMMM d 'at' h:mm a")} • {bookings?.length || 0} bookings
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex gap-4 pb-2">
          <Badge variant="secondary" className="gap-1">
            <UserCheck className="h-3 w-3" />
            {attendedCount} attended
          </Badge>
          <Badge variant="outline" className="gap-1">
            <UserX className="h-3 w-3" />
            {noShowCount} no-shows
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Bookings List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredBookings?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings?.map((booking) => {
                const currentStatus = pendingChanges[booking.id]?.status || booking.status;
                const currentNotes = pendingChanges[booking.id]?.notes ?? booking.notes ?? "";

                return (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.member?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {booking.member?.first_name || ""} {booking.member?.last_name || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.member?.email}
                          </p>
                        </div>
                        <Select
                          value={currentStatus}
                          onValueChange={(v) => handleStatusChange(booking.id, v as AttendanceStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Confirmed
                              </div>
                            </SelectItem>
                            <SelectItem value="attended">
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-500" />
                                Attended
                              </div>
                            </SelectItem>
                            <SelectItem value="no_show">
                              <div className="flex items-center gap-2">
                                <X className="h-3 w-3 text-red-500" />
                                No Show
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-2">
                                <X className="h-3 w-3" />
                                Cancelled
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        placeholder="Add notes..."
                        value={currentNotes}
                        onChange={(e) => handleNotesChange(booking.id, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSaveAll} disabled={!hasChanges || updateBooking.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateBooking.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
