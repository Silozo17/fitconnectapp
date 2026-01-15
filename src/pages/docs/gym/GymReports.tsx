import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";

export default function GymReports() {
  return (
    <DocsLayout
      title="Reports & Analytics"
      description="View revenue, attendance, retention, and performance reports for your gym."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Reports & Analytics" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Make data-driven decisions with comprehensive reports on every aspect of your gym's performance.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Reports</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Revenue Reports</h4>
            <p className="text-sm text-muted-foreground">Daily, weekly, monthly revenue. Breakdown by source (memberships, retail, classes).</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Member Reports</h4>
            <p className="text-sm text-muted-foreground">New signups, cancellations, churn rate, member demographics.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Attendance Reports</h4>
            <p className="text-sm text-muted-foreground">Check-in trends, peak hours, class attendance rates.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Retention Reports</h4>
            <p className="text-sm text-muted-foreground">Member retention rates, at-risk members, lifetime value.</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Exporting Data</h2>
        <p className="text-muted-foreground mb-4">All reports can be exported to CSV or PDF for external analysis or accounting purposes.</p>
        <DocTip>Schedule automated weekly or monthly reports to be emailed to your team.</DocTip>
      </section>
    </DocsLayout>
  );
}
