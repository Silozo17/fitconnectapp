import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymCheckInManagement() {
  return (
    <DocsLayout
      title="Check-In Management"
      description="Advanced check-in workflows, QR codes, kiosk mode, manual check-ins, and managing member access at your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Check-In Management" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          FitConnect offers flexible check-in options to suit any gym setup. From self-service kiosks 
          to staff-assisted check-ins, manage member access efficiently while tracking attendance data.
        </p>
      </section>

      {/* Check-In Methods */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Check-In Methods</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">QR Code Scanning</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Members scan their personal QR code at entry using the gym's scanner or tablet.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Fastest method for high-traffic periods</li>
              <li>• Works with phone's digital wallet</li>
              <li>• Unique code per member prevents sharing</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Self-Service Kiosk</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Members check in using a tablet in kiosk mode at reception.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Name or phone number lookup</li>
              <li>• Photo verification option</li>
              <li>• Book classes directly from kiosk</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Staff-Assisted Check-In</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Staff check members in from the dashboard.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Quick search by name or membership ID</li>
              <li>• Handle exceptions and overrides</li>
              <li>• Process day passes for non-members</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Mobile App Check-In</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Members check in via the mobile app when within gym proximity.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Location-based verification</li>
              <li>• Reduces queue at reception</li>
              <li>• Optional PIN confirmation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Setting Up Kiosk Mode */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Setting Up Kiosk Mode</h2>

        <DocStep stepNumber={1} title="Prepare Your Device">
          <p>Use a dedicated tablet (iPad or Android) mounted at reception. Ensure stable internet connection.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Enable Kiosk Mode">
          <p>Go to Settings → Check-In → Kiosk Mode and click "Enable Kiosk Mode".</p>
        </DocStep>

        <DocStep stepNumber={3} title="Configure Display Options">
          <p className="mb-4">Customise what members see:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Show gym logo and welcome message</li>
            <li>Enable/disable photo verification</li>
            <li>Show today's classes</li>
            <li>Allow class booking from kiosk</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Lock the Device">
          <p>Use your device's guided access or kiosk lock feature to prevent members from exiting the app.</p>
        </DocStep>

        <DocTip>
          Position the kiosk where staff can see it but members have privacy when entering their details.
        </DocTip>
      </section>

      {/* QR Code System */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">QR Code System</h2>

        <h3 className="text-xl font-medium mb-4">Member QR Codes</h3>
        <p className="text-muted-foreground mb-4">
          Each member receives a unique QR code in their profile:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Displayed in the mobile app</li>
          <li>Can be added to Apple Wallet or Google Wallet</li>
          <li>Printable for physical cards</li>
          <li>Regeneratable if compromised</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Scanner Setup</h3>
        <p className="text-muted-foreground mb-4">
          You can use various scanner options:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>USB Scanner</strong> - Connect to your reception computer</li>
          <li><strong>Tablet Camera</strong> - Use the built-in camera in scanner mode</li>
          <li><strong>Dedicated Scanner</strong> - Standalone Bluetooth scanner device</li>
        </ul>

        <DocInfo>
          QR codes contain encrypted member IDs. They cannot be copied or used by other members.
        </DocInfo>
      </section>

      {/* Manual Check-Ins */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Manual Check-Ins</h2>

        <p className="text-muted-foreground mb-4">
          Sometimes you need to check members in manually:
        </p>

        <DocStep stepNumber={1} title="Search for the Member">
          <p>Use the quick search in the dashboard to find the member by name, email, or phone.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Verify Identity">
          <p>Confirm the member's identity visually or ask for ID if your policies require it.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Click Check In">
          <p>Click the "Check In" button on their profile. The system records the staff member who performed the check-in.</p>
        </DocStep>

        <h3 className="text-xl font-medium mb-4 mt-6">Override Scenarios</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-yellow-500">Expired Membership</h4>
            <p className="text-sm text-muted-foreground">
              Staff can grant one-time access pending payment. Logged for follow-up.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-yellow-500">Frozen Account</h4>
            <p className="text-sm text-muted-foreground">
              Managers can temporarily unfreeze for a single visit with documented reason.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-blue-500">Guest Pass</h4>
            <p className="text-sm text-muted-foreground">
              Process day passes for guests or prospective members.
            </p>
          </div>
        </div>

        <DocWarning>
          All overrides are logged in the activity log. Excessive overrides should be reviewed by management.
        </DocWarning>
      </section>

      {/* Class Check-Ins */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Class Check-Ins</h2>

        <p className="text-muted-foreground mb-4">
          Track attendance for specific classes separately from general gym access:
        </p>

        <h3 className="text-xl font-medium mb-4">Instructor Check-In</h3>
        <DocStep stepNumber={1} title="Open Class Roster">
          <p>The instructor opens their class from the app or dashboard.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Mark Attendance">
          <p>Check off members as they arrive. Unmarked members are recorded as no-shows after class starts.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Handle Late Arrivals">
          <p>Late arrivals can still be checked in with a "late" flag for reporting.</p>
        </DocStep>

        <h3 className="text-xl font-medium mb-4 mt-6">Self-Check-In for Classes</h3>
        <p className="text-muted-foreground mb-4">
          Members can check into classes at the gym kiosk or via the app:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Only shows classes they're booked into</li>
          <li>Time-limited window (e.g., 15 mins before to 5 mins after start)</li>
          <li>Automatically frees no-show spots for waitlist</li>
        </ul>
      </section>

      {/* Access Control Rules */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Access Control Rules</h2>

        <p className="text-muted-foreground mb-4">
          Configure rules that determine member access:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Membership Status</h4>
            <p className="text-sm text-muted-foreground">
              Only active members can check in. Frozen, cancelled, or past-due accounts are blocked.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Access Hours</h4>
            <p className="text-sm text-muted-foreground">
              Restrict certain membership types to specific hours (e.g., off-peak only).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Location Access</h4>
            <p className="text-sm text-muted-foreground">
              For multi-location gyms, control which locations members can access.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Visit Limits</h4>
            <p className="text-sm text-muted-foreground">
              Enforce visit caps for limited memberships or credit-based plans.
            </p>
          </div>
        </div>

        <DocTip>
          Set up alerts to notify staff when a member with special notes (medical, payment issues) checks in.
        </DocTip>
      </section>

      {/* Check-In Reports */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Check-In Reports</h2>
        
        <p className="text-muted-foreground mb-4">
          Analyse check-in data to optimise operations:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Daily Traffic Report</strong> - Check-ins by hour</li>
          <li><strong>Member Frequency Report</strong> - How often members visit</li>
          <li><strong>No-Show Report</strong> - Members who booked but didn't attend</li>
          <li><strong>Override Report</strong> - All manual overrides for audit</li>
          <li><strong>Peak Hours Analysis</strong> - Identify busy periods for staffing</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
