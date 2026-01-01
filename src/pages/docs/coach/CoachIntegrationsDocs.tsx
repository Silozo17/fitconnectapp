import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Calendar, Video, RefreshCw, Shield, CheckCircle, XCircle, Clock } from "lucide-react";

export default function CoachIntegrationsDocs() {
  return (
    <DocsLayout
      title="Coach Integrations | FitConnect Guide"
      description="Connect calendars, video conferencing and other tools to your coaching dashboard."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Integrations" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to connect external tools to FitConnect. Integrations 
            help you sync calendars, generate video meeting links, and reduce manual work by 
            connecting the tools you already use.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Available Integrations</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Google Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Two-way sync between FitConnect bookings and your Google Calendar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Apple Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sync bookings with iCloud Calendar for seamless scheduling.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Zoom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically generate Zoom meeting links for online sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Google Meet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create Google Meet links automatically when sessions are booked.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why Connect Integrations</h2>
          <p className="text-muted-foreground mb-4">
            Integrations reduce manual work and prevent scheduling conflicts:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Avoid double-bookings by syncing all calendars</li>
            <li>See all appointments in your preferred calendar app</li>
            <li>Automatically block personal commitments from booking availability</li>
            <li>Generate video links without copying and pasting</li>
            <li>Keep everything synchronised without manual updates</li>
          </ul>
        </section>

        {/* Calendar Integration */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Calendar Integration
          </h2>
          <p className="text-muted-foreground mb-4">
            Calendar sync works in two directions:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Outbound Sync (FitConnect → Your Calendar)</h3>
              <p className="text-sm text-muted-foreground">
                When a client books a session, it automatically appears in your connected calendar 
                with all details including client name, session type, and location.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Inbound Sync (Your Calendar → FitConnect)</h3>
              <p className="text-sm text-muted-foreground">
                Events in your connected calendar block those times in FitConnect, preventing 
                clients from booking when you're busy.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            If you use multiple calendars, connect all of them to ensure your full availability 
            is reflected in FitConnect.
          </DocTip>
        </section>

        {/* Connecting Google Calendar */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Connecting Google Calendar</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Go to Settings">
              Navigate to Settings → Integrations from your coach dashboard.
            </DocStep>

            <DocStep stepNumber={2} title="Click Connect Google Calendar">
              Find Google Calendar in the list and click "Connect".
            </DocStep>

            <DocStep stepNumber={3} title="Authorise Access">
              You'll be redirected to Google. Sign in and grant FitConnect permission to access 
              your calendar.
            </DocStep>

            <DocStep stepNumber={4} title="Select Calendars">
              Choose which calendars to sync. You can sync multiple calendars if needed.
            </DocStep>

            <DocStep stepNumber={5} title="Confirm Connection">
              Once connected, you'll see a success message and sync will begin automatically.
            </DocStep>
          </div>
        </section>

        {/* Connecting Apple Calendar */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Connecting Apple Calendar</h2>
          <p className="text-muted-foreground mb-4">
            Apple Calendar uses CalDAV for syncing:
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Generate App-Specific Password">
              Go to appleid.apple.com, sign in, and generate an app-specific password for FitConnect.
            </DocStep>

            <DocStep stepNumber={2} title="Enter Credentials">
              In FitConnect Settings → Integrations → Apple Calendar, enter your iCloud email 
              and the app-specific password.
            </DocStep>

            <DocStep stepNumber={3} title="Select Calendar">
              Choose which iCloud calendar to sync with FitConnect.
            </DocStep>
          </div>

          <DocInfo className="mt-4">
            App-specific passwords are secure tokens that don't expose your main Apple ID password. 
            You can revoke them anytime from your Apple ID settings.
          </DocInfo>
        </section>

        {/* Video Conferencing */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Conferencing
          </h2>
          <p className="text-muted-foreground mb-4">
            Connect video platforms to automatically generate meeting links for online sessions:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Zoom Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Zoom account to automatically create unique meeting links when 
                online sessions are booked. Links are included in booking confirmations.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Google Meet Integration</h3>
              <p className="text-sm text-muted-foreground">
                If you have Google Calendar connected with a Google Workspace account, Google Meet 
                links can be generated automatically for calendar events.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Clients receive the meeting link in their booking confirmation email and can access 
            it from their session details in the app.
          </DocTip>
        </section>

        {/* Sync Status */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Sync Status & Troubleshooting
          </h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Connected & Syncing
              </h3>
              <p className="text-sm text-muted-foreground">
                Integration is active and syncing regularly. You'll see the last sync time.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Sync Delayed
              </h3>
              <p className="text-sm text-muted-foreground">
                Sync hasn't run recently. Usually resolves automatically. Try manual refresh 
                if it persists.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Connection Error
              </h3>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Try disconnecting and reconnecting the integration. 
                Check that you haven't revoked permissions.
              </p>
            </div>
          </div>

          <DocWarning className="mt-4">
            If you change your Google or Apple password, you may need to reconnect the integration 
            with new credentials.
          </DocWarning>
        </section>

        {/* Privacy & Security */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </h2>
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-muted-foreground">
              Your integration data is handled securely:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>OAuth is used where possible (no passwords stored for Google)</li>
              <li>App-specific passwords are encrypted at rest</li>
              <li>FitConnect only accesses calendar data, not emails or files</li>
              <li>You can revoke access anytime from your Google/Apple account settings</li>
            </ul>
          </div>
        </section>

        {/* Disconnecting */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Disconnecting Integrations</h2>
          <p className="text-muted-foreground mb-4">
            You can disconnect any integration at any time:
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Go to Settings → Integrations">
              Find the connected integration you want to remove.
            </DocStep>

            <DocStep stepNumber={2} title="Click Disconnect">
              Confirm that you want to disconnect. Existing calendar events won't be deleted, 
              but sync will stop.
            </DocStep>

            <DocStep stepNumber={3} title="Revoke Access (Optional)">
              For complete removal, also revoke FitConnect's access from your Google or Apple 
              account settings.
            </DocStep>
          </div>

          <DocInfo className="mt-4">
            Disconnecting doesn't delete existing bookings or calendar events. It only stops 
            future syncing.
          </DocInfo>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How often does calendar sync run?</h3>
              <p className="text-sm text-muted-foreground">
                Sync runs every few minutes in both directions. New bookings appear quickly, 
                but there may be a slight delay.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I connect multiple calendars?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can connect multiple Google calendars. All connected calendars' events 
                will block availability. FitConnect bookings sync to your primary calendar.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if I use Outlook?</h3>
              <p className="text-sm text-muted-foreground">
                Outlook calendar integration is not currently available. Consider syncing Outlook 
                to Google Calendar and then connecting Google Calendar to FitConnect.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do clients see my calendar details?</h3>
              <p className="text-sm text-muted-foreground">
                No, clients only see that times are unavailable. They cannot see the details of 
                your personal calendar events.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
