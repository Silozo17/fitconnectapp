import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";

export default function AdminSettingsDocs() {
  return (
    <DocsLayout
      title="Platform Settings | Admin Guide"
      description="Configure global platform settings, feature flags, subscription tiers, and commission rates. Manage system-wide preferences."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Settings" }]}
      noIndex
    >
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What It Is</h2>
        <p className="text-muted-foreground">
          Platform Settings allows administrators to configure global options that affect the 
          entire FitConnect platform. This includes feature toggles, subscription tiers, 
          commission rates, and system-wide preferences.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Why It Matters</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Control platform behavior without code changes</li>
          <li>Quickly enable or disable features for testing or rollout</li>
          <li>Adjust business parameters like commission rates</li>
          <li>Manage subscription tier definitions and pricing</li>
          <li>Configure integration settings and API connections</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Settings Categories</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Feature Flags</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Toggle platform features on or off globally:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI-powered recommendations</li>
              <li>• Wearable device integrations</li>
              <li>• Community challenges</li>
              <li>• Leaderboards and gamification</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Subscription Tiers</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Configure coach subscription plans:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tier names and descriptions</li>
              <li>• Pricing and billing cycles</li>
              <li>• Client limits per tier</li>
              <li>• Feature access per tier</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Commission & Fees</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Manage platform revenue settings:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Boost commission percentage</li>
              <li>• Transaction fees</li>
              <li>• Minimum and maximum fees</li>
              <li>• Currency settings</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Integrations</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Third-party service configurations:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Payment gateway settings</li>
              <li>• Email service configuration</li>
              <li>• Push notification settings</li>
              <li>• Analytics tracking</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        
        <DocStep stepNumber={1} title="Access Settings">
          Navigate to Admin Dashboard → Settings to view all configurable options.
        </DocStep>

        <DocStep stepNumber={2} title="Select Category">
          Choose the settings category you want to modify from the sidebar or tabs.
        </DocStep>

        <DocStep stepNumber={3} title="Make Changes">
          Update the values as needed. Some changes take effect immediately while others 
          may require a save action.
        </DocStep>

        <DocStep stepNumber={4} title="Confirm and Save">
          Review your changes and click Save. Critical changes may require confirmation.
        </DocStep>

        <DocWarning>
          Changes to subscription tiers or commission rates affect existing coaches. 
          Consider grandfather clauses for current subscribers before making changes.
        </DocWarning>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Test feature flags in staging before enabling in production</li>
          <li>Document reasons for significant setting changes</li>
          <li>Communicate pricing changes to affected users in advance</li>
          <li>Keep backup of current settings before major changes</li>
          <li>Review settings quarterly to ensure they align with business goals</li>
        </ul>

        <DocTip className="mt-4">
          Use feature flags to gradually roll out new features to a subset of users 
          before full platform release.
        </DocTip>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Can I revert a setting change?</h3>
            <p className="text-muted-foreground">
              Most settings can be changed back immediately. Check the audit log to see 
              previous values if needed.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Do settings changes affect existing data?</h3>
            <p className="text-muted-foreground">
              Generally no. Settings affect future behavior. Historical data and existing 
              subscriptions typically remain unchanged.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Who can access platform settings?</h3>
            <p className="text-muted-foreground">
              Only administrators with the appropriate permissions can view and modify 
              platform settings.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <ul className="list-disc list-inside space-y-1 text-primary">
          <li><a href="/docs/admin/analytics" className="hover:underline">Analytics & Reports</a></li>
          <li><a href="/docs/admin/audit-logs" className="hover:underline">Audit Logs</a></li>
          <li><a href="/docs/admin/financial" className="hover:underline">Financial Management</a></li>
        </ul>
      </section>
    </DocsLayout>
  );
}
