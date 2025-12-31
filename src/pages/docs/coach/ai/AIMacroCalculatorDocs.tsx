import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Calculator, Target, TrendingUp } from "lucide-react";

export default function AIMacroCalculatorDocs() {
  return (
    <DocsLayout
      title="AI Macro Calculator"
      description="Automatically calculate personalised calorie and macro targets based on client goals and data."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Macro Calculator" },
      ]}
    >
      {/* Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          The AI Macro Calculator analyses your client's profile data, activity level, and goals
          to generate precise calorie and macronutrient targets. It factors in metabolic adaptation
          and provides recommendations that evolve with your client's progress.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Calculator className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Precise Calculations</h3>
            <p className="text-sm text-muted-foreground">
              Uses multiple formulas for accuracy.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <Target className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Goal-Oriented</h3>
            <p className="text-sm text-muted-foreground">
              Adjusts targets based on objectives.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Adaptive</h3>
            <p className="text-sm text-muted-foreground">
              Updates recommendations over time.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
        
        <DocStep number={1} title="Access Calculator">
          Go to your client's profile and navigate to the Nutrition section. Click "Calculate Macros"
          or find it in the AI Tools menu.
        </DocStep>

        <DocStep number={2} title="Verify Client Data">
          The calculator uses:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Current weight and height</li>
            <li>Age and gender</li>
            <li>Activity level (sedentary to very active)</li>
            <li>Training frequency and intensity</li>
          </ul>
        </DocStep>

        <DocStep number={3} title="Select Goal">
          Choose the client's primary objective:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li><strong>Fat Loss:</strong> Moderate calorie deficit</li>
            <li><strong>Aggressive Cut:</strong> Larger deficit for faster results</li>
            <li><strong>Maintenance:</strong> Maintain current weight</li>
            <li><strong>Lean Bulk:</strong> Small surplus for muscle gain</li>
            <li><strong>Bulk:</strong> Larger surplus for maximum growth</li>
          </ul>
        </DocStep>

        <DocStep number={4} title="Review Recommendations">
          The AI provides:
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Daily calorie target</li>
            <li>Protein, carbohydrate, and fat breakdown</li>
            <li>Training vs rest day adjustments</li>
            <li>Estimated weekly progress</li>
          </ul>
        </DocStep>

        <DocStep number={5} title="Apply to Client">
          Click "Apply Targets" to save these as the client's nutrition goals. They'll appear
          in their food diary for tracking.
        </DocStep>
      </section>

      {/* Calculation Methods */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Calculation Methods</h2>
        <p className="text-muted-foreground mb-4">
          The AI uses multiple established formulas and compares results:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Mifflin-St Jeor</h3>
            <p className="text-sm text-muted-foreground">
              Most accurate for the general population, especially those with moderate activity levels.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Katch-McArdle</h3>
            <p className="text-sm text-muted-foreground">
              Factors in lean body mass, ideal for clients with known body composition data.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Adaptive Algorithm</h3>
            <p className="text-sm text-muted-foreground">
              Learns from the client's actual progress data to refine future recommendations.
            </p>
          </div>
        </div>
      </section>

      <DocTip type="info">
        The calculator becomes more accurate over time as it learns from your client's actual
        progress data. Encourage clients to log consistently for best results.
      </DocTip>

      <DocTip type="warning">
        Always use your professional judgement when applying AI recommendations. The calculator
        is a tool to assist, not replace, your expertise.
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