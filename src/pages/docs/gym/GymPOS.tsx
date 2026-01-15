import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymPOS() {
  return (
    <DocsLayout
      title="Point of Sale"
      description="Set up your product catalog, process in-person sales, manage inventory, and track retail performance at your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Point of Sale" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Boost your revenue with retail sales. Our POS system lets you sell merchandise, 
          supplements, equipment, and services right from your front desk.
        </p>
      </section>

      {/* Product Catalog */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Product Catalog</h2>

        <h3 className="text-lg font-medium mb-3">Adding Products</h3>
        <DocStep stepNumber={1} title="Navigate to Products">
          <p>Go to your gym dashboard and click "Products" under the POS section.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Add Product">
          <p className="mb-4">Enter the product details:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Name</strong> - Product name as it appears in POS</li>
            <li><strong>Category</strong> - Merchandise, Supplements, Equipment, etc.</li>
            <li><strong>Price</strong> - Selling price (tax inclusive or exclusive)</li>
            <li><strong>Cost</strong> - Your purchase cost for profit tracking</li>
            <li><strong>SKU</strong> - Unique identifier for inventory</li>
            <li><strong>Barcode</strong> - For scanner integration</li>
            <li><strong>Image</strong> - Product photo for easy identification</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Set Inventory">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Track Inventory</strong> - Enable stock tracking</li>
            <li><strong>Current Stock</strong> - How many you have</li>
            <li><strong>Low Stock Alert</strong> - Notify when stock falls below threshold</li>
            <li><strong>Per Location</strong> - Track stock at each gym location</li>
          </ul>
          <DocTip className="mt-4">
            Set low stock alerts for popular items so you never run out.
          </DocTip>
        </DocStep>

        <h3 className="text-lg font-medium mb-3 mt-8">Product Categories</h3>
        <p className="text-muted-foreground mb-4">
          Organise products into categories for easier navigation:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Apparel</strong> - T-shirts, hoodies, shorts</li>
          <li><strong>Equipment</strong> - Gloves, wraps, skipping ropes</li>
          <li><strong>Supplements</strong> - Protein, pre-workout, vitamins</li>
          <li><strong>Drinks</strong> - Water, sports drinks, protein shakes</li>
          <li><strong>Services</strong> - PT sessions, massage, assessments</li>
        </ul>
      </section>

      {/* Processing Sales */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Processing Sales</h2>

        <DocStep stepNumber={1} title="Open the POS">
          <p>Click "POS" in the sidebar to open the point of sale terminal.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Add Items to Cart">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Click products to add them to the cart</li>
            <li>Or scan barcodes with a connected scanner</li>
            <li>Adjust quantities as needed</li>
            <li>Apply discounts if applicable</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Identify Customer (Optional)">
          <p className="mb-4">
            Link the sale to a member for purchase history and loyalty:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Scan member QR code</li>
            <li>Search by name or phone</li>
            <li>Or process as guest sale</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Process Payment">
          <p className="mb-4">Accept payment via:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Card</strong> - Tap, chip, or swipe</li>
            <li><strong>Cash</strong> - With change calculation</li>
            <li><strong>Account Credit</strong> - Deduct from member's balance</li>
            <li><strong>Split Payment</strong> - Multiple payment methods</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={5} title="Complete Sale">
          <p className="mb-4">
            Receipt is generated automatically. Email, print, or skip.
          </p>
          <DocInfo>
            Inventory is updated automatically when sales are completed.
          </DocInfo>
        </DocStep>
      </section>

      {/* Inventory Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Inventory Management</h2>

        <h3 className="text-lg font-medium mb-3">Stock Tracking</h3>
        <p className="text-muted-foreground mb-4">
          Keep accurate stock counts across all locations:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Real-time stock levels updated with each sale</li>
          <li>Transfer stock between locations</li>
          <li>View stock history and movements</li>
          <li>Identify shrinkage and discrepancies</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Stock Adjustments</h3>
        <p className="text-muted-foreground mb-4">
          Manually adjust stock for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Receiving</strong> - New stock arrival</li>
          <li><strong>Damaged</strong> - Write off damaged items</li>
          <li><strong>Stock Take</strong> - Correct counts after physical inventory</li>
          <li><strong>Internal Use</strong> - Items used by staff or for promotion</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Low Stock Alerts</h3>
        <p className="text-muted-foreground mb-4">
          Get notified when items need reordering:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Set threshold per product</li>
          <li>Daily email summary of low stock items</li>
          <li>Dashboard widget showing items to reorder</li>
        </ul>
        <DocTip>
          Review your low stock report weekly and reorder before items run out.
        </DocTip>
      </section>

      {/* Discounts & Promotions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Discounts & Promotions</h2>

        <h3 className="text-lg font-medium mb-3">Applying Discounts</h3>
        <p className="text-muted-foreground mb-4">
          Staff can apply discounts at checkout:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Percentage Off</strong> - e.g., 10% staff discount</li>
          <li><strong>Fixed Amount</strong> - e.g., £5 off</li>
          <li><strong>Promo Code</strong> - Apply member promo codes</li>
          <li><strong>Member Discount</strong> - Automatic discount for members</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Discount Permissions</h3>
        <p className="text-muted-foreground mb-4">
          Control who can apply discounts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Set maximum discount percentage per role</li>
          <li>Require manager approval above thresholds</li>
          <li>Track all discounts given with reason</li>
        </ul>
        <DocWarning>
          Audit discount reports regularly to prevent abuse. Large or frequent 
          discounts should require approval.
        </DocWarning>
      </section>

      {/* Hardware */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Hardware Integration</h2>
        <p className="text-muted-foreground mb-4">
          Our POS works with common retail hardware:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Card Readers</h4>
            <p className="text-sm text-muted-foreground">
              Stripe Terminal readers for tap, chip, and swipe payments.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Barcode Scanners</h4>
            <p className="text-sm text-muted-foreground">
              USB or Bluetooth scanners for quick product entry.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Receipt Printers</h4>
            <p className="text-sm text-muted-foreground">
              Thermal receipt printers via USB or network.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Cash Drawers</h4>
            <p className="text-sm text-muted-foreground">
              Connected cash drawers that open automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Sales Reporting</h2>
        <p className="text-muted-foreground mb-4">
          Track your retail performance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Daily Sales</strong> - Today's takings by payment method</li>
          <li><strong>Product Performance</strong> - Best and worst sellers</li>
          <li><strong>Category Analysis</strong> - Revenue by product category</li>
          <li><strong>Staff Performance</strong> - Sales by team member</li>
          <li><strong>Profit Margins</strong> - Revenue minus cost of goods</li>
          <li><strong>Trends</strong> - Compare periods week-over-week</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
