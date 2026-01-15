import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";

export default function GymLocations() {
  return (
    <DocsLayout
      title="Multi-Location"
      description="Manage multiple gym locations from a single dashboard."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Multi-Location" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Running multiple locations? Manage them all from one place with centralized reporting and location-specific settings.</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Adding Locations</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Navigate to Settings → Locations</li>
          <li>Enter address, contact info, and operating hours</li>
          <li>Set location-specific settings (capacity, amenities)</li>
          <li>Assign staff to specific locations</li>
        </ul>
        <DocInfo className="mt-4">Each location can have its own class schedule, pricing, and staff.</DocInfo>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Location-Based Memberships</h2>
        <p className="text-muted-foreground mb-4">Create memberships that work at single locations or across all locations. Multi-location memberships can be priced at a premium.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Centralized Dashboard</h2>
        <p className="text-muted-foreground mb-4">View combined analytics across all locations or drill down into individual location performance. Transfer members between locations and manage stock at each site.</p>
        <DocTip>Use Area Manager roles to delegate management of specific locations.</DocTip>
      </section>
    </DocsLayout>
  );
}
