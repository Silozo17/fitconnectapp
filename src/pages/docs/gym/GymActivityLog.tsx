import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymActivityLog() {
  return (
    <DocsLayout
      title="Activity Log"
      description="Track and monitor all staff actions, member activities, and system events in your gym with the comprehensive activity log."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Activity Log" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          The Activity Log provides a complete audit trail of everything happening in your gym. 
          Track staff actions, member changes, payment events, and system activities in one central location.
        </p>
      </section>

      {/* Understanding the Activity Log */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Understanding the Activity Log</h2>
        
        <p className="text-muted-foreground mb-4">
          Every action in your gym management system is recorded with detailed information:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Action Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Who performed the action</li>
              <li>• What action was taken</li>
              <li>• When it occurred (timestamp)</li>
              <li>• What was affected (member, class, etc.)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Tracked Categories</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Member management actions</li>
              <li>• Payment and billing events</li>
              <li>• Class and booking changes</li>
              <li>• Staff and permission updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Viewing the Activity Log */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Viewing the Activity Log</h2>

        <DocStep stepNumber={1} title="Navigate to Activity Log">
          <p>Go to your gym dashboard and click "Activity Log" in the sidebar under Settings or Operations.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Filter by Type">
          <p className="mb-4">Use the filter options to narrow down activities:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>All Activities</strong> - View everything</li>
            <li><strong>Member Actions</strong> - Signups, cancellations, profile updates</li>
            <li><strong>Payment Events</strong> - Charges, refunds, failed payments</li>
            <li><strong>Booking Changes</strong> - Class bookings, cancellations, waitlist moves</li>
            <li><strong>Staff Actions</strong> - Staff logins, permission changes, manual overrides</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Filter by Date Range">
          <p>Select a specific date range to focus on recent or historical activities.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Search for Specific Events">
          <p>Use the search bar to find activities related to a specific member, staff member, or action type.</p>
        </DocStep>

        <DocTip>
          Click on any activity entry to see detailed information including before/after values for changes.
        </DocTip>
      </section>

      {/* Activity Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Activity Types Explained</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-blue-500">Member Activities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Member created / Member updated</li>
              <li>• Membership started / cancelled / frozen</li>
              <li>• Check-in recorded / Manual check-in</li>
              <li>• Profile photo changed</li>
              <li>• Emergency contact updated</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-green-500">Payment Activities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Payment successful / Payment failed</li>
              <li>• Refund issued (full/partial)</li>
              <li>• Invoice generated / Invoice sent</li>
              <li>• Credit applied to account</li>
              <li>• Pro-rata adjustment made</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-purple-500">Booking Activities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Class booked / Class cancelled</li>
              <li>• Added to waitlist / Moved from waitlist</li>
              <li>• Marked as attended / No-show recorded</li>
              <li>• Late cancellation fee applied</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-orange-500">Staff Activities</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Staff logged in / Staff logged out</li>
              <li>• Permissions updated</li>
              <li>• Manual override performed</li>
              <li>• Settings changed</li>
              <li>• Bulk action executed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Staff-Specific Logs */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Staff-Specific Activity Tracking</h2>
        
        <p className="text-muted-foreground mb-4">
          Monitor individual staff member activities for accountability and training purposes:
        </p>

        <DocStep stepNumber={1} title="View Staff Member's Actions">
          <p>Click on a staff member's name in the log or filter by staff member to see all their actions.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Generate Staff Reports">
          <p>Export activity reports for individual staff members for performance reviews or investigations.</p>
        </DocStep>

        <DocInfo>
          Area managers and owners can view activity logs across all locations. 
          Individual location managers only see their location's activities.
        </DocInfo>
      </section>

      {/* Exporting Activity Logs */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Exporting Activity Logs</h2>

        <DocStep stepNumber={1} title="Set Your Filters">
          <p>Apply date range, activity type, and any other filters you need.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Export">
          <p>Click the "Export" button to download the filtered activities as a CSV file.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Use for Compliance">
          <p>Activity exports can be used for compliance audits, dispute resolution, or internal reviews.</p>
        </DocStep>

        <DocWarning>
          Activity logs are retained for 12 months. Export any logs you need to keep longer before they expire.
        </DocWarning>
      </section>

      {/* Security and Privacy */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Security and Privacy</h2>
        
        <p className="text-muted-foreground mb-4">
          Activity logs contain sensitive information and are protected accordingly:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Only authorized staff with appropriate permissions can view the activity log</li>
          <li>Sensitive data (payment details, personal info) is masked in log entries</li>
          <li>All activity log access is itself logged for security</li>
          <li>Logs cannot be edited or deleted to maintain audit integrity</li>
        </ul>

        <DocTip>
          Set up role-based permissions to control who can access the activity log. 
          Front desk staff typically don't need full log access.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
