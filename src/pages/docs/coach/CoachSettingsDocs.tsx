import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield, CreditCard, Link, Calendar, Eye } from "lucide-react";

export default function CoachSettingsDocs() {
  return (
    <DocsLayout
      title="Coach Settings"
      description="Configure your account preferences, notifications, privacy, and connected services."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Settings" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to customise their FitConnect experience, manage 
            notifications, configure privacy options, and connect external services like calendars 
            and payment processors.
          </p>
        </section>

        {/* Settings Overview */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Settings Overview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Update your personal information, bio, profile photo, and display preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Control which alerts you receive and how (in-app, email, push).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage password, two-factor authentication, and privacy options.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="h-4 w-4 text-primary" />
                  Connected Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Link calendars, payment accounts, and other external services.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Profile Settings */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </h2>
          <p className="text-muted-foreground mb-4">
            Your profile settings control how you appear on the platform:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Personal Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your name, email, phone number, and location. Your email is used for 
                account access and notifications.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Profile Photo & Bio</h3>
              <p className="text-sm text-muted-foreground">
                Upload a professional photo and write a compelling bio. These appear on your 
                public profile and in search results.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Specialties & Certifications</h3>
              <p className="text-sm text-muted-foreground">
                Add your areas of expertise and upload certification documents for verification.
              </p>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </h2>
          <p className="text-muted-foreground mb-4">
            Control which notifications you receive and how:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Booking Notifications</h3>
              <p className="text-sm text-muted-foreground">
                New booking requests, booking confirmations, cancellations, and reminders before 
                sessions.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Message Notifications</h3>
              <p className="text-sm text-muted-foreground">
                New messages from clients, photo shares, and check-in submissions.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Client Activity</h3>
              <p className="text-sm text-muted-foreground">
                Workout completions, goal achievements, at-risk alerts, and engagement updates.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Payment Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Payment received, subscription renewals, failed payments, and payout confirmations.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            You can set "quiet hours" to pause non-urgent notifications during specific times, 
            like overnight or during sessions.
          </DocTip>
        </section>

        {/* Security Settings */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Privacy
          </h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Password Management</h3>
              <p className="text-sm text-muted-foreground">
                Change your password regularly. Use a strong, unique password that you don't use 
                for other services.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security by requiring a code from your phone when logging 
                in. Highly recommended for all coaches.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                View and manage devices currently logged into your account. Sign out of sessions 
                you don't recognise.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Profile Visibility
              </h3>
              <p className="text-sm text-muted-foreground">
                Control whether your profile appears in public search results. Set to "Hidden" if 
                you only work with referred clients.
              </p>
            </div>
          </div>

          <DocWarning className="mt-4">
            If you suspect your account has been compromised, change your password immediately 
            and sign out of all sessions.
          </DocWarning>
        </section>

        {/* Connected Services */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Connected Services
          </h2>
          <p className="text-muted-foreground mb-4">
            Connect external services to enhance your coaching workflow:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Calendar Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect Google Calendar or Apple Calendar for two-way sync. Your bookings appear 
                on your calendar, and your calendar busy times block booking slots.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Stripe Connect
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to receive payments. Manage your payout schedule and 
                view transaction history.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Video Conferencing</h3>
              <p className="text-sm text-muted-foreground">
                Connect Zoom or Google Meet to automatically generate meeting links for online sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Subscription Management */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Subscription Management</h2>
          <p className="text-muted-foreground mb-4">
            Manage your FitConnect coach subscription:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                View your current subscription tier, features included, and billing cycle.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Upgrade/Downgrade</h3>
              <p className="text-sm text-muted-foreground">
                Change your plan to access more clients, features, or reduce costs. Changes take 
                effect at the next billing cycle.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Billing History</h3>
              <p className="text-sm text-muted-foreground">
                Download invoices and view past payments for your records.
              </p>
            </div>
          </div>
        </section>

        {/* How to Access Settings */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Accessing Settings</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Open Dashboard">
              Navigate to your coach dashboard from the main navigation.
            </DocStep>

            <DocStep stepNumber={2} title="Find Settings">
              Click the gear icon in the sidebar or your profile avatar and select "Settings".
            </DocStep>

            <DocStep stepNumber={3} title="Navigate Sections">
              Use the settings navigation to move between Profile, Notifications, Security, 
              Connections, and Subscription sections.
            </DocStep>

            <DocStep stepNumber={4} title="Save Changes">
              Most settings save automatically. Some changes (like password) require confirmation.
            </DocStep>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How do I delete my account?</h3>
              <p className="text-sm text-muted-foreground">
                Account deletion can be requested from Security settings. Note that this is 
                permanent and you must have no active clients or pending payouts.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I change my email address?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, update your email in Profile settings. You'll need to verify the new email 
                before the change takes effect.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What happens if I disconnect my calendar?</h3>
              <p className="text-sm text-muted-foreground">
                Existing bookings remain, but new sessions won't sync automatically. Reconnect 
                anytime to resume sync.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How do I enable 2FA?</h3>
              <p className="text-sm text-muted-foreground">
                Go to Security settings, click "Enable 2FA", and follow the prompts to scan a 
                QR code with an authenticator app.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
