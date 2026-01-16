import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymAnalyticsDashboard() {
  return (
    <DocsLayout
      title="Analytics Dashboard"
      description="Understand your gym's performance with comprehensive analytics covering revenue, retention, member engagement, and growth metrics."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Analytics Dashboard" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          The Analytics Dashboard gives you a complete picture of your gym's health. 
          Track key metrics, identify trends, and make data-driven decisions to grow your business.
        </p>
      </section>

      {/* Dashboard Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Key Metrics</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Monthly Recurring Revenue (MRR)</li>
              <li>• Active member count</li>
              <li>• New signups this month</li>
              <li>• Churn rate percentage</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Engagement Stats</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Average visits per member</li>
              <li>• Class attendance rates</li>
              <li>• Peak hours analysis</li>
              <li>• Member retention score</li>
            </ul>
          </div>
        </div>

        <DocTip>
          The dashboard updates in real-time. Set it as your homepage to monitor your gym's pulse at a glance.
        </DocTip>
      </section>

      {/* Revenue Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Revenue Analytics</h2>

        <h3 className="text-xl font-medium mb-4">Monthly Recurring Revenue (MRR)</h3>
        <p className="text-muted-foreground mb-4">
          Track your predictable monthly income from memberships:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Current MRR</strong> - Total monthly membership revenue</li>
          <li><strong>MRR Growth</strong> - Month-over-month change</li>
          <li><strong>New MRR</strong> - Revenue from new signups</li>
          <li><strong>Churned MRR</strong> - Revenue lost from cancellations</li>
          <li><strong>Expansion MRR</strong> - Revenue from upgrades</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Revenue Breakdown</h3>
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">By Membership Type</h4>
            <p className="text-sm text-muted-foreground">
              See which membership plans generate the most revenue.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">By Location</h4>
            <p className="text-sm text-muted-foreground">
              Compare revenue across your gym locations.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">By Product Category</h4>
            <p className="text-sm text-muted-foreground">
              Break down revenue between memberships, classes, and retail.
            </p>
          </div>
        </div>

        <DocInfo>
          Revenue projections are based on current active memberships and scheduled payments. 
          They update automatically as members join or leave.
        </DocInfo>
      </section>

      {/* Member Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Member Analytics</h2>

        <h3 className="text-xl font-medium mb-4">Retention Metrics</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Overall Retention Rate</strong> - Percentage of members who stay active</li>
          <li><strong>Churn Rate</strong> - Percentage of members who cancel</li>
          <li><strong>Average Member Lifespan</strong> - How long members typically stay</li>
          <li><strong>At-Risk Members</strong> - Members showing signs of disengagement</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Engagement Scoring</h3>
        <p className="text-muted-foreground mb-4">
          Each member receives an engagement score based on:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Visit frequency and consistency</li>
          <li>Class attendance and completion</li>
          <li>App usage and portal logins</li>
          <li>Interaction with communications</li>
        </ul>

        <DocWarning>
          Members with declining engagement scores are more likely to cancel. 
          Set up automated re-engagement campaigns to reach them early.
        </DocWarning>
      </section>

      {/* Attendance Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Attendance Analytics</h2>

        <h3 className="text-xl font-medium mb-4">Visit Patterns</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Peak Hours</h4>
            <p className="text-sm text-muted-foreground">
              Identify your busiest times to optimise staffing and class schedules.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Day of Week</h4>
            <p className="text-sm text-muted-foreground">
              See which days are most popular with your members.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Seasonal Trends</h4>
            <p className="text-sm text-muted-foreground">
              Track how attendance varies throughout the year.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Class vs Open Gym</h4>
            <p className="text-sm text-muted-foreground">
              Compare structured class attendance vs general gym usage.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-medium mb-4">Class Performance</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Fill rates for each class type and time slot</li>
          <li>No-show and late cancellation rates</li>
          <li>Instructor popularity rankings</li>
          <li>Waitlist conversion rates</li>
        </ul>
      </section>

      {/* Growth Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Growth Analytics</h2>

        <h3 className="text-xl font-medium mb-4">Acquisition Metrics</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>New Signups</strong> - Members who joined this period</li>
          <li><strong>Lead Conversion Rate</strong> - Leads that became members</li>
          <li><strong>Trial Conversion Rate</strong> - Trials that converted to paid</li>
          <li><strong>Referral Rate</strong> - Members acquired through referrals</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Lead Source Analysis</h3>
        <p className="text-muted-foreground mb-4">
          Understand where your best members come from:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Website signups</li>
          <li>Walk-ins</li>
          <li>Social media</li>
          <li>Member referrals</li>
          <li>Partner promotions</li>
        </ul>

        <DocTip>
          Focus your marketing budget on the lead sources with the highest conversion rates and member lifetime value.
        </DocTip>
      </section>

      {/* Custom Reports */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Creating Custom Reports</h2>

        <DocStep stepNumber={1} title="Select Report Type">
          <p>Choose from revenue, member, attendance, or custom report templates.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Set Date Range">
          <p>Select the time period for your report. Compare to previous periods for trend analysis.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Apply Filters">
          <p>Filter by location, membership type, member segment, or other criteria.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Export or Schedule">
          <p>Export as PDF or CSV, or schedule automatic reports to be emailed weekly or monthly.</p>
        </DocStep>
      </section>

      {/* Multi-Location Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Multi-Location Analytics</h2>
        
        <p className="text-muted-foreground mb-4">
          For gyms with multiple locations, the analytics dashboard provides:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Consolidated View</strong> - See total performance across all locations</li>
          <li><strong>Location Comparison</strong> - Compare metrics between locations</li>
          <li><strong>Area Reports</strong> - Group locations by region for area managers</li>
          <li><strong>Cross-Location Trends</strong> - Identify patterns affecting all locations</li>
        </ul>

        <DocInfo>
          Area managers only see analytics for locations under their management. 
          Owners and administrators have access to the full consolidated view.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
