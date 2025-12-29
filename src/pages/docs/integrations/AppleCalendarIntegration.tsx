import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Calendar, Key, Link2, RefreshCw, Trash2, Shield } from "lucide-react";

export default function AppleCalendarIntegration() {
  return (
    <DocsLayout
      title="Apple Calendar Integration"
      description="Connect Apple Calendar (iCloud) to sync your FitConnect schedule via CalDAV."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations" },
        { label: "Apple Calendar" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect your Apple Calendar (iCloud Calendar) to sync FitConnect sessions with your 
          iPhone, iPad, and Mac. This integration uses Apple's CalDAV protocol for secure 
          calendar synchronization.
        </p>
        <DocInfo>
          Unlike Google Calendar, Apple Calendar requires an App-Specific Password for 
          third-party app connections. This is a security feature from Apple.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-amber-500" />
          Before You Start
        </h2>
        <p className="text-muted-foreground mb-4">
          You'll need to create an App-Specific Password from Apple first.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>An Apple ID with two-factor authentication enabled</li>
          <li>Access to <strong>appleid.apple.com</strong></li>
          <li>A few minutes to generate and save your app-specific password</li>
        </ul>

        <DocWarning>
          You cannot use your regular Apple ID password. Apple requires app-specific 
          passwords for security reasons when connecting third-party services.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Generating an App-Specific Password
        </h2>
        <p className="text-muted-foreground mb-4">
          Follow these steps on Apple's website:
        </p>

        <DocStep stepNumber={1} title="Go to Apple ID">
          Visit <strong>appleid.apple.com</strong> and sign in with your Apple ID.
        </DocStep>

        <DocStep stepNumber={2} title="Navigate to Security">
          In the Security section, find <strong>App-Specific Passwords</strong>.
        </DocStep>

        <DocStep stepNumber={3} title="Generate Password">
          Click <strong>Generate an app-specific password</strong> (or the + icon).
        </DocStep>

        <DocStep stepNumber={4} title="Name the Password">
          Enter a label like "FitConnect" to help you identify it later.
        </DocStep>

        <DocStep stepNumber={5} title="Copy the Password">
          Apple will display a 16-character password. <strong>Copy it immediately</strong> — 
          you won't be able to see it again.
        </DocStep>

        <DocTip>
          Save the password temporarily in a secure note until you've connected it to FitConnect. 
          You can always generate a new one if needed.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-500" />
          Connecting to FitConnect
        </h2>
        <p className="text-muted-foreground mb-4">
          Now connect Apple Calendar in FitConnect:
        </p>

        <DocStep stepNumber={1} title="Open Integrations">
          Navigate to <strong>Settings → Integrations</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Find Apple Calendar">
          Locate the Apple Calendar (iCloud) card in the Calendars section.
        </DocStep>

        <DocStep stepNumber={3} title="Click Connect">
          Click the <strong>Connect</strong> button.
        </DocStep>

        <DocStep stepNumber={4} title="Enter Credentials">
          Enter your Apple ID email and the app-specific password you generated.
        </DocStep>

        <DocStep stepNumber={5} title="Verify Connection">
          FitConnect will verify the connection. Once successful, you'll see "Connected" status.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-purple-500" />
          How Sync Works
        </h2>
        <p className="text-muted-foreground mb-4">
          Once connected, your calendars sync automatically:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>New FitConnect sessions appear in your Apple Calendar</li>
          <li>Session updates (reschedules, cancellations) sync automatically</li>
          <li>Events appear on all devices signed into your iCloud account</li>
          <li>Your existing calendar events help prevent double-booking</li>
        </ul>

        <DocInfo>
          Sync may take a few minutes to appear on all devices. Pull down on your 
          Calendar app to force a refresh.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Disconnecting
        </h2>
        <p className="text-muted-foreground mb-4">
          To remove the Apple Calendar connection:
        </p>

        <DocStep stepNumber={1} title="Disconnect in FitConnect">
          Go to <strong>Settings → Integrations</strong> and click <strong>Disconnect</strong> 
          next to Apple Calendar.
        </DocStep>

        <DocStep stepNumber={2} title="Revoke App Password (Recommended)">
          Visit <strong>appleid.apple.com</strong>, go to Security → App-Specific Passwords, 
          and revoke the FitConnect password for added security.
        </DocStep>

        <DocTip>
          Revoking the app-specific password ensures FitConnect can no longer access your 
          Apple Calendar, even if you reconnect later without generating a new password.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
