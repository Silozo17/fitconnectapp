import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Shield, Users, BarChart3, Settings } from "lucide-react";

export default function AdminOverview() {
  return (
    <DocsLayout
      title="Admin Overview"
      description="Introduction to the admin dashboard and platform management capabilities."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Admin Guide" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">
          The admin dashboard provides comprehensive tools for managing the platform, 
          users, and coaches.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Customizable Widgets</h3>
            <p className="text-sm text-muted-foreground">
              Drag-and-drop widgets to customize your dashboard layout. Show the 
              metrics and data most relevant to your role.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Monitor platform health with live data on user signups, revenue, 
              sessions, and engagement.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Perform common tasks quickly from the dashboard: verify coaches, 
              review reports, manage users.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Date Range Filters</h3>
            <p className="text-sm text-muted-foreground">
              Filter all analytics by date range and compare against previous 
              periods to track growth.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          User Management
        </h2>
        <p className="text-muted-foreground">
          Manage all platform users from a single interface.
        </p>

        <DocStep number={1} title="View All Users">
          Access the <strong>Users</strong> page to see all registered clients 
          with their status, join date, and activity.
        </DocStep>

        <DocStep number={2} title="User Actions">
          For each user you can: view details, edit profile, reset password, 
          change status (active/suspended/banned), or delete account.
        </DocStep>

        <DocStep number={3} title="Bulk Operations">
          Select multiple users to perform bulk actions like status changes or 
          account deletions.
        </DocStep>

        <DocTip type="warning">
          All admin actions are logged in the audit trail. Ensure you have 
          proper authorization before making changes.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Coach Management
        </h2>
        <p className="text-muted-foreground">
          Oversee all coaches on the platform.
        </p>

        <DocStep number={1} title="View Coach Roster">
          The <strong>Coaches</strong> page lists all coaches with their verification 
          status, subscription tier, and performance metrics.
        </DocStep>

        <DocStep number={2} title="Verification Queue">
          Review and process coach verification requests. Approve or reject 
          submitted documents with feedback.
        </DocStep>

        <DocStep number={3} title="Coach Actions">
          Edit coach profiles, manage subscriptions, grant free plan access, 
          or take moderation actions as needed.
        </DocStep>

        <DocTip type="info">
          Use the verification queue filter to quickly see coaches awaiting 
          document review.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Platform Settings
        </h2>
        <p className="text-muted-foreground">
          Configure platform-wide settings and features.
        </p>

        <DocStep number={1} title="Revenue & Subscriptions">
          Monitor platform revenue, manage subscription tiers, and track 
          payment processing.
        </DocStep>

        <DocStep number={2} title="Challenges & Gamification">
          Create and manage platform-wide challenges, badge systems, and 
          leaderboard configurations.
        </DocStep>

        <DocStep number={3} title="Integrations">
          Monitor integration health for Stripe, video conferencing, wearable 
          connections, and other third-party services.
        </DocStep>

        <DocStep number={4} title="Audit Log">
          Review the complete history of admin actions for compliance and 
          accountability.
        </DocStep>

        <DocTip type="tip">
          Regularly review the audit log to ensure all admin activities are 
          appropriate and authorized.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
