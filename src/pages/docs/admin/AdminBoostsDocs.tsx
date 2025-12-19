import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Rocket, DollarSign, Users, Settings } from "lucide-react";

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
          Boost is the pay-for-performance marketing feature that helps coaches acquire new clients. 
          Coaches pay a commission on the first booking from each new client acquired through Boost.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Revenue from Boost
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>View total Boost revenue by period</li>
          <li>Track number of clients acquired through Boost</li>
          <li>Monitor active boosted coaches</li>
          <li>See pending vs. collected commissions</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          Boost Settings
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Commission Rate</strong> - Default percentage charged (typically 30%)</li>
          <li><strong>Min/Max Fee</strong> - Floor and ceiling for commission amounts</li>
          <li><strong>Enable/Disable</strong> - Turn Boost on or off platform-wide</li>
        </ul>
      </section>
      <DocTip>Monitor Boost performance to ensure it's providing value to coaches and the platform.</DocTip>
    </DocsLayout>
  );
}
