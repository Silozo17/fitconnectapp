import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";

export default function ClientSessions() {
  return (
    <DocsLayout
      title="Booking Sessions"
      description="Learn how to book, manage, reschedule, and cancel coaching sessions."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Booking Sessions" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect makes it easy to book sessions with your coaches 24/7. Whether you prefer 
          online video sessions or in-person training, you can manage all your bookings from 
          your dashboard.
        </p>
      </section>

      {/* Booking a Session */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Booking a Session</h2>

        <DocStep number={1} title="Go to the coach's profile">
          Navigate to your connected coach's profile or click "Book Session" from your dashboard.
        </DocStep>

        <DocStep number={2} title="Select a session type">
          Choose from the available session types offered by the coach. Options may include:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Initial consultation (often free)</li>
            <li>Standard training session</li>
            <li>Extended session</li>
            <li>Specialised sessions (e.g., nutrition review)</li>
          </ul>
        </DocStep>

        <DocStep number={3} title="Choose online or in-person">
          Select whether you want an online video session or an in-person meeting. 
          For in-person, confirm the location.
        </DocStep>

        <DocStep number={4} title="Pick a date and time">
          View the coach's availability calendar and select an open slot. The calendar shows:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Available slots in green</li>
            <li>Booked slots greyed out</li>
            <li>Times in your local timezone</li>
          </ul>
        </DocStep>

        <DocScreenshot 
          alt="Booking calendar showing available time slots"
          caption="Select an available time slot from the coach's calendar"
        />

        <DocStep number={5} title="Confirm and pay">
          Review the booking details and confirm. If payment is required, you'll be directed 
          to the secure checkout.
        </DocStep>

        <DocTip type="tip">
          Book recurring sessions at the same time each week for consistency. Many coaches 
          offer package discounts for multiple sessions.
        </DocTip>
      </section>

      {/* Session Packages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Session Packages</h2>
        <p className="text-muted-foreground mb-4">
          Many coaches offer session packages at discounted rates. Packages typically include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>5-session pack:</strong> Good for trying out a coach</li>
          <li><strong>10-session pack:</strong> Popular choice for 2-3 months of training</li>
          <li><strong>20-session pack:</strong> Best value for committed clients</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Purchasing a Package</h3>
        <DocStep number={1} title="View coach's packages">
          Go to the coach's profile and scroll to the "Packages" section.
        </DocStep>
        <DocStep number={2} title="Select a package">
          Choose the package that fits your needs and budget.
        </DocStep>
        <DocStep number={3} title="Complete purchase">
          Pay through secure checkout. Sessions are added to your account immediately.
        </DocStep>
        <DocStep number={4} title="Book sessions">
          Use your package credits to book individual sessions from the coach's calendar.
        </DocStep>

        <DocTip type="info">
          Package sessions typically have an expiry date (e.g., 90 days). Check the package 
          terms before purchasing.
        </DocTip>
      </section>

      {/* Managing Bookings */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Managing Your Bookings</h2>
        <p className="text-muted-foreground mb-4">
          View and manage all your sessions from the "Sessions" page in your dashboard.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Upcoming Sessions</h3>
        <p className="text-muted-foreground mb-4">
          See all your scheduled sessions with date, time, coach name, and session type. 
          Click on any session for more details or to make changes.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Past Sessions</h3>
        <p className="text-muted-foreground mb-4">
          Review your session history, including completed and cancelled sessions.
        </p>

        <DocScreenshot 
          alt="Sessions dashboard showing upcoming and past sessions"
          caption="Your sessions dashboard"
        />
      </section>

      {/* Rescheduling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rescheduling Sessions</h2>
        <p className="text-muted-foreground mb-4">
          Need to change your session time? Here's how to reschedule:
        </p>

        <DocStep number={1} title="Open the session">
          Go to Sessions in your dashboard and click on the session you want to reschedule.
        </DocStep>
        <DocStep number={2} title="Click Reschedule">
          Click the "Reschedule" button to open the rescheduling modal.
        </DocStep>
        <DocStep number={3} title="Pick a new time">
          Select a new date and time from the coach's available slots.
        </DocStep>
        <DocStep number={4} title="Confirm">
          Confirm the new time. Both you and your coach will receive notifications.
        </DocStep>

        <DocTip type="warning">
          Most coaches require at least 24 hours notice for rescheduling. Check your coach's 
          policy before making changes.
        </DocTip>
      </section>

      {/* Cancelling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cancelling Sessions</h2>
        <p className="text-muted-foreground mb-4">
          If you need to cancel a session:
        </p>

        <DocStep number={1} title="Open the session">
          Go to Sessions and click on the session you need to cancel.
        </DocStep>
        <DocStep number={2} title="Click Cancel">
          Click the "Cancel" button.
        </DocStep>
        <DocStep number={3} title="Select a reason">
          Choose a cancellation reason from the dropdown.
        </DocStep>
        <DocStep number={4} title="Confirm cancellation">
          Confirm your cancellation. If within the 24-hour window, you'll see a warning about 
          potential fees.
        </DocStep>

        <DocTip type="warning" title="24-Hour Cancellation Policy">
          Most coaches have a 24-hour cancellation policy. Cancelling within 24 hours of a 
          session may result in forfeiting the session or being charged a cancellation fee. 
          Always check your coach's specific policy.
        </DocTip>
      </section>

      {/* Online Sessions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Joining Online Sessions</h2>
        <p className="text-muted-foreground mb-4">
          For online video sessions:
        </p>

        <DocStep number={1} title="Check your equipment">
          Ensure you have a stable internet connection, working webcam, and microphone.
        </DocStep>
        <DocStep number={2} title="Find the meeting link">
          The video meeting link will appear in your session details. You'll also receive 
          reminder emails with the link.
        </DocStep>
        <DocStep number={3} title="Join on time">
          Click "Join Meeting" a few minutes before your scheduled time to test your setup.
        </DocStep>
        <DocStep number={4} title="Have space ready">
          For training sessions, ensure you have enough space to exercise safely.
        </DocStep>

        <DocTip type="tip">
          Test your video and audio before your first session. Most video platforms have a 
          "test call" feature.
        </DocTip>
      </section>

      {/* Session Tips */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tips for Great Sessions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Be prepared</h3>
            <p className="text-sm text-muted-foreground">
              Review your plan before the session and have any questions ready to discuss.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Arrive on time</h3>
            <p className="text-sm text-muted-foreground">
              Join online sessions 2-3 minutes early. For in-person, arrive 5-10 minutes early.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Communicate openly</h3>
            <p className="text-sm text-muted-foreground">
              Tell your coach about any discomfort, injuries, or concerns during the session.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Take notes</h3>
            <p className="text-sm text-muted-foreground">
              Write down key points after your session to remember what you discussed.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
