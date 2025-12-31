import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";

export default function AdminVerificationsDocs() {
  return (
    <DocsLayout
      title="Verification Queue"
      description="Guide to reviewing and processing coach verification requests"
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Admin", href: "/docs/admin" },
        { label: "Verification Queue" },
      ]}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What It Is</h2>
        <p className="text-muted-foreground">
          The Verification Queue is where administrators review coach applications and credential 
          submissions. This process ensures all coaches on the platform have legitimate qualifications 
          and meet our quality standards before they can be marked as verified.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Why It Matters</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Protects clients from unqualified practitioners</li>
          <li>Maintains platform credibility and trust</li>
          <li>Ensures compliance with industry standards</li>
          <li>Differentiates verified professionals from unverified</li>
          <li>Reduces liability and risk for the platform</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        
        <DocStep stepNumber={1} title="Access the Queue">
          Navigate to Admin Dashboard → Verifications to see all pending verification requests 
          sorted by submission date.
        </DocStep>

        <DocStep stepNumber={2} title="Review Documents">
          Click on a request to view submitted documents including ID, certifications, insurance 
          proof, and any additional credentials.
        </DocStep>

        <DocStep stepNumber={3} title="Verify Authenticity">
          Cross-reference certifications with issuing organizations. Check expiration dates and 
          ensure documents match the coach's profile information.
        </DocStep>

        <DocStep stepNumber={4} title="Make a Decision">
          Approve, request additional documents, or reject the application with a clear reason 
          that will be communicated to the coach.
        </DocStep>

        <DocTip>
          Keep a list of common certification bodies and their verification portals bookmarked 
          for quick reference during reviews.
        </DocTip>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Verification Checklist</h2>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-primary">□</span>
            <p>Government-issued ID matches profile name</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">□</span>
            <p>Professional certifications are current and valid</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">□</span>
            <p>Insurance documentation covers professional practice</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">□</span>
            <p>Specializations claimed match documented qualifications</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary">□</span>
            <p>No red flags in background or reference checks</p>
          </div>
        </div>

        <DocWarning className="mt-4">
          Never approve a verification if documents appear altered, expired, or don't match 
          the coach's stated qualifications.
        </DocWarning>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Common Document Types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Personal Training</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• NASM, ACE, ISSA, NSCA certifications</li>
              <li>• CPR/AED certification</li>
              <li>• Liability insurance</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Nutrition Coaching</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Registered Dietitian credentials</li>
              <li>• Precision Nutrition certification</li>
              <li>• State licensure (where required)</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Combat Sports</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Boxing/MMA coaching certifications</li>
              <li>• Competition records</li>
              <li>• Gym affiliation documentation</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Specialized Training</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Specialty certifications</li>
              <li>• Continuing education credits</li>
              <li>• Advanced training documentation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">What if a certification is about to expire?</h3>
            <p className="text-muted-foreground">
              Approve with a note to the coach about renewal. Set a reminder to follow up 
              on the expiration date.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">How do I handle international credentials?</h3>
            <p className="text-muted-foreground">
              Verify with the issuing country's regulatory body. Some credentials may need 
              translation or equivalency assessment.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Can coaches reapply after rejection?</h3>
            <p className="text-muted-foreground">
              Yes, they can submit new documentation addressing the rejection reasons. 
              Each application is reviewed fresh.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <ul className="list-disc list-inside space-y-1 text-primary">
          <li><a href="/docs/admin/coaches" className="hover:underline">Coach Management</a></li>
          <li><a href="/docs/admin/audit-logs" className="hover:underline">Audit Logs</a></li>
        </ul>
      </section>
    </DocsLayout>
  );
}
