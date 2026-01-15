import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";

export default function GymMemberPortal() {
  return (
    <DocsLayout
      title="Member Portal"
      description="What your members see and can do through their self-service portal."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Member Portal" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Members access a self-service portal to manage their account, book classes, and view their history without needing to contact staff.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Member Features</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>View Schedule</strong> - See upcoming classes and book spots</li>
          <li><strong>Check-In QR</strong> - Display QR code for gym entry</li>
          <li><strong>Manage Membership</strong> - View plan details, freeze or cancel</li>
          <li><strong>Payment Methods</strong> - Update card details</li>
          <li><strong>Invoices</strong> - Download payment receipts</li>
          <li><strong>Profile</strong> - Update personal information</li>
          <li><strong>Class History</strong> - View past attendance</li>
          <li><strong>Family Members</strong> - Manage linked accounts</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Customization</h2>
        <p className="text-muted-foreground mb-4">The member portal displays your gym branding including logo and colours. Configure which features are available to members in Settings.</p>
        <DocTip>Encourage members to use the portal for self-service tasks to reduce front desk workload.</DocTip>
      </section>
    </DocsLayout>
  );
}
