import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";

export default function GymContracts() {
  return (
    <DocsLayout
      title="Contracts"
      description="Create contract templates and manage member agreements for your gym."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Contracts" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Ensure all members sign necessary agreements before starting. Create waivers, terms of service, and membership contracts that members sign digitally.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Creating Templates</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Navigate to Settings → Contracts</li>
          <li>Create templates for different purposes (waiver, terms, parental consent)</li>
          <li>Use the rich text editor to format your contract</li>
          <li>Mark contracts as required or optional</li>
        </ul>
        <DocTip className="mt-4">Have your contracts reviewed by a legal professional to ensure they provide appropriate protection.</DocTip>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Member Signing</h2>
        <p className="text-muted-foreground mb-4">Members can sign contracts during signup or from their portal. All signatures are timestamped and stored securely. Staff can view signed contracts from the member profile.</p>
        <DocInfo>Unsigned required contracts will show as alerts when members check in.</DocInfo>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Contract Management</h2>
        <p className="text-muted-foreground">View all signed contracts, download PDFs, and track which members have outstanding documents. Update templates when needed - existing signatures remain valid.</p>
      </section>
    </DocsLayout>
  );
}
