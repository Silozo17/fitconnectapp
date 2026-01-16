import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Star, Shield, Flag, Search, CheckCircle, XCircle } from "lucide-react";

export default function AdminReviewsDocs() {
  return (
    <DocsLayout
      title="Reviews Moderation | Admin Guide"
      description="Moderate coach and gym reviews to maintain platform quality. Handle reported reviews, remove inappropriate content, and ensure fair feedback."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Reviews" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Review Moderation Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The reviews moderation system helps maintain the integrity of ratings and feedback on the platform. 
          Reviews can be flagged by users, coaches, or automatically detected by our content filters.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Pending Review</h3>
            <p className="text-sm text-muted-foreground">Flagged reviews awaiting moderator decision.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Auto-Flagged</h3>
            <p className="text-sm text-muted-foreground">Reviews flagged by automated content detection.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">User Reported</h3>
            <p className="text-sm text-muted-foreground">Reviews reported by coaches or other users.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Resolved</h3>
            <p className="text-sm text-muted-foreground">Previously flagged reviews that have been processed.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-500" />
          Common Flag Reasons
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Inappropriate Language:</strong> Profanity, hate speech, or offensive content</li>
          <li><strong>Fake Review:</strong> Suspected fraudulent or incentivized reviews</li>
          <li><strong>Personal Attack:</strong> Reviews attacking individuals rather than services</li>
          <li><strong>Irrelevant Content:</strong> Reviews not related to the coaching experience</li>
          <li><strong>Competitor Sabotage:</strong> Suspected malicious reviews from competitors</li>
          <li><strong>Privacy Violation:</strong> Reviews revealing personal information</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Review Moderation Process
        </h2>
        <DocStep stepNumber={1} title="Access moderation queue">
          Navigate to Admin → Reviews to see all flagged reviews sorted by priority.
        </DocStep>
        <DocStep stepNumber={2} title="Review the content">
          Read the full review, check the reporter's reason, and view the coach's response if any.
        </DocStep>
        <DocStep stepNumber={3} title="Check context">
          View the reviewer's booking history to verify they actually used the service.
        </DocStep>
        <DocStep stepNumber={4} title="Make a decision">
          Choose to approve (keep visible), hide (remove from public view), or edit the review.
        </DocStep>
        <DocStep stepNumber={5} title="Notify parties">
          The system automatically notifies the reviewer and coach of the decision.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Moderation Actions
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Approve</h3>
              <p className="text-sm text-muted-foreground">Keep the review visible. Use when the flag is unwarranted.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Hide</h3>
              <p className="text-sm text-muted-foreground">Remove from public view. The review is archived but not deleted.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Star className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Edit</h3>
              <p className="text-sm text-muted-foreground">Redact specific portions while keeping the overall review visible.</p>
            </div>
          </div>
        </div>
        <DocWarning>
          Edited reviews are marked as "Modified by moderator" for transparency.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Fake Review Detection</h2>
        <p className="text-muted-foreground mb-4">
          Indicators that a review may be fraudulent:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Reviewer has no booking history with the coach</li>
          <li>Multiple reviews from the same IP address</li>
          <li>Review text matches known fake review patterns</li>
          <li>Account was created very recently</li>
          <li>Reviewer has left many negative reviews in a short period</li>
        </ul>
        <DocTip>
          Use the "View Reviewer History" option to see all reviews from a user across the platform.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Appeals Process</h2>
        <p className="text-muted-foreground mb-4">
          Both reviewers and coaches can appeal moderation decisions:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Appeals appear in a separate queue marked as "Appeal"</li>
          <li>Review the original decision and any new information provided</li>
          <li>A senior moderator should review appeals when possible</li>
          <li>Final decisions should be documented with clear reasoning</li>
        </ul>
        <DocTip>
          Document your reasoning when making moderation decisions—this helps with consistency and appeals.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
