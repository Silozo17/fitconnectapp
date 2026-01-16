import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Building2, Shield, Search, Settings, Users, TrendingUp } from "lucide-react";

export default function AdminGymsDocs() {
  return (
    <DocsLayout
      title="Gym Management | Admin Guide"
      description="Manage gym accounts on the platform. Verify new gyms, monitor activity, handle support requests, and configure platform-level gym settings."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Gyms" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Gym Roster Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Gym Management dashboard provides a complete view of all gym accounts registered on the platform:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Active Gyms</h3>
            <p className="text-sm text-muted-foreground">Verified gyms currently operating on the platform with active subscriptions.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Pending Verification</h3>
            <p className="text-sm text-muted-foreground">New gym applications awaiting document review and approval.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Suspended</h3>
            <p className="text-sm text-muted-foreground">Gyms with suspended accounts due to policy violations or payment issues.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Churned</h3>
            <p className="text-sm text-muted-foreground">Previously active gyms that have cancelled their subscriptions.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Finding Gyms
        </h2>
        <p className="text-muted-foreground mb-4">
          Use the search and filter tools to locate specific gym accounts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Search:</strong> Find by gym name, email, owner name, or location</li>
          <li><strong>Status Filter:</strong> Active, Pending, Suspended, Churned</li>
          <li><strong>Subscription Tier:</strong> Filter by current plan level</li>
          <li><strong>Location:</strong> Filter by city, county, or country</li>
          <li><strong>Date Range:</strong> Filter by registration or last activity date</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Gym Verification Queue
        </h2>
        <DocStep stepNumber={1} title="Review application">
          Open the pending gym's profile to view submitted documents and business details.
        </DocStep>
        <DocStep stepNumber={2} title="Verify documents">
          Check business registration, insurance certificates, and facility photos.
        </DocStep>
        <DocStep stepNumber={3} title="Background check">
          Verify the gym's online presence and reputation if applicable.
        </DocStep>
        <DocStep stepNumber={4} title="Make decision">
          Approve the gym to activate their account, or reject with a detailed reason.
        </DocStep>
        <DocWarning>
          Rejected gyms can reapply after 30 days. Provide clear feedback to help them address issues.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          Gym Actions
        </h2>
        <p className="text-muted-foreground mb-4">
          Available actions when viewing a gym profile:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">View Dashboard</h3>
            <p className="text-sm text-muted-foreground">Access the gym's admin view to see their members, classes, and settings.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Edit Details</h3>
            <p className="text-sm text-muted-foreground">Update gym information, contact details, or location data.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Manage Subscription</h3>
            <p className="text-sm text-muted-foreground">View, upgrade, downgrade, or grant complimentary subscription access.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Suspend Account</h3>
            <p className="text-sm text-muted-foreground">Temporarily disable a gym's access. Members cannot check in during suspension.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Impersonate</h3>
            <p className="text-sm text-muted-foreground">Access the gym owner's view for troubleshooting. All actions are logged.</p>
          </div>
        </div>
        <DocTip>
          Use impersonation sparingly and only when necessary for support purposes. All sessions are audited.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-500" />
          Gym Staff Management
        </h2>
        <p className="text-muted-foreground mb-4">
          View and manage staff members associated with each gym:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>See all staff roles (Owner, Manager, Coach, Staff)</li>
          <li>Reset staff passwords if needed</li>
          <li>Remove staff members in cases of policy violations</li>
          <li>View staff activity logs and permissions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Gym Analytics
        </h2>
        <p className="text-muted-foreground mb-4">
          Access platform-level insights about gym accounts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Growth Metrics:</strong> New gym signups over time</li>
          <li><strong>Retention:</strong> Gym churn rates and subscription renewals</li>
          <li><strong>Usage:</strong> Active members, classes scheduled, check-ins</li>
          <li><strong>Revenue:</strong> MRR contribution by gym tier</li>
        </ul>
        <DocTip>
          Export gym analytics to CSV for detailed reporting and board presentations.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
