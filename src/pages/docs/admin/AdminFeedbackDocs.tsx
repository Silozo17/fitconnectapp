import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { MessageSquare, Tag, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AdminFeedbackDocs() {
  return (
    <DocsLayout
      title="Feedback Management | Admin Guide"
      description="Collect, organize, and respond to user feedback. Track feature requests, bug reports, and suggestions to improve the platform."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Feedback" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Feedback Dashboard
        </h2>
        <p className="text-muted-foreground mb-4">
          The Feedback Dashboard aggregates all user feedback submitted through the app, providing insights 
          into user needs and platform issues.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
            <h3 className="font-medium">Bug Reports</h3>
            <p className="text-sm text-muted-foreground">Issues and errors reported by users.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">Feature Requests</h3>
            <p className="text-sm text-muted-foreground">New features and improvements suggested.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <MessageSquare className="h-6 w-6 text-green-500 mb-2" />
            <h3 className="font-medium">General Feedback</h3>
            <p className="text-sm text-muted-foreground">Comments, praise, and other input.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-purple-500" />
          Categorizing Feedback
        </h2>
        <p className="text-muted-foreground mb-4">
          Properly categorizing feedback helps prioritize and route issues:
        </p>
        <DocStep stepNumber={1} title="Review incoming feedback">
          New feedback appears in the inbox. Read the user's message and any attached screenshots.
        </DocStep>
        <DocStep stepNumber={2} title="Assign category">
          Tag as Bug Report, Feature Request, UX Issue, Performance, or General.
        </DocStep>
        <DocStep stepNumber={3} title="Set priority">
          Mark as Critical, High, Medium, or Low based on impact and frequency.
        </DocStep>
        <DocStep stepNumber={4} title="Add tags">
          Apply relevant tags (e.g., "Mobile", "Payments", "Coach Dashboard") for filtering.
        </DocStep>
        <DocStep stepNumber={5} title="Assign owner">
          Route to the appropriate team or individual for follow-up.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Feedback Status Workflow
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              New
            </h3>
            <p className="text-sm text-muted-foreground">Freshly submitted, not yet reviewed.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Under Review
            </h3>
            <p className="text-sm text-muted-foreground">Being evaluated by the team.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              Planned
            </h3>
            <p className="text-sm text-muted-foreground">Accepted and scheduled for implementation.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              In Progress
            </h3>
            <p className="text-sm text-muted-foreground">Currently being worked on.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Resolved
            </h3>
            <p className="text-sm text-muted-foreground">Completed and deployed.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              Closed
            </h3>
            <p className="text-sm text-muted-foreground">Not actionable (duplicate, out of scope, etc.).</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Responding to Feedback
        </h2>
        <p className="text-muted-foreground mb-4">
          Keep users informed about their feedback:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Acknowledge:</strong> Send a quick response confirming receipt</li>
          <li><strong>Update:</strong> Notify users when status changes</li>
          <li><strong>Close the loop:</strong> Let users know when their issue is resolved</li>
          <li><strong>Thank them:</strong> Show appreciation for taking the time to provide feedback</li>
        </ul>
        <DocInfo>
          Use the quick response templates for common acknowledgments to save time.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Feedback Analytics
        </h2>
        <p className="text-muted-foreground mb-4">
          Track feedback trends to identify patterns:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Volume Trends:</strong> Feedback submissions over time</li>
          <li><strong>Category Breakdown:</strong> Distribution of feedback types</li>
          <li><strong>Top Issues:</strong> Most frequently reported problems</li>
          <li><strong>Response Time:</strong> Average time to first response</li>
          <li><strong>Resolution Rate:</strong> Percentage of feedback addressed</li>
        </ul>
        <DocTip>
          Use feedback trends to inform product roadmap decisions and resource allocation.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
