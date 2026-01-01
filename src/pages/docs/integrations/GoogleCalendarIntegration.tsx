import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Calendar, Link2, RefreshCw, Shield, Settings, Trash2 } from "lucide-react";

export default function GoogleCalendarIntegration() {
  return (
    <DocsLayout
      title="Google Calendar Integration | FitConnect Guide"
      description="Sync your bookings with Google Calendar. Prevent double-booking with two-way sync."
      breadcrumbs={[
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Google Calendar" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect Google Calendar to automatically sync your FitConnect sessions with your 
          personal or work calendar. This ensures all your coaching appointments appear 
          alongside your other commitments.
        </p>
        <DocTip>
          Connecting Google Calendar also enables Google Meet for online sessions.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-500" />
          How to Connect
        </h2>
        <p className="text-muted-foreground mb-4">
          Link your Google Calendar in just a few steps.
        </p>

        <DocStep stepNumber={1} title="Open Integrations">
          Navigate to <strong>Settings → Integrations</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Find Google Calendar">
          Locate the Google Calendar card in the Calendars section.
        </DocStep>

        <DocStep stepNumber={3} title="Click Connect">
          Click the <strong>Connect</strong> button. You'll be redirected to Google's sign-in page.
        </DocStep>

        <DocStep stepNumber={4} title="Sign In to Google">
          Sign in with your Google account. If you have multiple accounts, select the one 
          you want to use for calendar sync.
        </DocStep>

        <DocStep stepNumber={5} title="Grant Permissions">
          Review the permissions FitConnect is requesting and click <strong>Allow</strong>.
        </DocStep>

        <DocStep stepNumber={6} title="Confirm Connection">
          You'll be redirected back to FitConnect. Your Google Calendar should now show 
          as "Connected".
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-green-500" />
          How Sync Works
        </h2>
        <p className="text-muted-foreground mb-4">
          Once connected, your calendars stay in sync automatically.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">FitConnect → Google Calendar</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• New session bookings appear on your Google Calendar</li>
              <li>• Session changes (reschedules, cancellations) update automatically</li>
              <li>• Online sessions include Google Meet links</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Google Calendar → FitConnect</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your existing calendar events are read to prevent double-booking</li>
              <li>• Busy times from other calendars block availability (if enabled)</li>
              <li>• All-day events are considered when showing free slots</li>
            </ul>
          </div>
        </div>

        <DocTip>
          Enable "two-way sync" in your integration settings to automatically block off 
          times when you have events on your Google Calendar.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Privacy & Permissions
        </h2>
        <p className="text-muted-foreground mb-4">
          Understanding what FitConnect can access:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Read Events:</strong> To check your availability and prevent conflicts</li>
          <li><strong>Create Events:</strong> To add FitConnect sessions to your calendar</li>
          <li><strong>Modify Events:</strong> To update or cancel sessions you've booked</li>
          <li><strong>Delete Events:</strong> To remove cancelled sessions</li>
        </ul>

        <DocWarning>
          FitConnect only accesses events to manage session scheduling. We don't read 
          event details unrelated to FitConnect bookings.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          Configuration Options
        </h2>
        <p className="text-muted-foreground mb-4">
          Customize how the integration works:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Select Calendar:</strong> Choose which calendar to sync with (if you have multiple)</li>
          <li><strong>Auto-sync:</strong> Enable or disable automatic syncing</li>
          <li><strong>Two-way Sync:</strong> Block FitConnect availability based on Google events</li>
          <li><strong>Meeting Links:</strong> Auto-generate Google Meet links for online sessions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Disconnecting
        </h2>
        <p className="text-muted-foreground mb-4">
          To remove the Google Calendar connection:
        </p>

        <DocStep stepNumber={1} title="Go to Integrations">
          Navigate to <strong>Settings → Integrations</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Click Disconnect">
          Find Google Calendar and click <strong>Disconnect</strong>.
        </DocStep>

        <DocStep stepNumber={3} title="Confirm">
          Confirm the disconnection. FitConnect sessions will no longer sync to Google Calendar.
        </DocStep>

        <DocTip>
          Disconnecting won't delete events already created on your Google Calendar. 
          You'll need to manually remove those if desired.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
