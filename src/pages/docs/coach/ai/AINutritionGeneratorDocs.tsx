import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Utensils, Apple } from "lucide-react";

export default function AINutritionGeneratorDocs() {
  return (
    <DocsLayout
      title="AI Meal Plan Generator | FitConnect Coach Guide"
      description="Generate balanced meal plans meeting client macros and dietary needs. Save hours on nutrition planning."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Nutrition Generator" },
      ]}
    >
      {/* Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          The AI Nutrition Generator creates customised meal plans based on your client's caloric needs,
          macro targets, dietary restrictions, and food preferences. It saves hours of manual planning
          while ensuring nutritionally balanced recommendations.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Utensils className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Personalised Plans</h3>
            <p className="text-sm text-muted-foreground">
              Meal plans tailored to individual calorie and macro targets.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Apple className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Allergy-Aware</h3>
            <p className="text-sm text-muted-foreground">
              Automatically excludes allergens and respects dietary restrictions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        
        <DocStep number={1} title="Access the Generator">
          Navigate to a client's profile, then go to the Nutrition tab. Click "Generate with AI"
          to open the nutrition generator.
        </DocStep>

        <DocStep number={2} title="Review Client Data">
          The AI automatically pulls in your client's:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Calculated TDEE and macro targets</li>
            <li>Dietary restrictions (vegetarian, vegan, gluten-free, etc.)</li>
            <li>Food allergies and intolerances</li>
            <li>Cuisine preferences</li>
          </ul>
        </DocStep>

        <DocStep number={3} title="Customise Parameters">
          Adjust the generation settings:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Number of meals per day (3-6)</li>
            <li>Include snacks</li>
            <li>Meal prep friendly options</li>
            <li>Budget considerations</li>
          </ul>
        </DocStep>

        <DocStep number={4} title="Generate and Review">
          Click "Generate Plan" and review the AI-created meal plan. You can regenerate
          individual meals or the entire plan if needed.
        </DocStep>

        <DocStep number={5} title="Edit and Assign">
          Make any manual adjustments, then assign the plan to your client. They'll receive
          a notification with their new meal plan.
        </DocStep>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Verify Allergies First</h3>
            <p className="text-sm text-muted-foreground">
              Always confirm your client's allergen preferences are up to date before generating plans.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Start Simple</h3>
            <p className="text-sm text-muted-foreground">
              Begin with basic, easy-to-prepare meals. You can increase complexity as clients become more comfortable.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Review Before Sending</h3>
            <p className="text-sm text-muted-foreground">
              Always review AI-generated content before assigning to ensure it meets your standards.
            </p>
          </div>
        </div>
      </section>

      <DocTip type="info">
        The AI uses your client's food diary history to suggest meals they're more likely to enjoy
        and stick with.
      </DocTip>

      {/* Changelog */}
      <section className="mt-8 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Last updated:</strong> December 2024
        </p>
      </section>
    </DocsLayout>
  );
}