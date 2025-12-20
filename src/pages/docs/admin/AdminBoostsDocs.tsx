import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Rocket, DollarSign, Users, Settings, CreditCard } from "lucide-react";

export default function AdminBoostsDocs() {
  return (
    <DocsLayout
      title="Boost Management"
      description="Monitor and manage the Boost marketing feature."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Boosts" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Boost Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Boost is the paid marketing feature that helps coaches acquire new clients. 
          Coaches pay £5 for 30 days of priority visibility, plus a 30% commission on 
          the first booking from each new client acquired through Boost.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-500" />
          Revenue Streams
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Activation Fees:</strong> £5 per 30-day Boost period (one-time payment)</li>
          <li><strong>First-Booking Commission:</strong> 30% of first session booking from new clients</li>
          <li>Track total Boost revenue by period</li>
          <li>Monitor pending vs. collected commissions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Active Boosts
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>View coaches with active (non-expired) Boost entitlements</li>
          <li>See expiry dates and days remaining</li>
          <li>Track clients acquired through each coach's Boost</li>
          <li>Monitor migrated legacy boosts (free extensions)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-amber-500" />
          Boost Settings
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Boost Price:</strong> Activation fee in pence (default: 500 = £5)</li>
          <li><strong>Boost Duration:</strong> Days per period (default: 30)</li>
          <li><strong>Commission Rate:</strong> Percentage charged on first bookings (default: 30%)</li>
          <li><strong>Min/Max Fee:</strong> Floor and ceiling for commission amounts</li>
          <li><strong>Enable/Disable:</strong> Turn Boost on or off platform-wide</li>
        </ul>
      </section>

      <DocTip>
        Monitor Boost performance to ensure it's providing value to coaches and the platform. 
        The paid model ensures only committed coaches use the feature.
      </DocTip>
    </DocsLayout>
  );
}
