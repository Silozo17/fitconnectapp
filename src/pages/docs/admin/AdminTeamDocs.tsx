import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocWarning } from "@/components/docs/DocComponents";
import { Users, Shield, UserPlus } from "lucide-react";

export default function AdminTeamDocs() {
  return (
    <DocsLayout
      title="Team Management"
      description="Add team members and manage admin roles and permissions."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Team Management" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Admin Roles
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-red-500" /> Admin</h3>
            <p className="text-sm text-muted-foreground">Full access to all features including team management and settings.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /> Manager</h3>
            <p className="text-sm text-muted-foreground">Access to users, coaches, revenue, and analytics. Cannot manage team or settings.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /> Staff</h3>
            <p className="text-sm text-muted-foreground">Limited access to dashboard and messaging. Cannot modify user data.</p>
          </div>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-500" />
          Adding Team Members
        </h2>
        <DocStep stepNumber={1} title="Go to Team">Navigate to Admin → Team.</DocStep>
        <DocStep stepNumber={2} title="Invite member">Enter email and select role.</DocStep>
        <DocStep stepNumber={3} title="Send invitation">The user will receive an email to set up their admin account.</DocStep>
        <DocWarning>Only Admins can add or remove team members. Choose roles carefully.</DocWarning>
      </section>
    </DocsLayout>
  );
}
