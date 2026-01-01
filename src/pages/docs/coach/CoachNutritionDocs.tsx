import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Utensils, Calculator, Sparkles, Apple } from "lucide-react";

export default function CoachNutritionDocs() {
  return (
    <DocsLayout
      title="Create Meal Plans | FitConnect Coach Guide"
      description="Build nutrition plans with macro targets. Use our 650k food database for UK supermarket products."
      breadcrumbs={[{ label: "Coach Guide", href: "/docs/coach" }, { label: "Nutrition Builder" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Build comprehensive nutrition plans with daily meal schedules, macro targets, 
          and recipes from our database or your own custom meals.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Creating a Nutrition Plan</h2>
        <DocStep stepNumber={1} title="Start new plan">Go to Plans → Nutrition → New Plan.</DocStep>
        <DocStep stepNumber={2} title="Set targets">Define calorie and macro goals for your client.</DocStep>
        <DocStep stepNumber={3} title="Add meals">Build daily meals from the food database or add custom recipes.</DocStep>
        <DocStep stepNumber={4} title="Assign to client">Select the client and set the plan duration.</DocStep>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Meal Suggestions
        </h2>
        <p className="text-muted-foreground">
          Use AI to generate meal suggestions based on your client's macro targets, 
          dietary restrictions, and preferences. Review and edit before assigning.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Food Database</h2>
        <p className="text-muted-foreground mb-4">
          Access a comprehensive food database when building nutrition plans:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Generic Foods (CalorieNinjas):</strong> Common ingredients like chicken, rice, vegetables with accurate macros</li>
          <li><strong>Branded Products (Open Food Facts):</strong> UK supermarket products with real nutritional data</li>
          <li><strong>Barcode Scanner:</strong> Scan product barcodes to quickly add items to meal plans</li>
          <li><strong>Custom Recipes:</strong> Create and save your own recipes with calculated nutritional totals</li>
        </ul>
        <DocTip>The database contains over 650,000 food items to choose from.</DocTip>
      </section>

      <DocTip>Clients can generate shopping lists directly from their assigned nutrition plans.</DocTip>
    </DocsLayout>
  );
}
