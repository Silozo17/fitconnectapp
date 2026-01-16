import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Bug, Terminal, Database, Zap, Search, AlertTriangle } from "lucide-react";

export default function AdminDebugDocs() {
  return (
    <DocsLayout
      title="Debug Console | Admin Guide"
      description="Access developer tools and diagnostics for troubleshooting platform issues. View logs, test functions, and monitor system health."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Debug Console" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          Debug Console Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Debug Console provides advanced diagnostic tools for platform administrators and developers. 
          Use these tools to troubleshoot issues, monitor performance, and test functionality.
        </p>
        <DocWarning>
          The Debug Console is intended for technical users. Incorrect usage may affect platform performance.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-green-500" />
          Available Tools
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-500" />
              Function Logs
            </h3>
            <p className="text-sm text-muted-foreground">View real-time logs from edge functions with filtering by function name, status, and time range.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              Database Inspector
            </h3>
            <p className="text-sm text-muted-foreground">Query database tables, view row counts, and check data integrity.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              API Tester
            </h3>
            <p className="text-sm text-muted-foreground">Send test requests to edge functions with custom payloads and headers.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Error Tracker
            </h3>
            <p className="text-sm text-muted-foreground">View aggregated errors with stack traces and occurrence counts.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Viewing Function Logs
        </h2>
        <DocStep stepNumber={1} title="Navigate to logs">
          Go to Admin → Debug Console → Function Logs.
        </DocStep>
        <DocStep stepNumber={2} title="Select function">
          Choose the edge function you want to inspect from the dropdown.
        </DocStep>
        <DocStep stepNumber={3} title="Set time range">
          Define the time window for log retrieval (last hour, day, week, or custom).
        </DocStep>
        <DocStep stepNumber={4} title="Apply filters">
          Filter by log level (info, warn, error) or search for specific text.
        </DocStep>
        <DocStep stepNumber={5} title="Analyze logs">
          Click on individual log entries to see full details including request/response data.
        </DocStep>
        <DocTip>
          Use the "Live" toggle to stream logs in real-time while reproducing issues.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-500" />
          Database Inspection
        </h2>
        <p className="text-muted-foreground mb-4">
          The Database Inspector allows read-only access to database state:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Table Browser:</strong> View table schemas and row counts</li>
          <li><strong>Record Lookup:</strong> Find specific records by ID or field values</li>
          <li><strong>Relationship Viewer:</strong> Trace relationships between related records</li>
          <li><strong>Data Validation:</strong> Check for orphaned records or constraint violations</li>
        </ul>
        <DocWarning>
          The Database Inspector is read-only. To modify data, use the appropriate admin interfaces or migrations.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          API Testing
        </h2>
        <p className="text-muted-foreground mb-4">
          Test edge functions directly from the admin console:
        </p>
        <DocStep stepNumber={1} title="Select function">
          Choose the edge function endpoint to test.
        </DocStep>
        <DocStep stepNumber={2} title="Configure request">
          Set HTTP method, headers, and request body (JSON).
        </DocStep>
        <DocStep stepNumber={3} title="Choose auth context">
          Optionally impersonate a specific user for authenticated endpoints.
        </DocStep>
        <DocStep stepNumber={4} title="Send request">
          Execute the request and view the response with timing information.
        </DocStep>
        <DocTip>
          Save frequently used request configurations as templates for quick access.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Error Tracking
        </h2>
        <p className="text-muted-foreground mb-4">
          Monitor and investigate platform errors:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Error List:</strong> Aggregated errors grouped by type and location</li>
          <li><strong>Stack Traces:</strong> Full stack traces for debugging</li>
          <li><strong>Occurrence Count:</strong> How many times each error has occurred</li>
          <li><strong>Affected Users:</strong> Which users encountered the error</li>
          <li><strong>First/Last Seen:</strong> When the error first appeared and last occurred</li>
          <li><strong>Resolution Status:</strong> Track which errors have been fixed</li>
        </ul>
        <DocTip>
          Set up alerts for critical errors to be notified immediately when they occur.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
