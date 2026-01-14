import React, { useState } from "react";
import { 
  useGymGradingEvents, 
  useGymGradingEvent,
  useCreateGradingEvent, 
  useUpdateGradingEvent,
  useDeleteGradingEvent,
  useGymGradingStats,
  useEligibleMembersForGrading,
  useRegisterMemberForGrading,
  useRecordGradingResult,
  useUpdateGradingRegistration,
  type GradingEvent,
  type GradingRegistration,
} from "@/hooks/gym/useGymGrading";
import { useGymLocations } from "@/hooks/gym/useGymLocations";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  Calendar, 
  Plus, 
  Users, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Pencil,
  Trash2,
  UserPlus,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { cn } from "@/lib/utils";

// Common belt/grade configurations for martial arts
const COMMON_GRADES = [
  { id: "white", label: "White Belt", color: "#FFFFFF" },
  { id: "yellow", label: "Yellow Belt", color: "#FFEB3B" },
  { id: "orange", label: "Orange Belt", color: "#FF9800" },
  { id: "green", label: "Green Belt", color: "#4CAF50" },
  { id: "blue", label: "Blue Belt", color: "#2196F3" },
  { id: "purple", label: "Purple Belt", color: "#9C27B0" },
  { id: "brown", label: "Brown Belt", color: "#795548" },
  { id: "black", label: "Black Belt", color: "#212121" },
  { id: "black_1dan", label: "Black Belt 1st Dan", color: "#212121" },
  { id: "black_2dan", label: "Black Belt 2nd Dan", color: "#212121" },
  { id: "black_3dan", label: "Black Belt 3rd Dan", color: "#212121" },
];

function getGradeLabel(gradeId: string | null): string {
  if (!gradeId) return "None";
  const grade = COMMON_GRADES.find(g => g.id === gradeId);
  return grade?.label || gradeId;
}

function getGradeColor(gradeId: string | null): string {
  if (!gradeId) return "#9CA3AF";
  const grade = COMMON_GRADES.find(g => g.id === gradeId);
  return grade?.color || "#9CA3AF";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "upcoming":
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
    case "in_progress":
      return <Badge variant="default" className="bg-blue-500"><Users className="h-3 w-3 mr-1" />In Progress</Badge>;
    case "completed":
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRegistrationStatusBadge(status: string) {
  switch (status) {
    case "registered":
      return <Badge variant="secondary">Registered</Badge>;
    case "confirmed":
      return <Badge variant="default" className="bg-blue-500">Confirmed</Badge>;
    case "passed":
      return <Badge variant="default" className="bg-green-500">Passed</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "absent":
      return <Badge variant="outline">Absent</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function GymAdminGrading() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<GradingRegistration | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: stats } = useGymGradingStats();
  const { data: events = [], isLoading: eventsLoading } = useGymGradingEvents();
  const { data: selectedEvent } = useGymGradingEvent(selectedEventId ?? undefined);
  const { data: eligibleMembers = [] } = useEligibleMembersForGrading();
  const { data: locations = [] } = useGymLocations();
  const { data: staff = [] } = useGymStaff();

  const createEvent = useCreateGradingEvent();
  const updateEvent = useUpdateGradingEvent();
  const deleteEvent = useDeleteGradingEvent();
  const registerMember = useRegisterMemberForGrading();
  const recordResult = useRecordGradingResult();
  const updateRegistration = useUpdateGradingRegistration();

  const upcomingEvents = events.filter(e => e.status === "upcoming" && isFuture(new Date(e.grading_date)));
  const pastEvents = events.filter(e => e.status === "completed" || isPast(new Date(e.grading_date)));
  const inProgressEvents = events.filter(e => e.status === "in_progress");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grading Management</h1>
          <p className="text-muted-foreground">Manage belt/grade assessments for martial arts members</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Grading Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled grading sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed This Year</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.passedThisYear || 0}</div>
            <p className="text-xs text-muted-foreground">Successful gradings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eligibleMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Events List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Grading Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </div>
              <ScrollArea className="h-[400px]">
                <TabsContent value="upcoming" className="m-0 p-4 space-y-2">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        isSelected={selectedEventId === event.id}
                        onClick={() => setSelectedEventId(event.id)}
                      />
                    ))
                  )}
                  {inProgressEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isSelected={selectedEventId === event.id}
                      onClick={() => setSelectedEventId(event.id)}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="past" className="m-0 p-4 space-y-2">
                  {pastEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No past events</p>
                    </div>
                  ) : (
                    pastEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        isSelected={selectedEventId === event.id}
                        onClick={() => setSelectedEventId(event.id)}
                      />
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="lg:col-span-2">
          {selectedEvent ? (
            <>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(selectedEvent.status)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.grading_date), "PPP 'at' p")}
                    </span>
                  </div>
                  <CardTitle>{selectedEvent.name}</CardTitle>
                  {selectedEvent.description && (
                    <CardDescription>{selectedEvent.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedEvent.status === "upcoming" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsRegisterDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Members
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateEvent.mutate({ 
                          eventId: selectedEvent.id, 
                          updates: { status: "in_progress" } 
                        })}
                      >
                        Start Grading
                      </Button>
                    </>
                  )}
                  {selectedEvent.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => updateEvent.mutate({ 
                        eventId: selectedEvent.id, 
                        updates: { status: "completed" } 
                      })}
                    >
                      Complete Event
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Event Info */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEvent.location?.name || "No location set"}</span>
                  </div>
                  {selectedEvent.examiner_name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Examiner: {selectedEvent.examiner_name}</span>
                    </div>
                  )}
                  {selectedEvent.fee_amount && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Fee: {selectedEvent.currency} {(selectedEvent.fee_amount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Registrations */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Registrations ({selectedEvent.registrations?.length || 0})
                  </h3>
                  
                  {!selectedEvent.registrations?.length ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No registrations yet</p>
                      {selectedEvent.status === "upcoming" && (
                        <Button 
                          variant="link" 
                          onClick={() => setIsRegisterDialogOpen(true)}
                        >
                          Add members to this grading
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvent.registrations.map((registration) => (
                        <div 
                          key={registration.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
                            selectedEvent.status === "in_progress" && "cursor-pointer"
                          )}
                          onClick={() => {
                            if (selectedEvent.status === "in_progress" && registration.status !== "passed" && registration.status !== "failed") {
                              setSelectedRegistration(registration);
                              setIsResultDialogOpen(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={registration.member?.avatar_url || ""} />
                              <AvatarFallback>
                                {registration.member?.first_name?.[0]}
                                {registration.member?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {registration.member?.first_name} {registration.member?.last_name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: getGradeColor(registration.current_grade) }}
                                />
                                {getGradeLabel(registration.current_grade)}
                                <ChevronRight className="h-3 w-3" />
                                <span 
                                  className="inline-block w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: getGradeColor(registration.attempting_grade) }}
                                />
                                {getGradeLabel(registration.attempting_grade)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {registration.fee_paid ? (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            ) : selectedEvent.fee_amount ? (
                              <Badge variant="outline" className="text-amber-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Unpaid
                              </Badge>
                            ) : null}
                            {getRegistrationStatusBadge(registration.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <Award className="h-12 w-12 mb-4 opacity-50" />
              <p>Select an event to view details</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        locations={locations}
        onSubmit={(data) => {
          createEvent.mutate(data, {
            onSuccess: () => setIsCreateDialogOpen(false),
          });
        }}
        isLoading={createEvent.isPending}
      />

      {/* Register Member Dialog */}
      {selectedEvent && (
        <RegisterMemberDialog
          open={isRegisterDialogOpen}
          onOpenChange={setIsRegisterDialogOpen}
          eventId={selectedEvent.id}
          eligibleMembers={eligibleMembers}
          existingRegistrations={selectedEvent.registrations || []}
          grades={COMMON_GRADES}
          onSubmit={(data) => {
            registerMember.mutate(data, {
              onSuccess: () => setIsRegisterDialogOpen(false),
            });
          }}
          isLoading={registerMember.isPending}
        />
      )}

      {/* Record Result Dialog */}
      {selectedRegistration && (
        <RecordResultDialog
          open={isResultDialogOpen}
          onOpenChange={(open) => {
            setIsResultDialogOpen(open);
            if (!open) setSelectedRegistration(null);
          }}
          registration={selectedRegistration}
          grades={COMMON_GRADES}
          staff={staff}
          onSubmit={(data) => {
            recordResult.mutate({
              registrationId: selectedRegistration.id,
              memberId: selectedRegistration.member_id,
              ...data,
            }, {
              onSuccess: () => {
                setIsResultDialogOpen(false);
                setSelectedRegistration(null);
              },
            });
          }}
          isLoading={recordResult.isPending}
        />
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  isSelected, 
  onClick 
}: { 
  event: GradingEvent; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <div 
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
        isSelected && "border-primary bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="font-medium text-sm truncate">{event.name}</p>
        {getStatusBadge(event.status)}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {format(new Date(event.grading_date), "PP")}
      </div>
      {event.location && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3" />
          {event.location.name}
        </div>
      )}
    </div>
  );
}

// Create Event Dialog Component
function CreateEventDialog({ 
  open, 
  onOpenChange, 
  locations,
  onSubmit,
  isLoading,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  locations: { id: string; name: string }[];
  onSubmit: (data: Partial<GradingEvent>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grading_date: "",
    registration_deadline: "",
    location_id: "",
    examiner_name: "",
    examiner_organization: "",
    fee_amount: "",
    max_participants: "",
    grades_available: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description || null,
      grading_date: new Date(formData.grading_date).toISOString(),
      registration_deadline: formData.registration_deadline 
        ? new Date(formData.registration_deadline).toISOString() 
        : null,
      location_id: formData.location_id || null,
      examiner_name: formData.examiner_name || null,
      examiner_organization: formData.examiner_organization || null,
      fee_amount: formData.fee_amount ? parseInt(formData.fee_amount) * 100 : null,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      grades_available: formData.grades_available.length > 0 ? formData.grades_available : null,
      status: "upcoming",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Grading Event</DialogTitle>
          <DialogDescription>
            Schedule a new belt/grade assessment for your members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spring Belt Grading 2024"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the grading..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grading_date">Date & Time *</Label>
                <Input
                  id="grading_date"
                  type="datetime-local"
                  value={formData.grading_date}
                  onChange={(e) => setFormData({ ...formData, grading_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => setFormData({ ...formData, location_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="examiner_name">Examiner Name</Label>
                <Input
                  id="examiner_name"
                  value={formData.examiner_name}
                  onChange={(e) => setFormData({ ...formData, examiner_name: e.target.value })}
                  placeholder="e.g., Sensei John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="examiner_organization">Organization</Label>
                <Input
                  id="examiner_organization"
                  value={formData.examiner_organization}
                  onChange={(e) => setFormData({ ...formData, examiner_organization: e.target.value })}
                  placeholder="e.g., JKA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fee_amount">Grading Fee (£)</Label>
                <Input
                  id="fee_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Register Member Dialog Component
function RegisterMemberDialog({ 
  open, 
  onOpenChange,
  eventId,
  eligibleMembers,
  existingRegistrations,
  grades,
  onSubmit,
  isLoading,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eligibleMembers: { 
    id: string; 
    first_name: string | null; 
    last_name: string | null; 
    email: string | null;
    current_grade: string | null;
  }[];
  existingRegistrations: GradingRegistration[];
  grades: { id: string; label: string; color: string }[];
  onSubmit: (data: { eventId: string; memberId: string; currentGrade?: string; attemptingGrade: string }) => void;
  isLoading: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [attemptingGrade, setAttemptingGrade] = useState("");

  const registeredMemberIds = existingRegistrations.map(r => r.member_id);
  const availableMembers = eligibleMembers.filter(m => !registeredMemberIds.includes(m.id));
  const selectedMember = availableMembers.find(m => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !attemptingGrade) return;
    onSubmit({
      eventId,
      memberId: selectedMemberId,
      currentGrade: selectedMember?.current_grade || undefined,
      attemptingGrade,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Register Member for Grading</DialogTitle>
          <DialogDescription>
            Select an eligible member and the grade they are attempting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Member *</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <SelectItem value="_none" disabled>No eligible members</SelectItem>
                  ) : (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.first_name} {member.last_name}</span>
                          {member.current_grade && (
                            <span 
                              className="inline-block w-3 h-3 rounded-full border"
                              style={{ backgroundColor: getGradeColor(member.current_grade) }}
                            />
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedMember && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                <span>Current grade:</span>
                <span 
                  className="inline-block w-3 h-3 rounded-full border"
                  style={{ backgroundColor: getGradeColor(selectedMember.current_grade) }}
                />
                <span>{getGradeLabel(selectedMember.current_grade)}</span>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Attempting Grade *</Label>
              <Select value={attemptingGrade} onValueChange={setAttemptingGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-block w-3 h-3 rounded-full border"
                          style={{ backgroundColor: grade.color }}
                        />
                        <span>{grade.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedMemberId || !attemptingGrade}>
              {isLoading ? "Registering..." : "Register Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Record Result Dialog Component
function RecordResultDialog({ 
  open, 
  onOpenChange,
  registration,
  grades,
  staff,
  onSubmit,
  isLoading,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  registration: GradingRegistration;
  grades: { id: string; label: string; color: string }[];
  staff: { id: string; display_name: string | null }[];
  onSubmit: (data: { passed: boolean; newGrade?: string; notes?: string; staffId?: string }) => void;
  isLoading: boolean;
}) {
  const [passed, setPassed] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [staffId, setStaffId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passed === null) return;
    onSubmit({
      passed,
      newGrade: passed ? registration.attempting_grade ?? undefined : undefined,
      notes: notes || undefined,
      staffId: staffId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Record Grading Result</DialogTitle>
          <DialogDescription>
            Record the result for {registration.member?.first_name} {registration.member?.last_name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span 
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: getGradeColor(registration.current_grade) }}
              />
              <span>{getGradeLabel(registration.current_grade)}</span>
              <ChevronRight className="h-4 w-4" />
              <span 
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: getGradeColor(registration.attempting_grade) }}
              />
              <span className="font-medium">{getGradeLabel(registration.attempting_grade)}</span>
            </div>

            <div className="grid gap-2">
              <Label>Result *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={passed === true ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    passed === true && "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={() => setPassed(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Passed
                </Button>
                <Button
                  type="button"
                  variant={passed === false ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    passed === false && "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => setPassed(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Failed
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Graded By</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select examiner" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.display_name || "Staff member"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any feedback or notes about the grading..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || passed === null}>
              {isLoading ? "Saving..." : "Record Result"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
