import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Plug, CheckCircle, AlertTriangle, Settings } from "lucide-react";

export default function AdminIntegrationsDocs() {
  return (
    <DocsLayout
      title="Integrations"
      description="Monitor and configure third-party integrations."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Integrations" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Integration Status
        </h2>
        <p className="text-muted-foreground mb-4">
          Monitor the health of platform integrations and configure connection settings.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium">Stripe</h3>
              <p className="text-sm text-muted-foreground">Payment processing and coach payouts</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium">Email Service</h3>
              <p className="text-sm text-muted-foreground">Transactional and marketing emails</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium">Wearables</h3>
              <p className="text-sm text-muted-foreground">Apple Health, Google Fit, Fitbit, Garmin</p>
            </div>
          </div>
        </div>
      </section>
      <DocTip>Check the integrations page regularly to ensure all services are connected properly.</DocTip>
    </DocsLayout>
  );
}
