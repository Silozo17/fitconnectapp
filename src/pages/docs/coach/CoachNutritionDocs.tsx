import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Utensils, Calculator, Sparkles, Apple } from "lucide-react";

export default function CoachNutritionDocs() {
  return (
    <DocsLayout
      title="Nutrition Builder"
      description="Create personalised meal plans for your clients."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "Nutrition Builder" }]}
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
      <DocTip>Clients can generate shopping lists directly from their assigned nutrition plans.</DocTip>
    </DocsLayout>
  );
}
