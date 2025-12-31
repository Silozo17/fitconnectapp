import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Users, BarChart3, Calendar, TrendingUp, Filter } from "lucide-react";

export default function CoachClientComparisonDocs() {
  return (
    <DocsLayout
      title="Client Comparison"
      description="Compare progress and metrics across multiple clients to identify patterns and optimise your coaching approach."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Client Comparison" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Coaches who want to analyse progress across multiple clients simultaneously, identify 
          successful patterns in their coaching methods, and make data-driven decisions about 
          programme adjustments.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          Client Comparison allows you to select up to four clients and view their progress 
          metrics side-by-side. You can compare weight changes, measurement trends, workout 
          completion rates, and more over customisable date ranges.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <BarChart3 className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">Visual Charts</h3>
            <p className="text-sm text-muted-foreground">
              Interactive charts showing overlaid progress data for easy comparison.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">Trend Analysis</h3>
            <p className="text-sm text-muted-foreground">
              See who is progressing fastest and identify plateaus.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground">
          Managing multiple clients means understanding what works across different body types, 
          goals, and lifestyles. Comparison tools help you spot which training or nutrition 
          approaches yield the best results, allowing you to refine your methods and provide 
          better outcomes for all clients.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <DocStep stepNumber={1} title="Access Client Comparison">
            Navigate to your coach dashboard and select "Client Comparison" from the sidebar menu.
          </DocStep>
          <DocStep stepNumber={2} title="Select Clients">
            Choose up to four clients from your roster to compare. You can search by name or 
            filter by tags/groups.
          </DocStep>
          <DocStep stepNumber={3} title="Choose Metrics">
            Select which metrics to compare: weight, body fat percentage, measurements, workout 
            completion, habit adherence, or custom metrics.
          </DocStep>
          <DocStep stepNumber={4} title="Set Date Range">
            Define the comparison period using preset ranges (7 days, 30 days, 90 days) or 
            custom date pickers.
          </DocStep>
          <DocStep stepNumber={5} title="Analyse Results">
            View the comparison charts and tables to identify patterns, outliers, and 
            opportunities for programme adjustments.
          </DocStep>
        </div>
      </section>

      {/* Understanding the Charts */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-6 w-6 text-primary" />
          Understanding the Charts
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Line Charts</h3>
            <p className="text-sm text-muted-foreground">
              Show progress over time with each client represented by a different colour. 
              Hover over data points for exact values.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Bar Charts</h3>
            <p className="text-sm text-muted-foreground">
              Compare total or average values side-by-side, such as total workouts completed 
              or average weekly weight change.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Summary Table</h3>
            <p className="text-sm text-muted-foreground">
              A tabular view showing start values, current values, absolute change, and 
              percentage change for each client.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Data Usage */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Privacy & Data Usage</h2>
        <DocInfo>
          Only data that clients have chosen to share with you is visible in comparison views. 
          Clients who have restricted certain metrics will show gaps in those data points.
        </DocInfo>
        <p className="text-muted-foreground mt-4">
          Comparison data is only visible to you and is not shared with the clients being 
          compared or any third parties.
        </p>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          Comparisons work best when clients have similar data logging frequency. Clients who 
          log sporadically may show misleading trends.
        </DocWarning>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
          <li>Maximum of 4 clients can be compared at once</li>
          <li>Historical data beyond 1 year may be aggregated for performance</li>
          <li>Wearable data requires clients to have connected devices</li>
          <li>Progress photos are not included in comparison views</li>
        </ul>
      </section>

      {/* Common Use Cases */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Common Use Cases
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Programme Effectiveness</h3>
            <p className="text-sm text-muted-foreground">
              Compare clients on similar programmes to see which variations produce better results.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Identify Struggling Clients</h3>
            <p className="text-sm text-muted-foreground">
              Quickly spot clients who are falling behind their peers and may need extra support.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Group Challenges</h3>
            <p className="text-sm text-muted-foreground">
              Track progress of clients participating in the same challenge or competition.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Can clients see who they are being compared to?</h3>
            <p className="text-sm text-muted-foreground">
              No, comparison data is private to you. Clients have no visibility into comparison views.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Why is some data missing for a client?</h3>
            <p className="text-sm text-muted-foreground">
              The client may not have logged data for those dates, or they may have restricted 
              sharing of that metric type in their privacy settings.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Can I export comparison data?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can export comparison charts as images or download the underlying data 
              as a CSV file for further analysis.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Can I compare past vs current performance for one client?</h3>
            <p className="text-sm text-muted-foreground">
              The comparison tool is designed for multiple clients. For single-client analysis, 
              use the individual client progress view with date range filtering.
            </p>
          </div>
        </div>
      </section>

      <DocTip>
        Use comparison insights during check-ins to motivate clients by showing how their 
        progress compares to their starting point and similar goals.
      </DocTip>
    </DocsLayout>
  );
}
