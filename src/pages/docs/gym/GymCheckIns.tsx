import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymCheckIns() {
  return (
    <DocsLayout
      title="Check-In System"
      description="Set up QR code check-ins, kiosk mode, and track member attendance at your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Check-In System" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Track who's in your gym and when with our flexible check-in system. Choose from 
          QR codes, kiosk mode, or staff-assisted check-ins.
        </p>
      </section>

      {/* Check-In Methods */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Check-In Methods</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">QR Code Check-In</h3>
            <p className="text-muted-foreground mb-3">
              Each member has a unique QR code in their app:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Member opens app and shows QR code</li>
              <li>Staff scans with tablet or phone</li>
              <li>Instant verification of membership status</li>
              <li>Works offline with periodic sync</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Self-Service Kiosk</h3>
            <p className="text-muted-foreground mb-3">
              Set up a tablet as a self-service kiosk:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Members scan their QR code at the kiosk</li>
              <li>Or enter their member ID/phone number</li>
              <li>Photo verification for added security</li>
              <li>No staff interaction required</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Staff-Assisted Check-In</h3>
            <p className="text-muted-foreground mb-3">
              Front desk can check members in manually:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Search by name, email, or phone</li>
              <li>View membership status at a glance</li>
              <li>Handle exceptions and overrides</li>
              <li>Good for new or walk-in members</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Class Check-In</h3>
            <p className="text-muted-foreground mb-3">
              For class-based check-ins:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Instructor marks attendance from their device</li>
              <li>Members check in to specific class</li>
              <li>Verifies booking before allowing entry</li>
              <li>Tracks class-specific attendance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Setting Up Kiosk Mode */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Setting Up Kiosk Mode</h2>

        <DocStep stepNumber={1} title="Get a Tablet">
          <p className="mb-4">
            Any modern tablet (iPad or Android) works. We recommend a 10"+ screen for 
            easy scanning.
          </p>
        </DocStep>

        <DocStep stepNumber={2} title="Enable Kiosk Mode">
          <p className="mb-4">
            Navigate to Settings → Check-In → Kiosk Mode and enable it for your location.
          </p>
        </DocStep>

        <DocStep stepNumber={3} title="Configure Settings">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Check-in Mode</strong> - QR only, PIN only, or both</li>
            <li><strong>Photo Display</strong> - Show member photo for verification</li>
            <li><strong>Success Message</strong> - Custom greeting after check-in</li>
            <li><strong>Auto-Timeout</strong> - Return to home screen after seconds</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Launch Kiosk App">
          <p className="mb-4">
            Open the kiosk URL on your tablet and lock it to the browser. This prevents 
            members from accessing other apps.
          </p>
          <DocTip>
            Use a tablet stand or wall mount at your entrance. Consider a rugged case for 
            high-traffic areas.
          </DocTip>
        </DocStep>
      </section>

      {/* QR Code System */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">QR Code System</h2>

        <h3 className="text-lg font-medium mb-3">Member QR Codes</h3>
        <p className="text-muted-foreground mb-4">
          Each member automatically has a unique QR code:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Generated when they join your gym</li>
          <li>Accessible in the member app under "Check-In"</li>
          <li>Can be saved to phone's wallet</li>
          <li>Printable card version available</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Scanning QR Codes</h3>
        <p className="text-muted-foreground mb-4">
          Staff can scan member QR codes using:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>The gym admin app on any smartphone</li>
          <li>A dedicated barcode scanner connected to a computer</li>
          <li>The kiosk tablet camera</li>
        </ul>
        <DocInfo>
          QR codes work even when the member's phone is offline. The code contains 
          encrypted member information.
        </DocInfo>

        <h3 className="text-lg font-medium mb-3 mt-6">Printed Member Cards</h3>
        <p className="text-muted-foreground mb-4">
          For members who prefer physical cards:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Download card template from member profile</li>
          <li>Print on card stock or use a card printer</li>
          <li>QR code and member ID on the card</li>
          <li>Optional: integrate with third-party card printers</li>
        </ul>
      </section>

      {/* Check-In Rules */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Check-In Rules & Validation</h2>

        <h3 className="text-lg font-medium mb-3">Membership Validation</h3>
        <p className="text-muted-foreground mb-4">
          When a member checks in, the system validates:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Membership is active and not frozen</li>
          <li>No outstanding payment issues</li>
          <li>Within allowed visit limits (if applicable)</li>
          <li>Correct location for their membership</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Check-In Alerts</h3>
        <p className="text-muted-foreground mb-4">
          Configure alerts for specific situations:
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
            <h4 className="font-medium text-green-500">Green - All Good</h4>
            <p className="text-sm text-muted-foreground">Member can enter freely</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
            <h4 className="font-medium text-yellow-500">Yellow - Note</h4>
            <p className="text-sm text-muted-foreground">Allow entry but flag for attention (e.g., contract unsigned)</p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <h4 className="font-medium text-red-500">Red - Blocked</h4>
            <p className="text-sm text-muted-foreground">Cannot enter - speak to staff (e.g., payment failed)</p>
          </div>
        </div>
        <DocWarning>
          Configure what happens when a blocked member tries to check in. You can 
          allow staff overrides with a reason.
        </DocWarning>
      </section>

      {/* Viewing Check-In Data */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Viewing Check-In Data</h2>

        <h3 className="text-lg font-medium mb-3">Live Dashboard</h3>
        <p className="text-muted-foreground mb-4">
          See who's currently in your gym:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Real-time count of members present</li>
          <li>List of currently checked-in members</li>
          <li>Average visit duration</li>
          <li>Capacity percentage if limits are set</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Check-In History</h3>
        <p className="text-muted-foreground mb-4">
          View historical check-in data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Filter by date range, member, or time of day</li>
          <li>See peak hours and quiet periods</li>
          <li>Export for external analysis</li>
          <li>Individual member attendance history</li>
        </ul>
      </section>

      {/* Reporting */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Attendance Reporting</h2>
        <p className="text-muted-foreground mb-4">
          Use check-in data to understand usage patterns:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Peak Hours</strong> - When is your gym busiest?</li>
          <li><strong>Member Engagement</strong> - Identify inactive members</li>
          <li><strong>Class Popularity</strong> - Which classes have best attendance?</li>
          <li><strong>Trends</strong> - Compare week-over-week or month-over-month</li>
        </ul>
        <DocTip>
          Set up automated reports to email you weekly attendance summaries. This helps 
          spot declining engagement early.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
