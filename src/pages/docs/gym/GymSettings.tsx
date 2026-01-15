import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";

export default function GymSettings() {
  return (
    <DocsLayout
      title="Settings"
      description="Configure branding, notifications, permissions, and integrations for your gym."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Settings" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Customize your gym's configuration to match your business needs.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Settings Sections</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">General</h4>
            <p className="text-sm text-muted-foreground">Gym name, contact info, timezone, currency, and VAT settings.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Branding</h4>
            <p className="text-sm text-muted-foreground">Logo, colours, and banner images for member-facing areas.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Notifications</h4>
            <p className="text-sm text-muted-foreground">Configure email templates and notification preferences.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Permissions</h4>
            <p className="text-sm text-muted-foreground">Customize what each staff role can access and modify.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Billing</h4>
            <p className="text-sm text-muted-foreground">Stripe connection, payment retry rules, and invoice settings.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Check-In</h4>
            <p className="text-sm text-muted-foreground">Kiosk mode, QR settings, and access rules.</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <DocTip>Review your settings quarterly to ensure they match your current business operations. As you grow, you may need to adjust permissions and automation rules.</DocTip>
      </section>
    </DocsLayout>
  );
}
