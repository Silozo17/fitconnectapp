import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Sparkles, Dumbbell, Utensils, Calculator } from "lucide-react";

export default function CoachAIDocs() {
  return (
    <DocsLayout
      title="AI Tools for Coaches"
      description="Use AI to generate workout plans, meal suggestions, and more."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "AI Tools" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Available AI Features
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><Dumbbell className="h-4 w-4 text-blue-500" /> Workout Plan Generator</h3>
            <p className="text-sm text-muted-foreground">Generate customised workout programs based on client goals, equipment, and experience level.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><Utensils className="h-4 w-4 text-green-500" /> Meal Plan Suggestions</h3>
            <p className="text-sm text-muted-foreground">AI-generated meal plans that meet macro targets while respecting dietary restrictions.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1 flex items-center gap-2"><Calculator className="h-4 w-4 text-amber-500" /> Macro Calculator</h3>
            <p className="text-sm text-muted-foreground">Automatically calculate calorie and macro recommendations for clients based on their data.</p>
          </div>
        </div>
      </section>
      <DocTip>AI generates suggestions that you can review and customise before sending to clients. You remain in control.</DocTip>
    </DocsLayout>
  );
}
