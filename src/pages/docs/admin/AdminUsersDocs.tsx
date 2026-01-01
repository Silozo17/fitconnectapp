import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Users, Search, Ban, Shield } from "lucide-react";

export default function AdminUsersDocs() {
  return (
    <DocsLayout
      title="User Management | Admin Guide"
      description="View, search, and manage all platform users. Suspend accounts, reset passwords, and perform bulk actions securely."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Users" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Users section allows you to view all registered clients, search by name or email, 
          and take actions on individual accounts.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Finding Users
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Search by name, email, or username</li>
          <li>Filter by status (active, suspended, pending)</li>
          <li>Sort by registration date, last active, or alphabetically</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-500" />
          User Actions
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Suspend User</h3>
            <p className="text-sm text-muted-foreground">Temporarily disable account access with an optional reason.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Delete User</h3>
            <p className="text-sm text-muted-foreground">Permanently remove user and their data. This action cannot be undone.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Reset Password</h3>
            <p className="text-sm text-muted-foreground">Send a password reset email to the user.</p>
          </div>
        </div>
        <DocWarning>All user actions are logged in the audit log for compliance and security.</DocWarning>
      </section>
      <DocTip>Use bulk actions to manage multiple users at once (e.g., send announcements).</DocTip>
    </DocsLayout>
  );
}
