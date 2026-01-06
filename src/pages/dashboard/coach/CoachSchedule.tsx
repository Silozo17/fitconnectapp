import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  CreditCard,
  Banknote,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AddCoachSessionModal } from "@/components/dashboard/coach/AddCoachSessionModal";
import { MobileCalendarView } from "@/components/dashboard/coach/MobileCalendarView";
import { SessionDetailModal } from "@/components/dashboard/clients/SessionDetailModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeTimeInput } from "@/components/ui/native-time-input";
import { VenueAutocomplete } from "@/components/shared/VenueAutocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format, addDays, startOfWeek, isSameDay, isSameWeek, parseISO } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getCurrencySymbol, type CurrencyCode } from "@/lib/currency";
import { useCoachBoostStatus } from "@/hooks/useCoachBoost";
import { useExternalCalendarEvents, useSyncExternalCalendar } from "@/hooks/useExternalCalendarEvents";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

// Day names used for availability - will be translated
const dayIndexMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
// Full 24-hour time slots
const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

type PaymentRequired = "none" | "deposit" | "full";
type DepositType = "percentage" | "fixed";

const CoachSchedule = () => {
  const { user } = useAuth();
  const { t } = useTranslation('coach');
  const queryClient = useQueryClient();
  
  // Translated day arrays
  const weekDays = [
    t("schedule.days.mon"), t("schedule.days.tue"), t("schedule.days.wed"),
    t("schedule.days.thu"), t("schedule.days.fri"), t("schedule.days.sat"), t("schedule.days.sun")
  ];
  const dayNames = [
    t("schedule.days.sunday"), t("schedule.days.monday"), t("schedule.days.tuesday"),
    t("schedule.days.wednesday"), t("schedule.days.thursday"), t("schedule.days.friday"), t("schedule.days.saturday")
  ];
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
  
  // Payment requirement state for session type
  const [paymentRequired, setPaymentRequired] = useState<PaymentRequired>("none");
  const [depositType, setDepositType] = useState<DepositType>("percentage");
  const [depositValue, setDepositValue] = useState("");
  
  // Form state for availability
  const [availStartTime, setAvailStartTime] = useState("09:00");
  const [availEndTime, setAvailEndTime] = useState("18:00");
  const [availEnabled, setAvailEnabled] = useState(true);

  // Booking settings state
  const [bookingMode, setBookingMode] = useState<"direct" | "message_first">("direct");
  const [preBookingBuffer, setPreBookingBuffer] = useState("60");
  const [postBookingBuffer, setPostBookingBuffer] = useState("15");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Add Session Modal state
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>();
  
  // Session Detail Modal state
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false);
  
  // Calendar scroll ref
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  
  // Responsive detection
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get coach profile ID, currency, and booking settings
  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id, currency, booking_mode, pre_booking_buffer_minutes, post_booking_buffer_minutes, default_session_location, stripe_connect_onboarded")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setCoachId(data.id);
        setCoachCurrency((data.currency as CurrencyCode) || "GBP");
        setBookingMode((data.booking_mode as "direct" | "message_first") || "direct");
        setPreBookingBuffer(String(data.pre_booking_buffer_minutes || 60));
        setPostBookingBuffer(String(data.post_booking_buffer_minutes || 15));
        setDefaultLocation(data.default_session_location || "");
        setStripeConnected(!!data.stripe_connect_onboarded);
      }
    };
    fetchCoachProfile();
  }, [user]);

  // Queries
  const { data: availability = [], isLoading: loadingAvailability } = useCoachAvailability(coachId || "");
  const { data: sessionTypes = [], isLoading: loadingSessionTypes } = useSessionTypes(coachId || "");
  const { data: bookingRequests = [], isLoading: loadingRequests } = useBookingRequests();
  const { data: boostStatus } = useCoachBoostStatus();
  
  // External calendar events
  const weekEnd = addDays(weekStart, 7);
  const { data: externalEvents = [], refetch: refetchExternalEvents } = useExternalCalendarEvents(
    user?.id,
    weekStart,
    weekEnd
  );
  const { syncCalendar } = useSyncExternalCalendar();
  const { data: sessions = [] } = useQuery({
    queryKey: ["coaching-sessions", coachId, weekStart.toISOString()],
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Real-time subscription for sessions (calendar updates)
  useEffect(() => {
    if (!coachId) return;

    const channel = supabase
      .channel("coaching-sessions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "coaching_sessions",
          filter: `coach_id=eq.${coachId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["coaching-sessions", coachId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachId, queryClient]);

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
          toast.info(t("schedule.newBookingRequest"));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coachId, queryClient]);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Sync external calendars
  const handleSyncCalendars = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncCalendar();
      await refetchExternalEvents();
      toast.success(t("schedule.calendarsSuccess"));
    } catch (error) {
      console.error("Failed to sync calendars:", error);
      toast.error(t("schedule.calendarsFailed"));
    } finally {
      setIsSyncing(false);
    }
  }, [syncCalendar, refetchExternalEvents]);

  // Trigger initial sync on mount
  useEffect(() => {
    if (user?.id) {
      // Delay initial sync slightly to avoid race conditions
      const timer = setTimeout(() => {
        syncCalendar()
          .then(() => refetchExternalEvents())
          .catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Get external event for a time slot (skip all-day events - they're shown as banners)
  const getExternalEventForSlot = (dayIndex: number, time: string) => {
    const date = weekDates[dayIndex];
    const slotStart = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour slot

    return externalEvents.find(event => {
      if (event.is_all_day) return false; // Skip all-day events
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return eventStart < slotEnd && eventEnd > slotStart;
    });
  };

  // Get all-day events for a specific day
  const getAllDayEventsForDate = (dayIndex: number) => {
    const date = weekDates[dayIndex];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return externalEvents.filter(event => {
      if (!event.is_all_day) return false;
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  // Check if a time slot is within coach availability
  const isWithinAvailability = (dayIndex: number, time: string) => {
    const dayOfWeek = (dayIndex + 1) % 7; // Convert Mon=0 to Sun=0 format
    const dayAvail = availability.find(a => a.day_of_week === dayOfWeek && a.is_active);
    if (!dayAvail) return false;
    const [slotHour] = time.split(':').map(Number);
    const [startHour] = (dayAvail.start_time || '09:00').split(':').map(Number);
    const [endHour] = (dayAvail.end_time || '18:00').split(':').map(Number);
    return slotHour >= startHour && slotHour < endHour;
  };

  // Handle clicking on a calendar slot
  const handleSlotClick = (dayIndex: number, time: string) => {
    setPreselectedDate(weekDates[dayIndex]);
    setPreselectedTime(time);
    setShowAddSessionModal(true);
  };

  // Scroll to 6am on mount
  useEffect(() => {
    if (calendarScrollRef.current) {
      const slot6am = 6 * 60; // 6am = 6 * 60px height per slot
      calendarScrollRef.current.scrollTop = slot6am;
    }
  }, []);

  const handleSaveSessionType = async () => {
    if (!coachId || !sessionTypeName || !sessionTypePrice) return;

    // Check if Boost is active and this would remove the last payment-required session type
    if (boostStatus?.is_active && paymentRequired === "none") {
      const otherPaymentSessions = sessionTypes.filter(
        st => st.id !== editingSessionType?.id && st.payment_required !== "none" && st.is_active
      );
      
      if (otherPaymentSessions.length === 0) {
        toast.error(
          t("schedule.sessionTypeModal.boostPaymentError"),
          { duration: 6000 }
        );
        return;
      }
    }

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
      payment_required: paymentRequired,
      deposit_type: paymentRequired === "deposit" ? depositType : null,
      deposit_value: paymentRequired === "deposit" ? parseFloat(depositValue) || null : null,
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
    setPaymentRequired("none");
    setDepositType("percentage");
    setDepositValue("");
  };

  const handleEditSessionType = (type: SessionType) => {
    setEditingSessionType(type);
    setSessionTypeName(type.name);
    setSessionTypeDescription(type.description || "");
    setSessionTypeDuration(type.duration_minutes.toString());
    setSessionTypePrice(type.price.toString());
    setSessionTypeOnline(type.is_online);
    setSessionTypeInPerson(type.is_in_person);
    setPaymentRequired((type.payment_required as PaymentRequired) || "none");
    setDepositType((type.deposit_type as DepositType) || "percentage");
    setDepositValue(type.deposit_value?.toString() || "");
    setShowSessionTypeModal(true);
  };

  // Helper to format currency
  const formatCurrency = (amount: number, currency: string = coachCurrency) => {
    return `${getCurrencySymbol(currency as CurrencyCode)}${amount.toFixed(2)}`;
  };

  // Helper to get payment status badge
  const getPaymentStatusBadge = (request: ReturnType<typeof useBookingRequests>["data"][0]) => {
    const paymentReq = request.payment_required || "none";
    const paymentStatus = request.payment_status || "not_required";
    const amountPaid = request.amount_paid || 0;
    const amountDue = request.amount_due || 0;
    const currency = request.currency || coachCurrency;

    if (paymentReq === "none" || paymentStatus === "not_required") {
      return null;
    }

    if (paymentStatus === "paid") {
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          <CreditCard className="w-3 h-3 mr-1" />
          {t("schedule.payment.paid")} {formatCurrency(amountPaid, currency)}
        </Badge>
      );
    }

    if (paymentStatus === "deposit_paid") {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <Banknote className="w-3 h-3 mr-1" />
          {t("schedule.payment.depositPaid")} {formatCurrency(amountPaid, currency)}
        </Badge>
      );
    }

    if (paymentStatus === "pending") {
      return (
        <Badge variant="outline" className="text-warning border-warning/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t("schedule.payment.awaiting")} {formatCurrency(amountDue, currency)}
        </Badge>
      );
    }

    return null;
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

  // Save booking settings
  const handleSaveBookingSettings = async () => {
    if (!coachId) return;
    
    const { error } = await supabase
      .from("coach_profiles")
      .update({
        booking_mode: bookingMode,
        pre_booking_buffer_minutes: parseInt(preBookingBuffer),
        post_booking_buffer_minutes: parseInt(postBookingBuffer),
        default_session_location: defaultLocation || null,
      })
      .eq("id", coachId);
    
    if (error) {
      toast.error(t("schedule.bookingSettings.settingsFailed"));
    } else {
      toast.success(t("schedule.bookingSettings.settingsSaved"));
    }
  };

  // Get session for slot - return session if it STARTS within this hour
  const getSessionForSlot = (dayIndex: number, time: string) => {
    const date = weekDates[dayIndex];
    const [slotHour] = time.split(':').map(Number);
    
    return sessions.find(s => {
      const sessionDate = parseISO(s.scheduled_at);
      const sessionHour = sessionDate.getHours();
      return isSameDay(sessionDate, date) && sessionHour === slotHour;
    });
  };

  // Calculate top offset (in pixels) based on start minute within the hour slot
  // Each hour slot is 60px, so 1 minute = 1px
  const getSessionTopOffset = (session: typeof sessions[0]) => {
    const sessionDate = parseISO(session.scheduled_at);
    return sessionDate.getMinutes(); // 0, 15, 30, 45, etc.
  };

  // Calculate session height in pixels based on duration (1 minute = 1px)
  const getSessionHeight = (session: typeof sessions[0]) => {
    return session.duration_minutes;
  };

  // Check if a slot is covered by a session that started in an earlier hour
  const isSlotCoveredBySession = (dayIndex: number, time: string) => {
    const date = weekDates[dayIndex];
    const [slotHour] = time.split(':').map(Number);
    const slotStartMinutes = slotHour * 60;
    
    return sessions.find(s => {
      const sessionDate = parseISO(s.scheduled_at);
      if (!isSameDay(sessionDate, date)) return false;
      
      const sessionStartHour = sessionDate.getHours();
      const sessionStartMinutes = sessionStartHour * 60 + sessionDate.getMinutes();
      const sessionEndMinutes = sessionStartMinutes + s.duration_minutes;
      
      // This slot is "covered" if session started before this slot AND extends into this slot
      // But only if the session didn't START in this slot's hour
      if (sessionStartHour === slotHour) return false;
      
      return sessionStartMinutes < slotStartMinutes && sessionEndMinutes > slotStartMinutes;
    });
  };

  // Check if a slot is covered by a multi-hour external event
  const isSlotCoveredByEvent = (dayIndex: number, time: string) => {
    const date = weekDates[dayIndex];
    const [slotHour] = time.split(':').map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(slotHour, 0, 0, 0);
    
    const event = externalEvents.find(e => {
      if (e.is_all_day) return false;
      const eventStart = new Date(e.start_time);
      const eventEnd = new Date(e.end_time);
      
      // Check if slot is within the event but not at the start hour
      if (!isSameDay(eventStart, date) && !isSameDay(eventEnd, date)) return false;
      
      const eventStartHour = eventStart.getHours();
      return slotHour > eventStartHour && slotStart < eventEnd && slotStart >= eventStart;
    });
    
    return event;
  };

  // Get external event span in hours
  const getEventSpan = (event: typeof externalEvents[0], dayIndex: number) => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const hoursSpan = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
    return Math.max(1, Math.ceil(hoursSpan));
  };

  // Check if viewing current week
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  // Get week label - show both months/years if spanning
  const weekEndDate = addDays(weekStart, 6);
  const startYear = format(weekStart, "yyyy");
  const endYear = format(weekEndDate, "yyyy");
  const startMonth = format(weekStart, "MMM");
  const endMonth = format(weekEndDate, "MMM");
  
  let currentWeekLabel: string;
  if (startYear !== endYear) {
    // Crossing year boundary: "Dec 29, 2025 - Jan 4, 2026"
    currentWeekLabel = `${format(weekStart, "MMM d, yyyy")} - ${format(weekEndDate, "MMM d, yyyy")}`;
  } else if (startMonth !== endMonth) {
    // Same year, different months: "Dec 22 - Jan 4, 2026"
    currentWeekLabel = `${format(weekStart, "MMM d")} - ${format(weekEndDate, "MMM d, yyyy")}`;
  } else {
    // Same month: "Dec 22 - 28, 2025"
    currentWeekLabel = `${format(weekStart, "MMM d")} - ${format(weekEndDate, "d, yyyy")}`;
  }

  // Navigate to today's week
  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <DashboardLayout title={t("schedule.title")} description={t("schedule.description")}>
      <PageHelpBanner
        pageKey="coach_schedule"
        title="Your Schedule"
        description="Manage availability, view bookings, and handle session requests"
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("schedule.title")}</h1>
          <p className="text-muted-foreground">{t("schedule.pageDescription")}</p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={() => {
          setPreselectedDate(undefined);
          setPreselectedTime(undefined);
          setShowAddSessionModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {t("schedule.addSession")}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="calendar">{t("schedule.calendar")}</TabsTrigger>
          <TabsTrigger value="requests">
            {t("schedule.bookingRequests")}
            {bookingRequests.length > 0 && (
              <Badge className="ml-2 bg-accent text-accent-foreground">{bookingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability">{t("schedule.availability")}</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          {isMobile ? (
            <MobileCalendarView
              sessions={sessions}
              externalEvents={externalEvents}
              onAddSession={(date, time) => {
                setPreselectedDate(date);
                setPreselectedTime(time);
                setShowAddSessionModal(true);
              }}
              onSync={handleSyncCalendars}
              isSyncing={isSyncing}
            />
          ) : (
            <>
              {/* Week Navigation */}
              <Card variant="glass" className="relative overflow-hidden p-4 mb-4">
                {/* Primary accent line for calendar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent" />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={() => setWeekStart(prev => addDays(prev, -7))}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    {!isCurrentWeek && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToToday}
                        className="text-primary border-primary/30 hover:bg-primary/10"
                      >
                        {t("schedule.today")}
                      </Button>
                    )}
                    <span className="font-display font-bold text-foreground">{currentWeekLabel}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSyncCalendars}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      {t("schedule.syncCalendars")}
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setWeekStart(prev => addDays(prev, 7))}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>

              {/* Calendar Grid with absolute positioning for multi-hour events */}
              <Card variant="glass" className="relative overflow-hidden">
                {/* Primary accent line for calendar grid */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent z-10" />
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

                    {/* All-Day Events Row */}
                    <div className="grid grid-cols-8 border-b border-border bg-muted/30">
                      <div className="p-2 text-xs text-muted-foreground flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {t("schedule.allDay")}
                      </div>
                      {weekDates.map((_, dayIndex) => {
                        const allDayEvents = getAllDayEventsForDate(dayIndex);
                        return (
                          <div key={dayIndex} className="p-1 border-l border-border min-h-[40px]">
                            {allDayEvents.map((event, idx) => (
                              <div key={idx} className="p-1.5 rounded text-xs bg-warning/20 border border-warning/30 mb-1">
                                <p className="font-medium text-warning-foreground truncate">
                                  {event.title || t("schedule.busy")}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {/* Time Slots with absolute positioned events */}
                    <div ref={calendarScrollRef} className="max-h-[600px] overflow-y-auto relative">
                      {/* Grid lines */}
                      {timeSlots.map((time) => (
                        <div key={time} className="grid grid-cols-8 border-b border-border">
                          <div className="p-3 text-sm text-muted-foreground h-[60px]">{time}</div>
                          {weekDates.map((_, dayIndex) => {
                            const isAvailable = isWithinAvailability(dayIndex, time);
                            const isCoveredBySession = isSlotCoveredBySession(dayIndex, time);
                            const isCoveredByEvent = isSlotCoveredByEvent(dayIndex, time);
                            
                            // Skip rendering clickable area if covered by multi-hour event
                            if (isCoveredBySession || isCoveredByEvent) {
                              return (
                                <div
                                  key={dayIndex}
                                  className={`border-l border-border h-[60px] ${
                                    isAvailable ? 'bg-success/5' : ''
                                  }`}
                                />
                              );
                            }
                            
                            const session = getSessionForSlot(dayIndex, time);
                            const externalEvent = !session ? getExternalEventForSlot(dayIndex, time) : null;
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`p-1 border-l border-border h-[60px] transition-colors cursor-pointer relative ${
                                  isAvailable ? 'bg-success/5 hover:bg-success/10' : 'hover:bg-secondary/30'
                                }`}
                                onClick={() => !session && !externalEvent && handleSlotClick(dayIndex, time)}
                              >
                                {session && (
                                  <div 
                                    className={`absolute left-1 right-1 rounded-lg text-xs z-10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${
                                      session.is_online 
                                        ? 'bg-primary/20 border border-primary/30' 
                                        : 'bg-accent/20 border border-accent/30'
                                    }`}
                                    style={{
                                      top: `${getSessionTopOffset(session)}px`,
                                      height: `${getSessionHeight(session) - 4}px`
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSession({
                                        id: session.id,
                                        clientName: `${session.client?.first_name || ''} ${session.client?.last_name || ''}`.trim() || 'Unknown Client',
                                        sessionType: session.session_type || 'Session',
                                        scheduledAt: session.scheduled_at,
                                        duration: session.duration_minutes,
                                        status: session.status as "scheduled" | "completed" | "cancelled" | "no_show",
                                        isOnline: session.is_online || false,
                                        location: session.location,
                                        notes: session.notes,
                                        videoMeetingUrl: session.video_meeting_url,
                                        rescheduledFrom: session.rescheduled_from,
                                        hasReview: false,
                                      });
                                      setShowSessionDetailModal(true);
                                    }}
                                  >
                                    <div className="p-2 h-full flex items-center">
                                      <p className="font-medium text-foreground truncate">
                                        {session.client?.first_name} {session.client?.last_name || t("schedule.externalClient")}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {externalEvent && (
                                  <div 
                                    className="absolute left-1 right-1 top-1 rounded-lg text-xs bg-muted/50 border border-muted-foreground/20 z-10 overflow-hidden"
                                    style={{
                                      height: `${getEventSpan(externalEvent, dayIndex) * 60 - 8}px`
                                    }}
                                  >
                                    <div className="p-2">
                                      <p className="font-medium text-muted-foreground truncate">
                                        {externalEvent.title || t("schedule.busy")}
                                      </p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <CalendarDays className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">
                                          {externalEvent.source === 'apple_calendar' ? 'iCloud' : 'Google'}
                                        </span>
                                      </div>
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
              </Card>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success/10 border border-success/30" />
                  <span className="text-sm text-muted-foreground">{t("schedule.legend.available")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30" />
                  <span className="text-sm text-muted-foreground">{t("schedule.legend.inPerson")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
                  <span className="text-sm text-muted-foreground">{t("schedule.legend.online")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/50 border border-muted-foreground/20" />
                  <span className="text-sm text-muted-foreground">{t("schedule.legend.externalCalendar")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                  <span className="text-sm text-muted-foreground">{t("schedule.legend.allDayHoliday")}</span>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Booking Requests Tab */}
        <TabsContent value="requests">
          <Card variant="glass" className="relative overflow-hidden">
            {/* Orange accent line for pending requests */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400/60 via-orange-500/40 to-transparent" />
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">{t("schedule.pendingRequests")}</h3>
            </div>
            {loadingRequests ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : bookingRequests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">{t("schedule.noPendingRequests")}</p>
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
                        <p className="text-sm text-muted-foreground">{request.session_type?.name || t("schedule.generalSession")}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(parseISO(request.requested_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {request.is_online ? (
                            <Badge variant="outline" className="text-xs">
                              <Video className="w-3 h-3 mr-1" /> {t("schedule.online")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" /> {t("schedule.inPerson")}
                            </Badge>
                          )}
                          {getPaymentStatusBadge(request)}
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
                        {t("schedule.decline")}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => respondToBooking.mutate({ requestId: request.id, status: "accepted" })}
                        disabled={respondToBooking.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t("schedule.accept")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          {/* Stripe Connect Banner */}
          {!stripeConnected && (
            <div className="glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-l-4 border-l-warning">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{t("schedule.stripeConnect.title")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("schedule.stripeConnect.description")}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="shrink-0 border-warning/50 hover:bg-warning/10">
                <Link to="/dashboard/coach/settings?tab=subscription">
                  {t("schedule.stripeConnect.connectButton")}
                </Link>
              </Button>
            </div>
          )}

          {/* Booking Settings Card */}
          <Card variant="glass" className="relative overflow-hidden">
            {/* White accent line for settings */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">{t("schedule.bookingSettings.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("schedule.bookingSettings.subtitle")}</p>
            </div>
            <div className="p-4 space-y-6">
              {/* Booking Approval */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">{t("schedule.bookingSettings.requireApproval")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("schedule.bookingSettings.requireApprovalDesc")}
                  </p>
                </div>
                <Switch
                  checked={bookingMode === "message_first"}
                  onCheckedChange={(checked) => setBookingMode(checked ? "message_first" : "direct")}
                />
              </div>

              {/* Pre-booking Buffer */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("schedule.bookingSettings.minBookingNotice")}</Label>
                  <Select value={preBookingBuffer} onValueChange={setPreBookingBuffer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">{t("schedule.bufferOptions.1hr")}</SelectItem>
                      <SelectItem value="120">{t("schedule.bufferOptions.2hr")}</SelectItem>
                      <SelectItem value="240">{t("schedule.bufferOptions.4hr")}</SelectItem>
                      <SelectItem value="720">{t("schedule.bufferOptions.12hr")}</SelectItem>
                      <SelectItem value="1440">{t("schedule.bufferOptions.24hr")}</SelectItem>
                      <SelectItem value="2880">{t("schedule.bufferOptions.48hr")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("schedule.bookingSettings.bookAtLeast")}
                  </p>
                </div>

                {/* Post-booking Buffer */}
                <div className="space-y-2">
                  <Label>{t("schedule.bookingSettings.bufferBetweenSessions")}</Label>
                  <Select value={postBookingBuffer} onValueChange={setPostBookingBuffer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("schedule.bufferOptions.noBuffer")}</SelectItem>
                      <SelectItem value="15">{t("schedule.bufferOptions.15min")}</SelectItem>
                      <SelectItem value="30">{t("schedule.bufferOptions.30min")}</SelectItem>
                      <SelectItem value="45">{t("schedule.bufferOptions.45min")}</SelectItem>
                      <SelectItem value="60">{t("schedule.bufferOptions.1hr")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("schedule.bookingSettings.bufferDescription")}
                  </p>
                </div>
              </div>

              {/* Default Location */}
              <div className="space-y-2">
                <Label>{t("schedule.bookingSettings.defaultLocation")}</Label>
                <VenueAutocomplete
                  placeholder={t("schedule.bookingSettings.locationPlaceholder")}
                  value={defaultLocation}
                  onVenueChange={(location) => setDefaultLocation(location)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("schedule.bookingSettings.locationDescription")}
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveBookingSettings}>
                  {t("schedule.bookingSettings.saveSettings")}
                </Button>
              </div>

              {/* Info about deposits */}
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-muted-foreground">
                  {t("schedule.bookingSettings.depositsInfo")}
                </p>
              </div>

              {/* Cancellation Policy */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label className="font-medium">{t("schedule.bookingSettings.cancellationPolicy", "Cancellation Policy")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("schedule.bookingSettings.cancellationPolicyDesc", "Minimum notice required for clients to cancel without penalty.")}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    defaultValue="24"
                    placeholder="24"
                    className="w-24"
                    onChange={async (e) => {
                      const hours = parseInt(e.target.value) || 24;
                      if (coachId) {
                        await supabase
                          .from("coach_profiles")
                          .update({ min_cancellation_hours: hours })
                          .eq("id", coachId);
                        toast.success(t("schedule.bookingSettings.cancellationUpdated", "Cancellation policy updated"));
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">{t("schedule.bookingSettings.hours", "hours")}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Availability Card */}
          <Card variant="glass" className="relative overflow-hidden">
            {/* White accent line for availability */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">{t("schedule.weeklyAvailability.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("schedule.weeklyAvailability.subtitle")}</p>
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
                            {t("schedule.weeklyAvailability.edit")}
                          </Button>
                        </div>
                      )}
                      {!dayAvail && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditAvailability(dayIndex)}
                        >
                          {t("schedule.weeklyAvailability.setHours")}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Session Types */}
          <Card variant="glass" className="relative overflow-hidden mt-6">
            {/* Primary accent line for session types */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent" />
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-foreground">{t("schedule.sessionTypes.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("schedule.sessionTypes.subtitle")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                resetSessionTypeForm();
                setShowSessionTypeModal(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {t("schedule.sessionTypes.addType")}
              </Button>
            </div>
            {loadingSessionTypes ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessionTypes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">{t("schedule.sessionTypes.noSessionTypes")}</p>
                <Button onClick={() => {
                  resetSessionTypeForm();
                  setShowSessionTypeModal(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("schedule.sessionTypes.createFirst")}
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sessionTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{type.name}</p>
                        {type.payment_required === "full" && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                            {t("schedule.sessionTypes.payUpfront")}
                          </Badge>
                        )}
                        {type.payment_required === "deposit" && (
                          <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                            {t("schedule.sessionTypes.depositRequired")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.duration_minutes} {t("schedule.sessionTypes.min")} - {getCurrencySymbol((type.currency as CurrencyCode) || coachCurrency)}{type.price}
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Type Modal */}
      <Dialog open={showSessionTypeModal} onOpenChange={setShowSessionTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSessionType ? t("schedule.sessionTypeModal.editTitle") : t("schedule.sessionTypeModal.addTitle")}</DialogTitle>
            <DialogDescription>
              {t("schedule.sessionTypeModal.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{t("schedule.sessionTypeModal.name")}</Label>
              <Input 
                placeholder={t("schedule.sessionTypeModal.namePlaceholder")}
                value={sessionTypeName}
                onChange={(e) => setSessionTypeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("schedule.sessionTypeModal.descriptionLabel")}</Label>
              <Input 
                placeholder={t("schedule.sessionTypeModal.descriptionPlaceholder")}
                value={sessionTypeDescription}
                onChange={(e) => setSessionTypeDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("schedule.sessionTypeModal.duration")}</Label>
                <Input 
                  type="number"
                  placeholder="60"
                  value={sessionTypeDuration}
                  onChange={(e) => setSessionTypeDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("schedule.sessionTypeModal.price")} ({getCurrencySymbol(coachCurrency)})</Label>
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
                <Label className="font-normal">{t("schedule.online")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={sessionTypeInPerson}
                  onCheckedChange={setSessionTypeInPerson}
                />
                <Label className="font-normal">{t("schedule.inPerson")}</Label>
              </div>
            </div>

            {/* Payment Requirements Section */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("schedule.sessionTypeModal.paymentRequirements")}
                </Label>
                <Select value={paymentRequired} onValueChange={(v) => setPaymentRequired(v as PaymentRequired)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("schedule.sessionTypeModal.noUpfront")}</SelectItem>
                    <SelectItem value="deposit">{t("schedule.sessionTypeModal.requireDeposit")}</SelectItem>
                    <SelectItem value="full">{t("schedule.sessionTypeModal.requireFull")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {paymentRequired === "none" && t("schedule.sessionTypeModal.noUpfrontDesc")}
                  {paymentRequired === "deposit" && t("schedule.sessionTypeModal.depositDesc")}
                  {paymentRequired === "full" && t("schedule.sessionTypeModal.fullPaymentDesc")}
                </p>
              </div>

              {paymentRequired === "deposit" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("schedule.sessionTypeModal.depositType")}</Label>
                    <Select value={depositType} onValueChange={(v) => setDepositType(v as DepositType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">{t("schedule.sessionTypeModal.percentageOfPrice")}</SelectItem>
                        <SelectItem value="fixed">{t("schedule.sessionTypeModal.fixedAmount")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {depositType === "percentage" ? t("schedule.sessionTypeModal.depositPercent") : `${t("schedule.sessionTypeModal.depositAmount")} (${getCurrencySymbol(coachCurrency)})`}
                    </Label>
                    <Input 
                      type="number"
                      placeholder={depositType === "percentage" ? "e.g., 25" : "e.g., 20.00"}
                      value={depositValue}
                      onChange={(e) => setDepositValue(e.target.value)}
                      min="0"
                      max={depositType === "percentage" ? "100" : undefined}
                    />
                  </div>
                </div>
              )}

              {paymentRequired === "deposit" && depositValue && sessionTypePrice && (
                <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    {t("schedule.sessionTypeModal.depositPreview")}{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(
                        depositType === "percentage"
                          ? (parseFloat(sessionTypePrice) * parseFloat(depositValue)) / 100
                          : parseFloat(depositValue)
                      )}
                    </span>
                    {depositType === "percentage" && (
                      <span className="text-muted-foreground"> ({depositValue}% of {formatCurrency(parseFloat(sessionTypePrice))})</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionTypeModal(false)}>
              {t("schedule.sessionTypeModal.cancel")}
            </Button>
            <Button 
              onClick={handleSaveSessionType}
              disabled={!sessionTypeName || !sessionTypePrice || upsertSessionType.isPending}
            >
              {upsertSessionType.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("schedule.sessionTypeModal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Modal */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("schedule.availabilityModal.editTitle")} - {editingDay !== null ? dayNames[editingDay] : ""}</DialogTitle>
            <DialogDescription>
              {t("schedule.availabilityModal.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Switch checked={availEnabled} onCheckedChange={setAvailEnabled} />
              <Label>{t("schedule.availabilityModal.availableOnDay")}</Label>
            </div>
            {availEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("schedule.availabilityModal.startTime")}</Label>
                  <NativeTimeInput 
                    value={availStartTime}
                    onChange={setAvailStartTime}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("schedule.availabilityModal.endTime")}</Label>
                  <NativeTimeInput 
                    value={availEndTime}
                    onChange={setAvailEndTime}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
              {t("schedule.availabilityModal.cancel")}
            </Button>
            <Button 
              onClick={handleSaveAvailability}
              disabled={updateAvailability.isPending}
            >
              {updateAvailability.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("schedule.availabilityModal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Session Modal */}
      <AddCoachSessionModal
        open={showAddSessionModal}
        onOpenChange={setShowAddSessionModal}
        preselectedDate={preselectedDate}
        preselectedTime={preselectedTime}
        coachId={coachId}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        open={showSessionDetailModal}
        onOpenChange={setShowSessionDetailModal}
        session={selectedSession}
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] });
        }}
      />
    </DashboardLayout>
  );
};

export default CoachSchedule;
