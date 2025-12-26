import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Package, FileText, Video, DollarSign } from "lucide-react";

export default function CoachProductsDocs() {
  return (
    <DocsLayout
      title="Digital Products"
      description="Create and sell e-books, videos, templates, and bundles."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "Digital Products" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Sell digital products to generate passive income. Create e-books, video courses, 
          workout templates, or bundle multiple products together at a discount.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Product Types</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <FileText className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-medium">E-Books & PDFs</h3>
            <p className="text-sm text-muted-foreground">Guides, recipe books, training manuals.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Video className="h-6 w-6 text-purple-500 mb-2" />
            <h3 className="font-medium">Video Courses</h3>
            <p className="text-sm text-muted-foreground">Tutorials and instructional content.</p>
          </div>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Creating a Product</h2>
        <DocStep stepNumber={1} title="Go to Products">Navigate to Products in your coach dashboard.</DocStep>
        <DocStep stepNumber={2} title="Add new product">Click "New Product" and select the type.</DocStep>
        <DocStep stepNumber={3} title="Upload content">Add your files, set price, and write a description.</DocStep>
        <DocStep stepNumber={4} title="Publish">Enable "Published" to list on the marketplace.</DocStep>
      </section>

      {/* iOS App Store Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-amber-600">
          ⚠️ iOS App Store Limitations
        </h2>
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 mb-4">
          <p className="text-muted-foreground mb-3">
            Due to Apple App Store policies, <strong>paid digital products</strong> (e-books, video courses, templates, bundles) 
            are <strong>not visible or purchasable</strong> on the iOS app.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Clients using iOS will not see your paid digital products in the marketplace</li>
            <li>Paid product purchase buttons are hidden on iOS</li>
            <li>Free digital products remain visible and accessible on all platforms</li>
          </ul>
        </div>
        <p className="text-muted-foreground">
          <strong>Recommendation:</strong> Direct iOS clients to the web version at{" "}
          <span className="font-mono text-sm">getfitconnect.co.uk</span> to browse and purchase your paid digital products.
        </p>
      </section>

      <DocTip>Create bundles to offer multiple products at a discount and increase average order value.</DocTip>

      {/* Changelog */}
      <section className="pt-8 border-t border-border mt-10">
        <p className="text-xs text-muted-foreground">
          <strong>Last updated:</strong> 26 December 2024 — Added iOS App Store limitations section.
        </p>
      </section>
    </DocsLayout>
  );
}
