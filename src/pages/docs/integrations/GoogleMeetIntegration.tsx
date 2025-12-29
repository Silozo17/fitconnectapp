import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Video, Calendar, Link2, Settings, CheckCircle } from "lucide-react";

export default function GoogleMeetIntegration() {
  return (
    <DocsLayout
      title="Google Meet Integration"
      description="Use Google Meet for online coaching sessions with automatic meeting link generation."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations" },
        { label: "Google Meet" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Google Meet integration allows coaches to conduct online training sessions using Google's 
          video conferencing platform. When you book an online session, a Google Meet link is 
          automatically generated and shared with both coach and client.
        </p>
        <DocTip>
          Google Meet is integrated through Google Calendar. To use Google Meet, you'll need to 
          connect your Google Calendar first.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Requirements
        </h2>
        <p className="text-muted-foreground mb-4">
          To use Google Meet for sessions:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>A Google account (personal or Workspace)</li>
          <li>Google Calendar connected to FitConnect</li>
          <li>A stable internet connection</li>
          <li>Camera and microphone access (for video calls)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-500" />
          How to Connect
        </h2>
        <p className="text-muted-foreground mb-4">
          Google Meet is enabled automatically when you connect Google Calendar.
        </p>

        <DocStep stepNumber={1} title="Go to Integrations">
          Navigate to <strong>Settings → Integrations</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Connect Google Calendar">
          Click <strong>Connect</strong> next to Google Calendar. You'll be redirected to Google 
          to authorize the connection.
        </DocStep>

        <DocStep stepNumber={3} title="Grant Permissions">
          Allow FitConnect to access your calendar. This also enables Google Meet link generation.
        </DocStep>

        <DocStep stepNumber={4} title="Verify Connection">
          Once connected, you'll see "Connected" status. Google Meet is now available for 
          online sessions.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          How It Works
        </h2>
        <p className="text-muted-foreground mb-4">
          Using Google Meet for your coaching sessions:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">For Coaches</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• When a client books an online session, a Meet link is auto-generated</li>
              <li>• The link appears on your schedule and in session details</li>
              <li>• Events sync to your Google Calendar with the Meet link attached</li>
              <li>• Click "Join Meeting" when it's time for the session</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">For Clients</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Book an online session with any coach who has Meet enabled</li>
              <li>• The Google Meet link appears in your session details</li>
              <li>• Click the link at your session time to join</li>
              <li>• No Google account required to join (just click the link)</li>
            </ul>
          </div>
        </div>

        <DocInfo>
          Both coach and client receive reminder emails with the Google Meet link before the session.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          Features
        </h2>
        <p className="text-muted-foreground mb-4">
          Google Meet provides these features for your sessions:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>HD Video:</strong> High-quality video calls</li>
          <li><strong>Screen Sharing:</strong> Share workout demos or nutrition plans</li>
          <li><strong>Chat:</strong> Send messages during the call</li>
          <li><strong>Recording:</strong> Record sessions (requires Google Workspace)</li>
          <li><strong>Background Blur:</strong> Focus on the workout, not your surroundings</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Disconnecting</h2>
        <p className="text-muted-foreground mb-4">
          To disconnect Google Meet:
        </p>
        <DocStep stepNumber={1} title="Remove Google Calendar">
          Go to <strong>Settings → Integrations</strong> and click <strong>Disconnect</strong> 
          next to Google Calendar. This also removes Google Meet functionality.
        </DocStep>

        <DocTip>
          Disconnecting won't affect past sessions. Future sessions will need a different 
          video platform (like Zoom) or you'll need to reconnect Google.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
