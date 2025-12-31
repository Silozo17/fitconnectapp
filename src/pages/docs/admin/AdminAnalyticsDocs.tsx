import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";

export default function AdminAnalyticsDocs() {
  return (
    <DocsLayout
      title="Platform Analytics"
      description="Track user growth, engagement, and platform health metrics."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Analytics" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Key Metrics
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /> User Growth</h3>
            <p className="text-sm text-muted-foreground">New signups, conversion rates, and churn metrics over time.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><Activity className="h-4 w-4 text-green-500" /> Engagement</h3>
            <p className="text-sm text-muted-foreground">DAU/MAU, session frequency, and feature usage.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-500" /> Conversion Funnels</h3>
            <p className="text-sm text-muted-foreground">Track user journey from signup to first booking.</p>
          </div>
        </div>
      </section>
      <DocTip>Use date range filters to compare metrics across different time periods.</DocTip>
    </DocsLayout>
  );
}
