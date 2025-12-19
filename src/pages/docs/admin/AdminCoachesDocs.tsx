import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Dumbbell, CheckCircle, XCircle, Eye } from "lucide-react";

export default function AdminCoachesDocs() {
  return (
    <DocsLayout
      title="Coach Management"
      description="Manage coaches, handle verifications, and monitor coach performance."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Coach Management" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Coach Roster
        </h2>
        <p className="text-muted-foreground mb-4">
          View all registered coaches, their verification status, subscription tier, 
          and key metrics like client count and ratings.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Verification Queue
        </h2>
        <DocStep stepNumber={1} title="Review documents">Check submitted ID, certifications, and insurance.</DocStep>
        <DocStep stepNumber={2} title="Verify information">Confirm credentials are valid and current.</DocStep>
        <DocStep stepNumber={3} title="Approve or reject">Grant verified status or request additional documents.</DocStep>
        <DocTip>Verified coaches appear higher in search results and display a verification badge.</DocTip>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Coach Actions</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">View Profile</h3>
            <p className="text-sm text-muted-foreground">See the coach's public profile as clients would see it.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Grant Subscription</h3>
            <p className="text-sm text-muted-foreground">Manually assign a subscription tier without payment.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Suspend/Unsuspend</h3>
            <p className="text-sm text-muted-foreground">Disable or re-enable coach marketplace visibility.</p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
