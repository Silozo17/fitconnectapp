import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { LayoutDashboard, Move, Eye, BarChart3 } from "lucide-react";

export default function AdminDashboardDocs() {
  return (
    <DocsLayout
      title="Admin Dashboard"
      description="Overview of the admin dashboard and its customizable widgets."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Dashboard" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The admin dashboard provides a real-time overview of platform performance with 
          customizable widgets for different metrics and quick actions.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Move className="h-5 w-5 text-blue-500" />
          Customizing Your Dashboard
        </h2>
        <DocStep stepNumber={1} title="Enter edit mode">Click "Edit Dashboard" in the top right.</DocStep>
        <DocStep stepNumber={2} title="Drag widgets">Reorder widgets by dragging them to new positions.</DocStep>
        <DocStep stepNumber={3} title="Add/remove widgets">Use the widget menu to show or hide specific metrics.</DocStep>
        <DocStep stepNumber={4} title="Save layout">Click "Save" to persist your custom layout.</DocStep>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          Available Widgets
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>User Stats</strong> - Total users, new signups, active users</li>
          <li><strong>Coach Stats</strong> - Total coaches, verified coaches, pending verifications</li>
          <li><strong>Revenue</strong> - MRR, total revenue, commission earned</li>
          <li><strong>Sessions</strong> - Completed sessions, upcoming sessions, cancellation rate</li>
          <li><strong>Quick Actions</strong> - Links to common admin tasks</li>
        </ul>
      </section>
      <DocTip>Each admin can have their own dashboard layout - changes don't affect other team members.</DocTip>
    </DocsLayout>
  );
}
