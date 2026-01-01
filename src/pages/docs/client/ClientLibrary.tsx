import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Library, Download, Play, FileText, Package, Clock } from "lucide-react";

export default function ClientLibrary() {
  return (
    <DocsLayout
      title="Access Your Digital Library | FitConnect Client Guide"
      description="Download purchased e-books, videos and training programmes from your coaches anytime."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Digital Library" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          Your Digital Library
        </h2>
        <p className="text-muted-foreground mb-4">
          When you purchase digital products from coaches on the FitConnect marketplace, 
          they're added to your personal library. Access your content anytime from any device.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Types of Content
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">E-Books & Guides</h3>
            <p className="text-sm text-muted-foreground">
              PDF guides, training manuals, recipe books, and educational content. 
              Download and read offline.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Video Courses</h3>
            <p className="text-sm text-muted-foreground">
              Instructional videos, workout tutorials, and video-based programs. 
              Stream directly in the app.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Templates</h3>
            <p className="text-sm text-muted-foreground">
              Workout templates, meal plan templates, tracking spreadsheets, and more. 
              Download and customise.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Audio Content</h3>
            <p className="text-sm text-muted-foreground">
              Guided meditations, workout audio guides, and podcasts. 
              Listen while you train.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-green-500" />
          Accessing Your Content
        </h2>
        <DocStep stepNumber={1} title="Open your library">
          Navigate to <strong>Library</strong> in your client dashboard.
        </DocStep>
        <DocStep stepNumber={2} title="Find your content">
          Browse by type (videos, e-books, templates) or search by title.
        </DocStep>
        <DocStep stepNumber={3} title="View or download">
          Click to stream videos or download files to your device.
        </DocStep>
        <DocTip>
          Bookmark your favourite items for quick access from the library home screen.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-purple-500" />
          Downloading Content
        </h2>
        <p className="text-muted-foreground mb-4">
          Most content can be downloaded for offline access:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>PDFs & E-Books</strong> - Download directly to your device</li>
          <li><strong>Videos</strong> - Some allow offline viewing; check the download icon</li>
          <li><strong>Templates</strong> - Download to use in your preferred software</li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Downloaded content remains accessible even without an internet connection.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-500" />
          Bundles
        </h2>
        <p className="text-muted-foreground mb-4">
          When you purchase a bundle, all included products appear in your library. 
          You can access each item individually:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>View the bundle to see all included items</li>
          <li>Access each product directly from your library</li>
          <li>Bundle savings are shown on your purchase receipt</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-500" />
          Access & Expiration
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Lifetime access</h3>
            <p className="text-sm text-muted-foreground">
              Most digital products provide lifetime access once purchased.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Time-limited content</h3>
            <p className="text-sm text-muted-foreground">
              Some products (e.g., monthly programs) may have an access period. 
              Check the product details before purchasing.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Re-purchasing</h3>
            <p className="text-sm text-muted-foreground">
              If access expires, you can re-purchase to regain access to the content.
            </p>
          </div>
        </div>
        <DocTip>
          Downloaded files remain on your device even after access expires, 
          but streaming content will no longer be available.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
