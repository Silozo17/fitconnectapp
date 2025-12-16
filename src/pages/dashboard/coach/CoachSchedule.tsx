import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  Check,
  X,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCoachAvailability,
  useSessionTypes,
  useBookingRequests,
  useUpdateAvailability,
  useUpsertSessionType,
  useRespondToBooking,
  type SessionType,
} from "@/hooks/useCoachSchedule";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getCurrencySymbol, type CurrencyCode } from "@/lib/currency";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const CoachSchedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [coachCurrency, setCoachCurrency] = useState<CurrencyCode>("GBP");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);
  const [editingSessionType, setEditingSessionType] = useState<SessionType | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  
  // Form state for session type
  const [sessionTypeName, setSessionTypeName] = useState("");
  const [sessionTypeDescription, setSessionTypeDescription] = useState("");
  const [sessionTypeDuration, setSessionTypeDuration] = useState("60");
  const [sessionTypePrice, setSessionTypePrice] = useState("");
  const [sessionTypeOnline, setSessionTypeOnline] = useState(true);
  const [sessionTypeInPerson, setSessionTypeInPerson] = useState(false);
  
  // Form state for availability
  const [availStartTime, setAvailStartTime] = useState("09:00");
  const [availEndTime, setAvailEndTime] = useState("18:00");
  const [availEnabled, setAvailEnabled] = useState(true);

  // Get coach profile ID and currency
  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, currency")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setCoachId(data.id);
        setCoachCurrency((data.currency as CurrencyCode) || "GBP");
      }
    };
    fetchCoachProfile();
  }, [user]);

  // Queries
  const { data: availability = [], isLoading: loadingAvailability } = useCoachAvailability(coachId || "");
  const { data: sessionTypes = [], isLoading: loadingSessionTypes } = useSessionTypes(coachId || "");
  const { data: bookingRequests = [], isLoading: loadingRequests } = useBookingRequests();
  
  // Fetch coaching sessions for calendar
  const { data: sessions = [] } = useQuery({
    queryKey: ["coaching-sessions", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select(`
          *,
          client:client_profiles!coaching_sessions_client_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("coach_id", coachId)
        .gte("scheduled_at", weekStart.toISOString())
        .lte("scheduled_at", addDays(weekStart, 7).toISOString())
        .order("scheduled_at");
      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  });

  // Mutations
  const updateAvailability = useUpdateAvailability();
  const upsertSessionType = useUpsertSessionType();
  const respondToBooking = useRespondToBooking();

  // Real-time subscription for booking requests
  useEffect(() => {
    if (!coachId) return;

    const channel = supabase
      .channel("booking-requests-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking_requests",
          filter: `coach_id=eq.${coachId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
          toast.info("New booking request received!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachId, queryClient]);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSaveSessionType = async () => {
    if (!coachId || !sessionTypeName || !sessionTypePrice) return;

    await upsertSessionType.mutateAsync({
      id: editingSessionType?.id,
      coach_id: coachId,
      name: sessionTypeName,
      description: sessionTypeDescription || null,
      duration_minutes: parseInt(sessionTypeDuration),
      price: parseFloat(sessionTypePrice),
      currency: coachCurrency,
      is_online: sessionTypeOnline,
      is_in_person: sessionTypeInPerson,
      is_active: true,
    });

    setShowSessionTypeModal(false);
    resetSessionTypeForm();
  };

  const resetSessionTypeForm = () => {
    setEditingSessionType(null);
    setSessionTypeName("");
    setSessionTypeDescription("");
    setSessionTypeDuration("60");
    setSessionTypePrice("");
    setSessionTypeOnline(true);
    setSessionTypeInPerson(false);
  };

  const handleEditSessionType = (type: SessionType) => {
    setEditingSessionType(type);
    setSessionTypeName(type.name);
    setSessionTypeDescription(type.description || "");
    setSessionTypeDuration(type.duration_minutes.toString());
    setSessionTypePrice(type.price.toString());
    setSessionTypeOnline(type.is_online);
    setSessionTypeInPerson(type.is_in_person);
    setShowSessionTypeModal(true);
  };

  const handleSaveAvailability = async () => {
    if (!coachId || editingDay === null) return;

    await updateAvailability.mutateAsync({
      coach_id: coachId,
      day_of_week: editingDay,
      start_time: availStartTime,
      end_time: availEndTime,
      is_active: availEnabled,
    });

    setShowAvailabilityModal(false);
  };

  const handleEditAvailability = (dayIndex: number) => {
    const existing = availability.find(a => a.day_of_week === dayIndex);
    setEditingDay(dayIndex);
    setAvailStartTime(existing?.start_time?.slice(0, 5) || "09:00");
    setAvailEndTime(existing?.end_time?.slice(0, 5) || "18:00");
    setAvailEnabled(existing?.is_active ?? true);
    setShowAvailabilityModal(true);
  };

  const getSessionForSlot = (dayIndex: number, time: string) => {
    const date = weekDates[dayIndex];
    return sessions.find(s => {
      const sessionDate = parseISO(s.scheduled_at);
      const sessionTime = format(sessionDate, "HH:mm");
      return isSameDay(sessionDate, date) && sessionTime === time;
    });
  };

  const currentWeekLabel = `${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "d, yyyy")}`;

  return (
    <DashboardLayout title="Schedule" description="Manage your availability and bookings.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Manage your calendar, availability, and booking requests</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="requests">
            Booking Requests
            {bookingRequests.length > 0 && (
              <Badge className="ml-2 bg-accent text-accent-foreground">{bookingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          {/* Week Navigation */}
          <div className="card-elevated p-4 mb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(prev => addDays(prev, -7))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-display font-bold text-foreground">{currentWeekLabel}</span>
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(prev => addDays(prev, 7))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b border-border">
                  <div className="p-3 text-sm text-muted-foreground"></div>
                  {weekDates.map((date, index) => (
                    <div key={index} className="p-3 text-center border-l border-border">
                      <p className="text-sm text-muted-foreground">{weekDays[index]}</p>
                      <p className="text-lg font-bold text-foreground">{format(date, "d")}</p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-border">
                    <div className="p-3 text-sm text-muted-foreground">{time}</div>
                    {weekDates.map((_, dayIndex) => {
                      const session = getSessionForSlot(dayIndex, time);
                      return (
                        <div
                          key={dayIndex}
                          className="p-1 border-l border-border min-h-[60px] hover:bg-secondary/30 transition-colors cursor-pointer"
                        >
                          {session && (
                            <div className={`p-2 rounded-lg text-xs ${
                              session.is_online 
                                ? 'bg-primary/20 border border-primary/30' 
                                : 'bg-accent/20 border border-accent/30'
                            }`}>
                              <p className="font-medium text-foreground truncate">
                                {session.client?.first_name} {session.client?.last_name}
                              </p>
                              <p className="text-muted-foreground truncate">{session.session_type}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {session.is_online ? (
                                  <Video className="w-3 h-3 text-primary" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-accent" />
                                )}
                                <span className="text-muted-foreground">{session.duration_minutes}m</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30" />
              <span className="text-sm text-muted-foreground">In-Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
          </div>
        </TabsContent>

        {/* Booking Requests Tab */}
        <TabsContent value="requests">
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Pending Requests</h3>
            </div>
            {loadingRequests ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookingRequests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No pending booking requests</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {bookingRequests.map((request) => (
                  <div key={request.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {request.client?.first_name?.[0]}{request.client?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {request.client?.first_name} {request.client?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.session_type?.name || "General Session"}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(parseISO(request.requested_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {request.is_online ? (
                            <Badge variant="outline" className="text-xs">
                              <Video className="w-3 h-3 mr-1" /> Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" /> In-Person
                            </Badge>
                          )}
                        </div>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mt-2 italic">"{request.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => respondToBooking.mutate({ requestId: request.id, status: "rejected" })}
                        disabled={respondToBooking.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => respondToBooking.mutate({ requestId: request.id, status: "accepted" })}
                        disabled={respondToBooking.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Weekly Availability</h3>
              <p className="text-sm text-muted-foreground">Set your default working hours</p>
            </div>
            {loadingAvailability ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const dayAvail = availability.find(a => a.day_of_week === dayIndex);
                  const isEnabled = dayAvail?.is_active ?? false;
                  
                  return (
                    <div key={dayIndex} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={isEnabled} 
                          onCheckedChange={(checked) => {
                            if (coachId) {
                              updateAvailability.mutate({
                                coach_id: coachId,
                                day_of_week: dayIndex,
                                start_time: dayAvail?.start_time || "09:00:00",
                                end_time: dayAvail?.end_time || "18:00:00",
                                is_active: checked,
                              });
                            }
                          }}
                        />
                        <span className={`font-medium ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {dayNames[dayIndex]}
                        </span>
                      </div>
                      {isEnabled && dayAvail && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {dayAvail.start_time?.slice(0, 5)} - {dayAvail.end_time?.slice(0, 5)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditAvailability(dayIndex)}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                      {!dayAvail && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditAvailability(dayIndex)}
                        >
                          Set Hours
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Types */}
          <div className="card-elevated mt-6">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-foreground">Session Types</h3>
                <p className="text-sm text-muted-foreground">Define your service offerings</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                resetSessionTypeForm();
                setShowSessionTypeModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </div>
            {loadingSessionTypes ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessionTypes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No session types yet</p>
                <Button onClick={() => {
                  resetSessionTypeForm();
                  setShowSessionTypeModal(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Session Type
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sessionTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {type.duration_minutes} min - {getCurrencySymbol((type.currency as CurrencyCode) || coachCurrency)}{type.price}
                        {type.is_online && " • Online"}
                        {type.is_in_person && " • In-Person"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditSessionType(type)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Type Modal */}
      <Dialog open={showSessionTypeModal} onOpenChange={setShowSessionTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSessionType ? "Edit" : "Add"} Session Type</DialogTitle>
            <DialogDescription>
              Define a service offering for your clients to book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                placeholder="e.g., Personal Training Session"
                value={sessionTypeName}
                onChange={(e) => setSessionTypeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input 
                placeholder="Brief description of the session"
                value={sessionTypeDescription}
                onChange={(e) => setSessionTypeDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input 
                  type="number"
                  placeholder="60"
                  value={sessionTypeDuration}
                  onChange={(e) => setSessionTypeDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Price ({getCurrencySymbol(coachCurrency)})</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={sessionTypePrice}
                  onChange={(e) => setSessionTypePrice(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={sessionTypeOnline}
                  onCheckedChange={setSessionTypeOnline}
                />
                <Label className="font-normal">Online</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={sessionTypeInPerson}
                  onCheckedChange={setSessionTypeInPerson}
                />
                <Label className="font-normal">In-Person</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionTypeModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSessionType}
              disabled={!sessionTypeName || !sessionTypePrice || upsertSessionType.isPending}
            >
              {upsertSessionType.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Modal */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability - {editingDay !== null ? dayNames[editingDay] : ""}</DialogTitle>
            <DialogDescription>
              Set your working hours for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Switch checked={availEnabled} onCheckedChange={setAvailEnabled} />
              <Label>Available on this day</Label>
            </div>
            {availEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time"
                    value={availStartTime}
                    onChange={(e) => setAvailStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time"
                    value={availEndTime}
                    onChange={(e) => setAvailEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAvailability}
              disabled={updateAvailability.isPending}
            >
              {updateAvailability.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CoachSchedule;
