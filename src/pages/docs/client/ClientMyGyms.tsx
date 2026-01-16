import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Building2, CreditCard, Calendar, QrCode, Bell, Users } from "lucide-react";

export default function ClientMyGyms() {
  return (
    <DocsLayout
      title="My Gyms | Client Guide"
      description="Manage your gym memberships, view schedules, book classes, and access member benefits all from your FitConnect dashboard."
      breadcrumbs={[{ label: "Client Guide", href: "/docs/client" }, { label: "My Gyms" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Your Gym Memberships
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect allows you to hold memberships at multiple gyms simultaneously. Access all your memberships, 
          class schedules, and member benefits from a single dashboard.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">View Memberships</h3>
            <p className="text-sm text-muted-foreground">See all active and paused memberships with their status, renewal dates, and included benefits.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Member Dashboard</h3>
            <p className="text-sm text-muted-foreground">Quick access to check-in codes, upcoming classes, and credit balances for each gym.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Booking Classes
        </h2>
        <DocStep stepNumber={1} title="Select your gym">
          Navigate to "My Gyms" and choose the gym where you want to book a class.
        </DocStep>
        <DocStep stepNumber={2} title="Browse the timetable">
          View the weekly schedule filtered by class type, instructor, or time of day.
        </DocStep>
        <DocStep stepNumber={3} title="Book your spot">
          Click on a class to see details and availability. Tap "Book" to reserve your spot.
        </DocStep>
        <DocStep stepNumber={4} title="Add to calendar">
          Optionally sync the booking to your phone calendar for reminders.
        </DocStep>
        <DocTip>
          Enable notifications to receive reminders before your booked classes and alerts when waitlisted spots open up.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-green-500" />
          Check-In Process
        </h2>
        <p className="text-muted-foreground mb-4">
          Most gyms use QR code check-in. Here's how it works:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>QR Code Check-In:</strong> Open your membership card and scan at the gym entrance</li>
          <li><strong>Class Check-In:</strong> Show your booking QR code to the instructor</li>
          <li><strong>Remote Check-In:</strong> Some gyms allow checking in via the app when nearby</li>
        </ul>
        <DocWarning>
          Check-in codes refresh periodically for security. Always use the current code displayed in the app.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          Managing Credits & Payments
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Credit Balance</h3>
            <p className="text-sm text-muted-foreground">View your remaining class credits and expiry dates for each gym membership.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Purchase Credits</h3>
            <p className="text-sm text-muted-foreground">Buy additional credit packages directly through the app using saved payment methods.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Payment History</h3>
            <p className="text-sm text-muted-foreground">View all transactions, download invoices, and manage recurring payments.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          Membership Notifications
        </h2>
        <p className="text-muted-foreground mb-4">
          Stay informed about your gym memberships:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Renewal Reminders:</strong> Get notified before your membership renews</li>
          <li><strong>Class Reminders:</strong> Receive alerts before booked classes</li>
          <li><strong>Schedule Changes:</strong> Be notified if a class is cancelled or rescheduled</li>
          <li><strong>Credit Expiry:</strong> Alerts when credits are about to expire</li>
          <li><strong>Gym Announcements:</strong> Important updates from your gym</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-500" />
          Family & Linked Accounts
        </h2>
        <p className="text-muted-foreground mb-4">
          If your gym offers family memberships, you can manage linked accounts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>View all family members under your primary account</li>
          <li>Book classes on behalf of linked family members</li>
          <li>Manage payment methods for the entire family</li>
          <li>Switch between accounts to view individual schedules</li>
        </ul>
        <DocTip>
          Contact your gym directly to set up or modify family account relationships.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
