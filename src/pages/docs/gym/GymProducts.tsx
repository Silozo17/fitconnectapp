import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymProducts() {
  return (
    <DocsLayout
      title="Products & Inventory"
      description="Manage retail products, supplements, merchandise, and inventory for your gym's point of sale system."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Products & Inventory" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Sell products alongside your memberships and classes. FitConnect's product management 
          system handles everything from protein supplements to branded merchandise.
        </p>
      </section>

      {/* Product Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Product Types</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Physical Products</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Tangible items with inventory tracking:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Supplements (protein, pre-workout, vitamins)</li>
              <li>• Merchandise (t-shirts, hoodies, water bottles)</li>
              <li>• Equipment (wraps, gloves, yoga mats)</li>
              <li>• Snacks and beverages</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Service Products</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Non-physical items and add-ons:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Day passes and guest fees</li>
              <li>• Equipment rental</li>
              <li>• Locker rental</li>
              <li>• Assessment fees</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Digital Products</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Downloadable or online content:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Workout programs</li>
              <li>• Nutrition guides</li>
              <li>• Video courses</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Adding Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Adding Products</h2>

        <DocStep stepNumber={1} title="Navigate to Products">
          <p>Go to Point of Sale → Products or Inventory → Products in your dashboard.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Add Product">
          <p>Click "Add Product" and select the product type.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Enter Product Details">
          <p className="mb-4">Fill in the product information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Name</strong> - Clear, descriptive product name</li>
            <li><strong>Description</strong> - Details shown to customers</li>
            <li><strong>Category</strong> - Group similar products together</li>
            <li><strong>SKU</strong> - Unique product code for inventory tracking</li>
            <li><strong>Images</strong> - Product photos for POS display</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Set Pricing">
          <p className="mb-4">Configure the product's price:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Retail Price</strong> - What customers pay</li>
            <li><strong>Cost Price</strong> - Your purchase cost (for margin tracking)</li>
            <li><strong>Tax Rate</strong> - VAT or applicable tax</li>
            <li><strong>Member Discount</strong> - Optional discount for members</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={5} title="Set Stock Levels">
          <p>For physical products, enter current stock quantity and set reorder alerts.</p>
        </DocStep>

        <DocTip>
          Use product variants for items that come in multiple sizes or flavours 
          (e.g., Protein Powder - Chocolate, Vanilla, Strawberry).
        </DocTip>
      </section>

      {/* Product Variants */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Product Variants</h2>

        <p className="text-muted-foreground mb-4">
          Create variants for products with different options:
        </p>

        <DocStep stepNumber={1} title="Enable Variants">
          <p>When creating or editing a product, toggle on "This product has variants".</p>
        </DocStep>

        <DocStep stepNumber={2} title="Define Options">
          <p className="mb-4">Add variant options:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Size</strong> - Small, Medium, Large, XL</li>
            <li><strong>Colour</strong> - Black, White, Red</li>
            <li><strong>Flavour</strong> - Chocolate, Vanilla, Berry</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Configure Variants">
          <p>Set individual prices and stock levels for each variant combination.</p>
        </DocStep>

        <DocInfo>
          Each variant can have its own SKU, price, and stock level. 
          This allows precise inventory tracking for each option.
        </DocInfo>
      </section>

      {/* Inventory Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Inventory Management</h2>

        <h3 className="text-xl font-medium mb-4">Stock Tracking</h3>
        <p className="text-muted-foreground mb-4">
          Keep accurate inventory counts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Automatic stock reduction when items are sold</li>
          <li>Manual stock adjustments for losses, damages, or corrections</li>
          <li>Stock count feature for physical inventory audits</li>
          <li>Stock history showing all movements</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Low Stock Alerts</h3>
        <DocStep stepNumber={1} title="Set Reorder Point">
          <p>For each product, set the stock level that triggers a low stock alert.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Configure Notifications">
          <p>Choose who receives alerts and how (email, in-app notification).</p>
        </DocStep>

        <DocStep stepNumber={3} title="View Low Stock Report">
          <p>Access the low stock report to see all products needing reorder at a glance.</p>
        </DocStep>

        <DocWarning>
          Running out of popular items frustrates members. Set reorder points with 
          enough lead time for your suppliers to deliver.
        </DocWarning>
      </section>

      {/* Stock Adjustments */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Stock Adjustments</h2>

        <p className="text-muted-foreground mb-4">
          Adjust stock levels for non-sales reasons:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-green-500">Stock Received</h4>
            <p className="text-sm text-muted-foreground">
              Add stock when receiving deliveries from suppliers.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-red-500">Stock Loss</h4>
            <p className="text-sm text-muted-foreground">
              Remove stock for damages, theft, or expired products.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-blue-500">Stock Correction</h4>
            <p className="text-sm text-muted-foreground">
              Adjust when physical count differs from system count.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-purple-500">Stock Transfer</h4>
            <p className="text-sm text-muted-foreground">
              Move stock between locations (multi-location gyms).
            </p>
          </div>
        </div>

        <DocTip>
          Always record a reason for stock adjustments. This creates an audit trail 
          and helps identify patterns like recurring shrinkage.
        </DocTip>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Product Categories</h2>

        <p className="text-muted-foreground mb-4">
          Organise products into categories for easier browsing and reporting:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Supplements</strong> - Protein, creatine, pre-workout</li>
          <li><strong>Apparel</strong> - T-shirts, shorts, hoodies</li>
          <li><strong>Equipment</strong> - Gloves, wraps, mats</li>
          <li><strong>Drinks</strong> - Water, energy drinks, shakes</li>
          <li><strong>Snacks</strong> - Protein bars, healthy snacks</li>
          <li><strong>Services</strong> - Day passes, rentals</li>
        </ul>

        <DocInfo>
          Categories appear on your POS screen for quick product selection. 
          Arrange them in order of sales frequency.
        </DocInfo>
      </section>

      {/* Reports */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Product Reports</h2>
        
        <p className="text-muted-foreground mb-4">
          Analyse product performance:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Sales by Product</strong> - Best and worst sellers</li>
          <li><strong>Sales by Category</strong> - Category performance comparison</li>
          <li><strong>Profit Margins</strong> - Actual profit per product</li>
          <li><strong>Inventory Value</strong> - Total value of current stock</li>
          <li><strong>Stock Movement</strong> - All stock ins and outs</li>
          <li><strong>Low Stock Report</strong> - Items needing reorder</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
