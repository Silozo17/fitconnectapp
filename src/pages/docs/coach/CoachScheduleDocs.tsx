import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Calendar, Clock, Video, CalendarCheck } from "lucide-react";

export default function CoachScheduleDocs() {
  return (
    <DocsLayout
      title="Schedule & Sessions"
      description="Learn how to set your availability, manage bookings, and run coaching sessions."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Schedule & Sessions" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Setting Your Availability
        </h2>
        <p className="text-muted-foreground">
          Define when clients can book sessions with you.
        </p>

        <DocStep number={1} title="Access Schedule Settings">
          Go to <strong>Schedule</strong> from your dashboard and click 
          <strong>Availability Settings</strong>.
        </DocStep>

        <DocStep number={2} title="Set Weekly Hours">
          For each day of the week, set your available time slots. You can have 
          multiple time blocks per day (e.g., morning and evening slots).
        </DocStep>

        <DocStep number={3} title="Block Time Off">
          Mark specific dates as unavailable for holidays, personal time, or 
          other commitments.
        </DocStep>

        <DocTip type="tip">
          Leave buffer time between sessions for travel, preparation, and notes. 
          A 15-30 minute gap is recommended.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Managing Bookings
        </h2>
        <p className="text-muted-foreground">
          Handle incoming booking requests and manage your session calendar.
        </p>

        <DocStep number={1} title="Review Booking Requests">
          New booking requests appear in your dashboard. Review the client, 
          requested time, and session type.
        </DocStep>

        <DocStep number={2} title="Accept or Decline">
          Click <strong>Accept</strong> to confirm a booking or <strong>Decline</strong> 
          with an optional message if the time doesn't work.
        </DocStep>

        <DocStep number={3} title="Reschedule Sessions">
          Need to move a session? Click on any booking to reschedule. Clients will 
          be notified of the change automatically.
        </DocStep>

        <DocStep number={4} title="Cancel Sessions">
          If you need to cancel, do so as early as possible. Cancellations within 
          24 hours require a reason and may affect your rating.
        </DocStep>

        <DocTip type="warning">
          Frequent cancellations can hurt your reputation. Try to maintain a 
          reliable schedule to build client trust.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Online Sessions
        </h2>
        <p className="text-muted-foreground">
          Run virtual coaching sessions with integrated video conferencing.
        </p>

        <DocStep number={1} title="Enable Online Sessions">
          In your profile settings, enable "Online Available" to offer virtual sessions.
        </DocStep>

        <DocStep number={2} title="Video Meeting Links">
          When you accept an online session, a video meeting link is automatically 
          generated (Zoom or Google Meet depending on your integration).
        </DocStep>

        <DocStep number={3} title="Join Sessions">
          Click <strong>Join Meeting</strong> from the session detail to launch 
          the video call at the scheduled time.
        </DocStep>

        <DocTip type="info">
          Connect your Zoom or Google Meet account in Settings → Integrations to 
          enable automatic meeting link generation.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Calendar Sync
        </h2>
        <p className="text-muted-foreground">
          Sync your coaching schedule with external calendars.
        </p>

        <DocStep number={1} title="Connect Calendar">
          Go to <strong>Settings → Integrations</strong> and connect your Google Calendar 
          or Outlook calendar.
        </DocStep>

        <DocStep number={2} title="Two-Way Sync">
          Bookings automatically appear in your connected calendar. Personal events 
          from your calendar block availability on the platform.
        </DocStep>

        <DocStep number={3} title="Prevent Double-Booking">
          Calendar sync ensures you never double-book by checking your real-time 
          availability across all calendars.
        </DocStep>

        <DocTip type="tip">
          Use a dedicated calendar for coaching to keep personal and professional 
          schedules organized.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
