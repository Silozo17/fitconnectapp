import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, TrendingUp, CheckCircle, XCircle, RefreshCw, Target, Shield } from "lucide-react";

export default function CoachAIRecommendationsDocs() {
  return (
    <DocsLayout
      title="AI Plan Recommendations"
      description="Get intelligent suggestions to optimise your clients' workout and nutrition plans based on their progress data."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "AI Recommendations" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to leverage AI-powered insights to improve their 
            clients' programmes. The recommendation system analyses client data and suggests 
            evidence-based adjustments to help your clients achieve better results.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Intelligent Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI analyses client progress, workout logs, and check-in data to identify opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Actionable Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive specific, implementable recommendations with clear rationale.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Progress-Based
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recommendations adapt based on real progress data, not just static plans.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Goal-Aligned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Suggestions are tailored to each client's specific goals and timeline.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Even experienced coaches can benefit from a second perspective. The AI recommendation 
            system helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Catch patterns you might miss when managing multiple clients</li>
            <li>Stay evidence-based with suggestions backed by training science</li>
            <li>Save time by having analysis done automatically</li>
            <li>Ensure no client falls through the cracks</li>
            <li>Continuously optimise programmes for better outcomes</li>
          </ul>
        </section>

        {/* Types of Recommendations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Types of Recommendations</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Workout Adjustments</h3>
              <p className="text-sm text-muted-foreground">
                Suggestions to modify volume, intensity, exercise selection, or rest periods based 
                on performance trends and recovery indicators.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Nutrition Modifications</h3>
              <p className="text-sm text-muted-foreground">
                Calorie or macro adjustments based on weight trends, activity levels, and goal 
                progress. May suggest increasing protein or adjusting meal timing.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Recovery Interventions</h3>
              <p className="text-sm text-muted-foreground">
                Recommendations for deload weeks, rest days, or reduced intensity when signs of 
                overtraining or poor recovery are detected.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Goal Refinement</h3>
              <p className="text-sm text-muted-foreground">
                Suggestions to adjust targets or timelines based on realistic progress rates, 
                helping set achievable expectations.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How It Works</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Data Collection">
              The AI continuously monitors client data including workout logs, weight changes, 
              check-in responses, habit completion, and wearable metrics (if connected).
            </DocStep>

            <DocStep stepNumber={2} title="Analysis">
              When patterns emerge or significant data is available, the AI generates 
              recommendations with a clear rationale for each suggestion.
            </DocStep>

            <DocStep stepNumber={3} title="Review">
              You receive recommendations in your dashboard with priority indicators 
              (high/medium/low) based on urgency and potential impact.
            </DocStep>

            <DocStep stepNumber={4} title="Action">
              Review each recommendation, then choose to apply it to the client's plan, 
              dismiss it, or save it for later consideration.
            </DocStep>
          </div>
        </section>

        {/* Priority Levels */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Understanding Priority Levels</h2>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                High Priority
              </h3>
              <p className="text-sm text-muted-foreground">
                Urgent attention needed. Examples: signs of overtraining, significant plateau 
                detected, or rapid weight changes that need intervention.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Medium Priority
              </h3>
              <p className="text-sm text-muted-foreground">
                Worth addressing soon. Examples: optimisation opportunities, minor adjustments 
                that could improve progress, or approaching a plateau.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Low Priority
              </h3>
              <p className="text-sm text-muted-foreground">
                Nice-to-have improvements. Examples: minor tweaks for variety, preventive 
                suggestions, or efficiency improvements.
              </p>
            </div>
          </div>
        </section>

        {/* Taking Action */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Taking Action on Recommendations</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Apply Recommendation
              </h3>
              <p className="text-sm text-muted-foreground">
                Click "Apply" to implement the suggestion. For workout changes, this updates the 
                client's current plan. For nutrition, it adjusts their targets. You can always 
                customise before applying.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Dismiss
              </h3>
              <p className="text-sm text-muted-foreground">
                Not every recommendation will be appropriate. Dismiss suggestions that don't 
                fit your coaching approach or client context. Dismissed recommendations won't 
                reappear.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Regenerate
              </h3>
              <p className="text-sm text-muted-foreground">
                If recommendations seem outdated or you want fresh analysis after new data, 
                click "Regenerate" to get updated suggestions.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Use the rationale provided with each recommendation to explain changes to your client. 
            This builds trust and helps them understand the "why" behind adjustments.
          </DocTip>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data Usage
          </h2>
          <DocInfo>
            Recommendations are generated using only the data clients have shared with you 
            through the platform. AI analysis is performed securely and data is not shared 
            with third parties.
          </DocInfo>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Important Notes</h2>
          <DocWarning>
            AI recommendations are suggestions, not prescriptions. Always apply your professional 
            judgement and knowledge of the individual client before implementing changes.
          </DocWarning>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>Keep in mind:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Recommendations require sufficient client data to be accurate</li>
              <li>AI cannot account for factors not tracked in the platform</li>
              <li>Your coaching expertise remains the most important factor</li>
              <li>Some recommendations may expire if not acted on within a timeframe</li>
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How often are recommendations generated?</h3>
              <p className="text-sm text-muted-foreground">
                Recommendations are generated when meaningful new data is available, typically 
                after check-ins, workout completions, or weekly progress updates.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I see recommendations for all clients at once?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, your dashboard shows a summary of pending recommendations across all clients, 
                prioritised by urgency. You can also view per-client recommendations.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if I disagree with a recommendation?</h3>
              <p className="text-sm text-muted-foreground">
                Simply dismiss it. The AI learns from patterns but doesn't know everything about 
                your client. Your judgement takes precedence.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do clients see these recommendations?</h3>
              <p className="text-sm text-muted-foreground">
                No, recommendations are visible only to you. If you apply a recommendation, clients 
                see the updated plan but not the AI suggestion behind it.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
