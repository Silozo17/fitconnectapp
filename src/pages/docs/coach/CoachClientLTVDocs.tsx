import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocSection } from "@/components/docs/DocSection";
import { DocTip } from "@/components/docs/DocTip";
import { DocStep } from "@/components/docs/DocStep";
import { PoundSterling, TrendingUp, BarChart3, Users, Calculator, Shield } from "lucide-react";

export default function CoachClientLTVDocs() {
  return (
    <DocsLayout
      title="Client Lifetime Value (LTV)"
      description="Understand the financial value of your client relationships and make data-driven business decisions."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Client LTV" },
      ]}
    >
      <DocSection title="What is Client LTV?">
        <p className="text-muted-foreground mb-4">
          Client Lifetime Value (LTV) measures the total revenue a client generates 
          throughout their relationship with you. Understanding LTV helps you make 
          informed decisions about client acquisition, retention strategies, and 
          pricing.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Historical LTV</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Revenue already earned from subscriptions, packages, and sessions
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Projected LTV</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Estimated future revenue based on current engagement and patterns
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Revenue Components">
        <p className="text-muted-foreground mb-4">
          Historical LTV is calculated by summing all revenue streams from a client:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Subscriptions</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recurring monthly or annual subscription payments. Each billing cycle 
              adds to the client's historical LTV.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Packages</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              One-time package purchases (e.g., 10-session bundles). The full 
              package value is counted when purchased.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Individual Sessions</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Pay-per-session bookings. Each completed session adds its value 
              to the historical LTV.
            </p>
          </div>
        </div>
        <DocTip className="mt-4">
          Platform commission is automatically deducted from LTV calculations to 
          show your actual revenue, not gross bookings.
        </DocTip>
      </DocSection>

      <DocSection title="LTV Tiers">
        <p className="text-muted-foreground mb-4">
          Clients are automatically categorised into tiers based on how their LTV 
          compares to your average:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-card border-l-4 border-l-green-500">
            <h4 className="font-medium text-green-600 mb-1">High Value</h4>
            <p className="text-sm text-muted-foreground">
              LTV is 1.5× or more above your average
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card border-l-4 border-l-blue-500">
            <h4 className="font-medium text-blue-600 mb-1">Medium Value</h4>
            <p className="text-sm text-muted-foreground">
              LTV is between 0.5× and 1.5× of your average
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card border-l-4 border-l-yellow-500">
            <h4 className="font-medium text-yellow-600 mb-1">Low Value</h4>
            <p className="text-sm text-muted-foreground">
              LTV is below 0.5× of your average
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Projected LTV Calculation">
        <p className="text-muted-foreground mb-4">
          Future LTV is estimated using several factors:
        </p>
        <div className="space-y-4">
          <DocStep number={1} title="Average Monthly Revenue">
            Calculated from the client's historical spending patterns over their tenure.
          </DocStep>
          <DocStep number={2} title="Client Tenure">
            Longer-tenured clients typically have more predictable future revenue.
          </DocStep>
          <DocStep number={3} title="Engagement Score">
            Higher engagement indicates lower churn risk, increasing projected LTV.
          </DocStep>
          <DocStep number={4} title="Recent Activity">
            Active clients in the last 30 days receive higher projections than dormant ones.
          </DocStep>
        </div>
        <DocTip className="mt-4">
          Projected LTV is risk-adjusted based on engagement. A disengaged client 
          with high historical spending may have a lower projection than an engaged 
          client with moderate spending.
        </DocTip>
      </DocSection>

      <DocSection title="Using LTV Data">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Retention Focus</h4>
            <p className="text-sm text-muted-foreground">
              Prioritise retention efforts on high-LTV clients who show declining 
              engagement. Losing them has a greater business impact.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Pricing Decisions</h4>
            <p className="text-sm text-muted-foreground">
              Understanding average LTV helps you price packages and subscriptions 
              appropriately for your market.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Acquisition Strategy</h4>
            <p className="text-sm text-muted-foreground">
              Knowing your average LTV helps determine how much you can invest in 
              marketing to acquire new clients profitably.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Service Development</h4>
            <p className="text-sm text-muted-foreground">
              Analyse what high-LTV clients have in common to develop services 
              that attract similar clients.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="LTV Summary Metrics">
        <p className="text-muted-foreground mb-4">
          The LTV dashboard provides aggregate metrics across your entire client base:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Metric</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 font-medium">Total Historical LTV</td>
                <td className="py-2">Sum of all revenue earned from all clients</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Total Projected LTV</td>
                <td className="py-2">Estimated future revenue from current clients</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Average Client LTV</td>
                <td className="py-2">Mean LTV across your client base</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Top Clients</td>
                <td className="py-2">Your highest-value clients ranked by total LTV</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Tier Distribution</td>
                <td className="py-2">Breakdown of clients by high/medium/low tiers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Privacy & Data">
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Financial Data Security</h4>
            <p className="text-sm text-muted-foreground">
              LTV calculations use only transaction data already processed through 
              the platform. Financial information is visible only to you and is 
              never shared with clients. All data is encrypted and stored securely.
            </p>
          </div>
        </div>
      </DocSection>
    </DocsLayout>
  );
}
