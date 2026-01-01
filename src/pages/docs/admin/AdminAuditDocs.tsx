import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocWarning } from "@/components/docs/DocComponents";
import { FileText, Search, Filter, Download } from "lucide-react";

export default function AdminAuditDocs() {
  return (
    <DocsLayout
      title="Audit Log | Admin Guide"
      description="Review all administrative actions for security and compliance. Filter, search, and export immutable activity records."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Audit Log" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          What's Logged
        </h2>
        <p className="text-muted-foreground mb-4">
          The audit log records all administrative actions for security and compliance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>User account changes (suspend, delete, password reset)</li>
          <li>Coach verification approvals and rejections</li>
          <li>Settings changes</li>
          <li>Team member additions and role changes</li>
          <li>Content moderation actions</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          Filtering & Search
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Filter by action type (create, update, delete)</li>
          <li>Filter by admin user</li>
          <li>Filter by entity type (user, coach, settings)</li>
          <li>Search by entity ID or description</li>
          <li>Date range selection</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-green-500" />
          Exporting Logs
        </h2>
        <p className="text-muted-foreground">
          Export audit logs as CSV for compliance audits, legal requirements, or internal reviews.
        </p>
        <DocWarning>Audit logs cannot be modified or deleted. They provide an immutable record of all admin actions.</DocWarning>
      </section>
      <DocTip>Review the audit log regularly to monitor for unusual activity or policy compliance.</DocTip>
    </DocsLayout>
  );
}
