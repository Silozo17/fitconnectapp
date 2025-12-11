import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const mockSessions = [
  { id: 1, day: 0, time: "10:00", client: "John Smith", type: "Personal Training", duration: 60, mode: "in-person" },
  { id: 2, day: 0, time: "14:00", client: "Sarah Johnson", type: "Nutrition Consultation", duration: 45, mode: "online" },
  { id: 3, day: 1, time: "10:00", client: "Mike Davis", type: "Boxing", duration: 60, mode: "in-person" },
  { id: 4, day: 2, time: "16:00", client: "Emma Wilson", type: "Personal Training", duration: 60, mode: "online" },
  { id: 5, day: 4, time: "11:00", client: "David Brown", type: "MMA Training", duration: 90, mode: "in-person" },
];

const bookingRequests = [
  { id: 1, client: "New Client", type: "Personal Training", requestedDate: "Dec 15, 2024", requestedTime: "3:00 PM", mode: "in-person" },
  { id: 2, client: "Emma Wilson", type: "Follow-up Session", requestedDate: "Dec 18, 2024", requestedTime: "10:00 AM", mode: "online" },
];

const availabilityDefaults = [
  { day: "Monday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Saturday", enabled: false, start: "10:00", end: "14:00" },
  { day: "Sunday", enabled: false, start: "10:00", end: "14:00" },
];

const CoachSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState("Dec 11 - 17, 2024");

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
            <Badge className="ml-2 bg-accent text-accent-foreground">{bookingRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          {/* Week Navigation */}
          <div className="card-elevated p-4 mb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-display font-bold text-foreground">{currentWeek}</span>
              <Button variant="ghost" size="icon">
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
                  {weekDays.map((day, index) => (
                    <div key={day} className="p-3 text-center border-l border-border">
                      <p className="text-sm text-muted-foreground">{day}</p>
                      <p className="text-lg font-bold text-foreground">{11 + index}</p>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-border">
                    <div className="p-3 text-sm text-muted-foreground">{time}</div>
                    {weekDays.map((_, dayIndex) => {
                      const session = mockSessions.find(
                        (s) => s.day === dayIndex && s.time === time
                      );
                      return (
                        <div
                          key={dayIndex}
                          className="p-1 border-l border-border min-h-[60px] hover:bg-secondary/30 transition-colors cursor-pointer"
                        >
                          {session && (
                            <div className={`p-2 rounded-lg text-xs ${
                              session.mode === 'online' 
                                ? 'bg-primary/20 border border-primary/30' 
                                : 'bg-accent/20 border border-accent/30'
                            }`}>
                              <p className="font-medium text-foreground truncate">{session.client}</p>
                              <p className="text-muted-foreground truncate">{session.type}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {session.mode === 'online' ? (
                                  <Video className="w-3 h-3 text-primary" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-accent" />
                                )}
                                <span className="text-muted-foreground">{session.duration}m</span>
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
            <div className="divide-y divide-border">
              {bookingRequests.map((request) => (
                <div key={request.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {request.client.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.client}</p>
                      <p className="text-sm text-muted-foreground">{request.type}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{request.requestedDate} at {request.requestedTime}</span>
                        {request.mode === 'online' ? (
                          <Badge variant="outline" className="text-xs">
                            <Video className="w-3 h-3 mr-1" /> Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" /> In-Person
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90">
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {bookingRequests.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No pending booking requests</p>
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
            <div className="divide-y divide-border">
              {availabilityDefaults.map((day) => (
                <div key={day.day} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch checked={day.enabled} />
                    <span className={`font-medium ${day.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {day.day}
                    </span>
                  </div>
                  {day.enabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{day.start}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-muted-foreground">{day.end}</span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Session Types */}
          <div className="card-elevated mt-6">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-foreground">Session Types</h3>
                <p className="text-sm text-muted-foreground">Define your service offerings</p>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Type
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {["Personal Training - 60 min - £75", "Nutrition Consultation - 45 min - £50", "Boxing Session - 60 min - £60"].map((type, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="text-foreground">{type}</span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CoachSchedule;
