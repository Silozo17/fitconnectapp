import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Bell, Settings, Smartphone, Mail, MessageSquare, Calendar } from "lucide-react";

export default function ClientNotificationsDocs() {
  return (
    <DocsLayout
      title="Notification Settings | Client Guide"
      description="Manage how and when FitConnect notifies you about messages, bookings, challenges, and more. Customize your notification preferences."
      breadcrumbs={[{ label: "Client Guide", href: "/docs/client" }, { label: "Notifications" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Channels
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect can notify you through multiple channels. Configure each to match your preferences:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Push Notifications</h3>
            </div>
            <p className="text-sm text-muted-foreground">Instant alerts on your mobile device or browser. Best for time-sensitive updates.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Email</h3>
            </div>
            <p className="text-sm text-muted-foreground">Detailed notifications delivered to your inbox. Good for summaries and important updates.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">In-App Messages</h3>
            </div>
            <p className="text-sm text-muted-foreground">Notifications within the app. Always on and visible when you're active.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">SMS (Optional)</h3>
            </div>
            <p className="text-sm text-muted-foreground">Text message alerts for critical notifications. Requires phone number verification.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          Configuring Notifications
        </h2>
        <DocStep stepNumber={1} title="Open notification settings">
          Navigate to Profile → Settings → Notifications.
        </DocStep>
        <DocStep stepNumber={2} title="Choose notification type">
          Select which category you want to configure (Messages, Bookings, Challenges, etc.).
        </DocStep>
        <DocStep stepNumber={3} title="Toggle channels">
          For each notification type, enable or disable specific channels (push, email, SMS).
        </DocStep>
        <DocStep stepNumber={4} title="Set quiet hours">
          Optionally configure times when non-urgent notifications are muted.
        </DocStep>
        <DocStep stepNumber={5} title="Save changes">
          Your preferences are saved automatically.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Notification Categories
        </h2>
        <p className="text-muted-foreground mb-4">
          Configure notifications independently for each category:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Messages</h3>
            <p className="text-sm text-muted-foreground">New messages from coaches, gyms, and connections. Includes chat and announcements.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Bookings & Sessions</h3>
            <p className="text-sm text-muted-foreground">Booking confirmations, reminders, cancellations, and schedule changes.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Challenges & Achievements</h3>
            <p className="text-sm text-muted-foreground">Challenge invites, progress updates, completions, and badge unlocks.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Workout & Nutrition</h3>
            <p className="text-sm text-muted-foreground">Plan updates, habit reminders, and coach feedback on your progress.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Gym Updates</h3>
            <p className="text-sm text-muted-foreground">Class changes, gym announcements, membership renewals, and promotions.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Social & Connections</h3>
            <p className="text-sm text-muted-foreground">Friend requests, connection activity, and leaderboard updates.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Payments & Billing</h3>
            <p className="text-sm text-muted-foreground">Payment confirmations, subscription renewals, and invoice availability.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Quiet Hours & Do Not Disturb
        </h2>
        <p className="text-muted-foreground mb-4">
          Set times when you don't want to be disturbed:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Quiet Hours:</strong> Set a daily window (e.g., 10pm - 7am) when push notifications are silenced</li>
          <li><strong>Do Not Disturb:</strong> Temporarily mute all notifications for a set duration</li>
          <li><strong>Workout Mode:</strong> Auto-enable DND during logged workouts</li>
        </ul>
        <DocTip>
          Important notifications like session cancellations can optionally bypass quiet hours.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Email Digest Options</h2>
        <p className="text-muted-foreground mb-4">
          Instead of individual emails, receive consolidated digests:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Daily Digest:</strong> Summary of all activity from the past 24 hours</li>
          <li><strong>Weekly Summary:</strong> Overview of your week including progress and upcoming sessions</li>
          <li><strong>Instant Only:</strong> Only receive emails for urgent matters (cancellations, payments)</li>
        </ul>
        <DocWarning>
          Switching to digest mode means you'll receive delayed notifications. Keep push enabled for time-sensitive items.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Notifications</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Not receiving push notifications?</h3>
            <p className="text-sm text-muted-foreground">Check your device settings to ensure FitConnect has notification permissions enabled.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Emails going to spam?</h3>
            <p className="text-sm text-muted-foreground">Add notifications@fitconnect.app to your contacts or safe senders list.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Too many notifications?</h3>
            <p className="text-sm text-muted-foreground">Use the category settings to disable less important notification types.</p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
