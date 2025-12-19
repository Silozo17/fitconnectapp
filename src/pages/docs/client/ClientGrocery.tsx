import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { ShoppingCart, Plus, Sparkles, Store, Check, Trash2 } from "lucide-react";

export default function ClientGrocery() {
  return (
    <DocsLayout
      title="Shopping Lists"
      description="Create grocery lists manually or generate them from your nutrition plan."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Shopping Lists" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Grocery feature helps you stay on track with your nutrition by making shopping easy. 
          Create lists manually, or let the platform generate a shopping list based on your 
          meal plan for the week.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-500" />
          Creating Manual Lists
        </h2>
        <DocStep stepNumber={1} title="Open Grocery">
          Navigate to <strong>Grocery</strong> in your client dashboard.
        </DocStep>
        <DocStep stepNumber={2} title="Create new list">
          Click &quot;New List&quot; and give it a name (e.g., &quot;Weekly Shop&quot;).
        </DocStep>
        <DocStep stepNumber={3} title="Add items">
          Type item names and quantities. You can also add notes like brand preferences.
        </DocStep>
        <DocStep stepNumber={4} title="Organise by category">
          Items are automatically categorised (produce, dairy, meat, etc.) to make shopping faster.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Generate from Meal Plan
        </h2>
        <p className="text-muted-foreground mb-4">
          If your coach has assigned a nutrition plan, you can automatically generate a shopping 
          list with all the ingredients you need.
        </p>
        <DocStep stepNumber={1} title="Select your meal plan">
          Choose the nutrition plan you want to shop for from the dropdown.
        </DocStep>
        <DocStep stepNumber={2} title="Choose date range">
          Select how many days of meals to include (1 day, 3 days, 7 days).
        </DocStep>
        <DocStep stepNumber={3} title="Generate list">
          Click &quot;Generate Shopping List&quot; - ingredients will be combined and quantities calculated.
        </DocStep>
        <DocStep stepNumber={4} title="Review and edit">
          Remove items you already have or adjust quantities as needed.
        </DocStep>
        <DocTip>
          The generator combines duplicate ingredients (e.g., if 3 recipes need chicken, it 
          calculates the total amount).
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-500" />
          Supermarket Integration
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect to your favourite UK supermarkets to check prices and add items to your 
          online basket directly from FitConnect.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <span className="font-medium text-blue-600">Tesco</span>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <span className="font-medium text-green-600">Asda</span>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 text-center">
            <span className="font-medium text-orange-600">Sainsbury's</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          <em>Integration availability may vary. We're continually adding more retailers.</em>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          Using Your List While Shopping
        </h2>
        <p className="text-muted-foreground mb-4">
          Access your shopping list on your phone while at the store:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Tap items to mark them as purchased (they'll move to the &quot;Done&quot; section)</li>
          <li>Items are grouped by category to match typical store layouts</li>
          <li>Swipe to remove items you can't find or don't need</li>
          <li>Add last-minute items with the quick-add button</li>
        </ul>
        <DocTip>
          Your list syncs in real-time, so if someone else in your household is shopping, 
          you'll both see the same updates.
        </DocTip>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Managing Lists
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Archive old lists</h3>
            <p className="text-sm text-muted-foreground">
              Completed lists are automatically archived after 7 days but remain accessible.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Duplicate lists</h3>
            <p className="text-sm text-muted-foreground">
              Copy a previous list as a starting point for your next shop.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Share lists</h3>
            <p className="text-sm text-muted-foreground">
              Send a list link to family members so they can help with shopping.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
