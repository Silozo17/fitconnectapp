import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Sparkles, Dumbbell, Utensils, Calculator } from "lucide-react";

export default function CoachAIDocs() {
  return (
    <DocsLayout
      title="AI Tools Overview | FitConnect Coach Guide"
      description="Generate workouts, meal plans and client insights with AI assistance. Save hours on programme design."
      breadcrumbs={[{ label: "Coach Guide", href: "/docs/coach" }, { label: "AI Tools" }]}
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

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">AI Client Analysis</h2>
        <p className="text-muted-foreground mb-4">
          Generate comprehensive AI-powered reports that analyse your client's progress.
        </p>
        <div className="space-y-3 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">How to Generate</h3>
            <p className="text-sm text-muted-foreground">
              Go to a client's profile → Reports tab → Click "Generate Report". The AI will 
              analyse available data including measurements, progress photos, and wearable data.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">What's Analysed</h3>
            <p className="text-sm text-muted-foreground">
              Progress photos (visual changes), body measurements (trends over time), 
              wearable data (activity levels, sleep patterns), and compliance with assigned plans.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Regenerating Reports</h3>
            <p className="text-sm text-muted-foreground">
              You can regenerate reports at any time to include the latest data. Previous 
              reports are saved for historical reference.
            </p>
          </div>
        </div>
      </section>

      <DocTip>AI generates suggestions that you can review and customise before sending to clients. You remain in control.</DocTip>
    </DocsLayout>
  );
}
