import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { ShoppingBag, Search, Package, CreditCard, Library, Tag, FileText, Video, Music, BookOpen } from "lucide-react";

export default function ClientMarketplaceDocs() {
  return (
    <DocsLayout
      title="Browse Fitness Products | FitConnect Marketplace"
      description="Shop e-books, workout programmes and video courses from certified UK coaches. Digital fitness content."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Marketplace" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The FitConnect Marketplace is your destination for premium digital fitness content created 
          by verified coaches. Browse e-books, video courses, workout templates, audio guides, and 
          bundled packages to support your fitness journey.
        </p>
        <DocTip>
          Many coaches offer free products to help you get started. Look for the "Free" tag when browsing.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Browsing Products
        </h2>
        <p className="text-muted-foreground mb-4">
          Find the perfect content for your fitness goals.
        </p>

        <DocStep stepNumber={1} title="Access the Marketplace">
          Navigate to <strong>Marketplace</strong> from your dashboard sidebar.
        </DocStep>

        <DocStep stepNumber={2} title="Browse Categories">
          Filter products by category to find what you need:
        </DocStep>
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-lg border border-border bg-card/50 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-sm">E-Books & Guides</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 flex items-center gap-2">
            <Video className="h-4 w-4 text-red-500" />
            <span className="text-sm">Video Courses</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
            <span className="text-sm">Templates</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 flex items-center gap-2">
            <Music className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Audio</span>
          </div>
        </div>

        <DocStep stepNumber={3} title="Search & Filter">
          Use the search bar to find specific products, or filter by:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li>Content type (PDF, Video, Audio, etc.)</li>
          <li>Price range</li>
          <li>Coach/creator</li>
          <li>Featured or popular items</li>
        </ul>

        <DocStep stepNumber={4} title="View Product Details">
          Click on any product to see its full description, preview content, pricing, and reviews.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-500" />
          Product Types
        </h2>
        <p className="text-muted-foreground mb-4">
          Different types of digital content available:
        </p>
        <div className="space-y-3 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">📚 E-Books & PDFs</h4>
            <p className="text-sm text-muted-foreground">
              Comprehensive guides, recipe books, and educational content you can read on any device.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">🎬 Video Courses</h4>
            <p className="text-sm text-muted-foreground">
              Step-by-step video tutorials, workout demonstrations, and technique guides.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">📋 Templates</h4>
            <p className="text-sm text-muted-foreground">
              Ready-to-use workout plans, meal plan templates, and tracking spreadsheets.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">🎧 Audio</h4>
            <p className="text-sm text-muted-foreground">
              Motivational content, guided meditations, and audio workouts.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">📦 Bundles</h4>
            <p className="text-sm text-muted-foreground">
              Multiple products packaged together at a discounted price.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-500" />
          Purchasing Content
        </h2>
        <p className="text-muted-foreground mb-4">
          Secure checkout process for digital products.
        </p>

        <DocStep stepNumber={1} title="Add to Cart">
          Click <strong>Purchase</strong> or <strong>Get Free</strong> on the product page.
        </DocStep>

        <DocStep stepNumber={2} title="Checkout">
          For paid products, you'll be taken to a secure checkout powered by Stripe. 
          Enter your payment details to complete the purchase.
        </DocStep>

        <DocStep stepNumber={3} title="Instant Access">
          Once payment is confirmed (or immediately for free products), the content 
          is added to your library and ready to access.
        </DocStep>

        <DocTip>
          All payments are processed securely through Stripe. We never store your full card details.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Library className="h-5 w-5 text-purple-500" />
          Accessing Purchased Content
        </h2>
        <p className="text-muted-foreground mb-4">
          All your purchased products are available in your Digital Library.
        </p>

        <DocStep stepNumber={1} title="Go to Your Library">
          Navigate to <strong>Library</strong> from your dashboard sidebar.
        </DocStep>

        <DocStep stepNumber={2} title="Find Your Content">
          Browse your purchased products by type or search for specific items.
        </DocStep>

        <DocStep stepNumber={3} title="Download or Stream">
          Depending on the content type:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li><strong>PDFs/E-Books:</strong> Download to your device</li>
          <li><strong>Videos:</strong> Stream directly in the app</li>
          <li><strong>Audio:</strong> Play or download for offline listening</li>
          <li><strong>Templates:</strong> Download and use in your preferred app</li>
        </ul>

        <DocTip>
          Purchased content is yours to keep. You can access it anytime from your library.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-red-500" />
          Bundles & Discounts
        </h2>
        <p className="text-muted-foreground mb-4">
          Get more value with product bundles.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Bundles combine multiple related products at a reduced price</li>
          <li>You save compared to buying each product individually</li>
          <li>All bundle contents appear separately in your library</li>
          <li>Look for the <strong>Bundle</strong> label when browsing</li>
        </ul>
        <DocTip>
          Check bundle details to see exactly what's included before purchasing.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
