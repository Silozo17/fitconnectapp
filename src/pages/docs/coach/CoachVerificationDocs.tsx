import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { BadgeCheck, FileText, Clock, Shield } from "lucide-react";

export default function CoachVerificationDocs() {
  return (
    <DocsLayout
      title="Verification"
      description="Learn how to get verified to build trust and stand out in the marketplace."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Verification" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BadgeCheck className="h-6 w-6 text-primary" />
          Why Get Verified?
        </h2>
        <p className="text-muted-foreground">
          Verification helps you build trust and attract more clients.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Verified Badge</h3>
            <p className="text-sm text-muted-foreground">
              Display a verified badge on your profile that shows clients 
              your credentials have been reviewed.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Higher Visibility</h3>
            <p className="text-sm text-muted-foreground">
              Verified coaches appear higher in search results and are 
              featured more prominently in the marketplace.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Client Trust</h3>
            <p className="text-sm text-muted-foreground">
              Clients are more likely to book with coaches who have 
              verified their qualifications.
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Exclusive Avatar</h3>
            <p className="text-sm text-muted-foreground">
              Unlock the exclusive "Elite Personal Trainer" avatar only 
              available to verified coaches.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Required Documents
        </h2>
        <p className="text-muted-foreground">
          Prepare the following documents for verification.
        </p>

        <DocStep number={1} title="Government ID">
          A clear photo of your government-issued ID (passport, driver's license, 
          or national ID card) to verify your identity.
        </DocStep>

        <DocStep number={2} title="Professional Certifications">
          Copies of your fitness certifications (e.g., NASM, ACE, ISSA, REPs). 
          Ensure certificates show your name and are current.
        </DocStep>

        <DocStep number={3} title="Insurance Certificate">
          Proof of professional liability insurance covering your coaching services.
        </DocStep>

        <DocStep number={4} title="Additional Qualifications (Optional)">
          Any additional certifications, degrees, or specialized training relevant 
          to your coaching services.
        </DocStep>

        <DocTip type="info">
          All documents should be clear, legible, and show relevant information. 
          Blurry or partially visible documents may delay verification.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Verification Process
        </h2>
        <p className="text-muted-foreground">
          Here's what to expect during verification.
        </p>

        <DocStep number={1} title="Submit Documents">
          Go to <strong>Verification</strong> from your dashboard and upload 
          all required documents.
        </DocStep>

        <DocStep number={2} title="Initial Review">
          Our system performs an initial automated check of your documents. 
          You'll see a "Pending" status while this happens.
        </DocStep>

        <DocStep number={3} title="Manual Review">
          Our verification team reviews your documents and credentials. 
          This typically takes 2-5 business days.
        </DocStep>

        <DocStep number={4} title="Verification Decision">
          You'll receive an email notification with the result. If approved, 
          your verified badge appears immediately.
        </DocStep>

        <DocTip type="warning">
          If verification is rejected, you'll receive feedback on what was missing 
          or incorrect. You can resubmit with updated documents.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Maintaining Verification
        </h2>
        <p className="text-muted-foreground">
          Keep your verified status active with updated documents.
        </p>

        <DocStep number={1} title="Certificate Renewals">
          When your certifications expire, upload renewed certificates to 
          maintain verification status.
        </DocStep>

        <DocStep number={2} title="Insurance Updates">
          Ensure your insurance coverage remains current. Upload new certificates 
          when your policy renews.
        </DocStep>

        <DocStep number={3} title="Status Monitoring">
          Check your verification status in your dashboard. We'll notify you 
          when documents are approaching expiration.
        </DocStep>

        <DocTip type="tip">
          Set calendar reminders 30 days before your certifications expire to 
          ensure you have time to renew and re-upload documents.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
