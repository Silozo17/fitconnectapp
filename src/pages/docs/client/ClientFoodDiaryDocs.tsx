import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Utensils, Search, ScanBarcode, Camera, Clock, Eye, Calendar } from "lucide-react";

export default function ClientFoodDiaryDocs() {
  return (
    <DocsLayout
      title="Food Diary"
      description="Track your daily meals, calories, and macros to stay on top of your nutrition goals."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Food Diary" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The Food Diary helps you log everything you eat and drink throughout the day. 
          It automatically calculates calories and macronutrients (protein, carbs, fat) 
          to help you stay on track with your nutrition goals.
        </p>
        <DocTip>
          Your coach can view your meal logs if you've enabled this in your Data Privacy settings. 
          This helps them provide better nutritional guidance.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Adding Food via Search
        </h2>
        <p className="text-muted-foreground mb-4">
          Search our extensive food database to find and log your meals.
        </p>

        <DocStep stepNumber={1} title="Open Food Search">
          From the Food Diary page, tap the <strong>Add Food</strong> button and select a meal type 
          (Breakfast, Lunch, Dinner, or Snack).
        </DocStep>

        <DocStep stepNumber={2} title="Search for Food">
          Type the name of your food in the search bar. You can search for:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li><strong>Generic foods:</strong> "chicken breast", "brown rice", "apple" - from CalorieNinjas database</li>
          <li><strong>Branded products:</strong> "Tesco Greek Yogurt", "Sainsbury's Granola" - from Open Food Facts</li>
        </ul>

        <DocStep stepNumber={3} title="Select Serving Size">
          Choose your serving size from the dropdown (e.g., 100g, 1 cup, 1 medium). 
          The nutritional information will update automatically.
        </DocStep>

        <DocStep stepNumber={4} title="Confirm and Log">
          Review the calories and macros, then tap <strong>Add to Diary</strong>.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ScanBarcode className="h-5 w-5 text-green-500" />
          Adding Food via Barcode Scanner
        </h2>
        <p className="text-muted-foreground mb-4">
          Quickly log packaged foods by scanning their barcode.
        </p>

        <DocStep stepNumber={1} title="Open Barcode Scanner">
          Tap the <strong>Scan Barcode</strong> button (camera icon) in the food search screen.
        </DocStep>

        <DocStep stepNumber={2} title="Scan the Product">
          Point your camera at the product's barcode. The scanner will automatically detect and read it.
        </DocStep>

        <DocStep stepNumber={3} title="Review Product Info">
          If the product is found, you'll see its nutritional information. Select your serving size 
          and add it to your diary.
        </DocStep>

        <DocTip>
          If a product isn't found, you can enter the barcode manually or search for the product by name.
        </DocTip>

        <DocWarning>
          Some barcodes may not be in the database. In this case, try searching for the product by name 
          or adding it manually with the nutritional information from the packaging.
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Meal Types
        </h2>
        <p className="text-muted-foreground mb-4">
          Organize your food entries by meal type for better tracking:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">☀️ Breakfast</span>
            <p className="text-xs text-muted-foreground">Morning meals</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">🌤️ Lunch</span>
            <p className="text-xs text-muted-foreground">Midday meals</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">🌙 Dinner</span>
            <p className="text-xs text-muted-foreground">Evening meals</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <span className="font-medium text-sm">🍎 Snacks</span>
            <p className="text-xs text-muted-foreground">Between meals</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          Daily Summary & Navigation
        </h2>
        <p className="text-muted-foreground mb-4">
          Track your daily nutrition at a glance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Calorie Progress:</strong> See how many calories you've consumed vs your daily target</li>
          <li><strong>Macro Breakdown:</strong> View protein, carbs, and fat totals with progress bars</li>
          <li><strong>Date Navigation:</strong> Use the arrows to view previous or future days</li>
          <li><strong>Quick Edit:</strong> Tap any food entry to edit the serving size or delete it</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-red-500" />
          Coach Visibility
        </h2>
        <p className="text-muted-foreground mb-4">
          Your meal logs can be shared with your coaches to help them provide better nutritional guidance.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Control sharing via <strong>Settings → Privacy → Data Privacy</strong></li>
          <li>You can share with some coaches but not others</li>
          <li>If sharing is disabled, coaches will see "No access" for your meal data</li>
        </ul>
        <DocTip>
          Sharing your meal logs helps coaches understand your eating habits and make better 
          recommendations for your nutrition plan.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
