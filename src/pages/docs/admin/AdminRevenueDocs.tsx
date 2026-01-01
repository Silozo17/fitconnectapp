import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { DollarSign, TrendingUp, CreditCard, PieChart } from "lucide-react";

export default function AdminRevenueDocs() {
  return (
    <DocsLayout
      title="Revenue Dashboard | Admin Guide"
      description="Track platform revenue, MRR, coach payouts, and commission earnings. Monitor transaction volume and financial health."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Revenue" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Revenue Metrics
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="font-medium">MRR</h3>
            <p className="text-sm text-muted-foreground">Monthly recurring revenue from coach subscriptions.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">Transaction Volume</h3>
            <p className="text-sm text-muted-foreground">Total payments processed through the platform.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <PieChart className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-medium">Commission Revenue</h3>
            <p className="text-sm text-muted-foreground">Earnings from Boost and transaction fees.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <DollarSign className="h-6 w-6 text-amber-500 mb-2" />
            <h3 className="font-medium">Coach Payouts</h3>
            <p className="text-sm text-muted-foreground">Total amount paid out to coaches via Stripe.</p>
          </div>
        </div>
      </section>
      <DocTip>Export revenue reports as CSV for accounting and tax purposes.</DocTip>
    </DocsLayout>
  );
}
