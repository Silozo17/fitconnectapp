import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymStaff() {
  return (
    <DocsLayout
      title="Staff Management"
      description="Invite team members, configure role-based permissions, manage shifts, and track staff time for your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Staff Management" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Manage your entire team from one place. Assign roles with appropriate permissions, 
          schedule shifts, and track hours worked.
        </p>
      </section>

      {/* Staff Roles */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Staff Roles</h2>
        <p className="text-muted-foreground mb-4">
          Each role has a pre-configured set of permissions, which you can customise:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Owner</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Full administrative access to everything
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Access all locations</li>
              <li>Manage billing and payments</li>
              <li>Configure all settings</li>
              <li>Manage other staff accounts</li>
              <li>View all financial data</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Area Manager</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Oversees multiple locations
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Access assigned locations</li>
              <li>View financials for their areas</li>
              <li>Manage staff within their locations</li>
              <li>Override bookings and memberships</li>
              <li>Process refunds (with limits)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Manager</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Full operational access for one location
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Manage members and memberships</li>
              <li>Edit schedule and classes</li>
              <li>View reports and analytics</li>
              <li>Process sales and payments</li>
              <li>Manage staff schedules</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Coach / Instructor</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Class teaching and member interaction
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>View their assigned classes</li>
              <li>Mark class attendance</li>
              <li>View member profiles (basic info)</li>
              <li>Add member notes</li>
              <li>Cannot process payments</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Front Desk / Staff</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Day-to-day member operations
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Check in members</li>
              <li>Create new memberships</li>
              <li>Process point-of-sale transactions</li>
              <li>View and edit member details</li>
              <li>Book classes for members</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Marketing</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Campaigns and lead management
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Create and send campaigns</li>
              <li>Manage leads and follow-ups</li>
              <li>Create promotions and promo codes</li>
              <li>View marketing analytics</li>
              <li>No access to member or financial data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Inviting Staff */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Inviting Staff Members</h2>

        <DocStep stepNumber={1} title="Navigate to Staff">
          <p>Go to your gym dashboard and click "Staff" in the sidebar.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Invite Staff">
          <p>Enter the staff member's email address and select their role.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Configure Access">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Locations</strong> - Which locations they can access</li>
            <li><strong>Start Date</strong> - When their access begins</li>
            <li><strong>Classes</strong> - For instructors, which class types they can teach</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Send Invitation">
          <p className="mb-4">
            The staff member will receive an email with instructions to create their account 
            and set up their profile.
          </p>
          <DocInfo>
            Invitations expire after 7 days. You can resend invitations from the Staff page.
          </DocInfo>
        </DocStep>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Customising Permissions</h2>
        <p className="text-muted-foreground mb-4">
          While roles have default permissions, you can customise them for your gym:
        </p>

        <DocStep stepNumber={1} title="Go to Settings → Permissions">
          <p>Open your gym settings and navigate to the Role Permissions section.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Select a Role">
          <p>Click on the role you want to customise (Manager, Coach, Staff, or Marketing).</p>
        </DocStep>

        <DocStep stepNumber={3} title="Toggle Permissions">
          <p className="mb-4">Enable or disable specific permissions:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Member Management</strong> - Create, edit, delete members</li>
            <li><strong>Membership Management</strong> - Cancel, freeze, create subscriptions</li>
            <li><strong>Financial</strong> - View revenue, process refunds, view reports</li>
            <li><strong>Classes</strong> - Manage schedule, override bookings</li>
            <li><strong>Staff</strong> - View and manage other staff</li>
            <li><strong>Marketing</strong> - Campaigns, leads, promotions</li>
          </ul>
          <DocWarning>
            Changes to role permissions affect all staff members with that role. 
            Consider creating custom roles if you need different permission sets.
          </DocWarning>
        </DocStep>
      </section>

      {/* Shift Scheduling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Shift Scheduling</h2>

        <h3 className="text-lg font-medium mb-3">Creating Shifts</h3>
        <p className="text-muted-foreground mb-4">
          Schedule staff shifts to ensure adequate coverage:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Create shifts for each role type</li>
          <li>Set start and end times</li>
          <li>Assign to specific staff members</li>
          <li>Set up recurring shift patterns</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Staff Availability</h3>
        <p className="text-muted-foreground mb-4">
          Staff can set their availability preferences:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Mark days they're available or unavailable</li>
          <li>Request time off in advance</li>
          <li>Set preferred working hours</li>
          <li>Managers can approve or deny requests</li>
        </ul>
        <DocTip>
          Encourage staff to keep their availability up to date. This makes scheduling 
          much easier and reduces last-minute changes.
        </DocTip>

        <h3 className="text-lg font-medium mb-3 mt-6">Shift Swapping</h3>
        <p className="text-muted-foreground mb-4">
          Allow staff to swap shifts with each other:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Staff requests a swap with a colleague</li>
          <li>Colleague accepts or declines</li>
          <li>Manager approves the swap</li>
          <li>Schedule updates automatically</li>
        </ul>
      </section>

      {/* Time Tracking */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Time Tracking</h2>

        <h3 className="text-lg font-medium mb-3">Clock In/Out</h3>
        <p className="text-muted-foreground mb-4">
          Staff can clock in and out using the admin app:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Simple clock in button when arriving</li>
          <li>Clock out when leaving</li>
          <li>Break tracking if enabled</li>
          <li>Location verification optional</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Timesheet Review</h3>
        <p className="text-muted-foreground mb-4">
          Managers can review and approve timesheets:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>View hours worked per staff member</li>
          <li>Compare against scheduled shifts</li>
          <li>Approve or adjust time entries</li>
          <li>Export for payroll processing</li>
        </ul>
        <DocInfo>
          You can set up automatic clock-out if a staff member forgets. This prevents 
          inflated hours from forgotten clock-outs.
        </DocInfo>
      </section>

      {/* Staff Profile */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Staff Profiles</h2>
        <p className="text-muted-foreground mb-4">
          Each staff member has a profile containing:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Personal and contact information</li>
          <li>Role and permission level</li>
          <li>Assigned locations</li>
          <li>For instructors: qualifications and certifications</li>
          <li>Working hours and time off records</li>
          <li>Activity history</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Instructor Bio</h3>
        <p className="text-muted-foreground mb-4">
          Instructors can add a public bio that members see:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Profile photo</li>
          <li>Biography and experience</li>
          <li>Specialities and certifications</li>
          <li>Classes they teach</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
