import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Scale, Dumbbell, AlertCircle, Lightbulb, BarChart3, Target, RefreshCw } from "lucide-react";

export default function CoachPlateauDocs() {
  return (
    <DocsLayout
      title="Plateau Detection"
      description="Automatically identify when clients hit progress plateaus and get suggestions to break through."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Plateau Detection" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to proactively identify when clients' progress 
            stalls. Plateaus are frustrating for clients and can lead to disengagement if not 
            addressed promptly.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Weight Plateaus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Detects when a client's weight hasn't changed significantly over multiple weeks.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  Strength Plateaus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Identifies when lifting numbers have stagnated without progression.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Measurement Plateaus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tracks body measurements to spot when changes stop despite consistent effort.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Breakthrough Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI-powered recommendations for programme adjustments to break through plateaus.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Plateaus are a normal part of fitness journeys, but they can be demoralising. 
            Early detection helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Catch stalls before clients become frustrated</li>
            <li>Make timely programme adjustments</li>
            <li>Maintain client motivation and trust</li>
            <li>Demonstrate proactive, attentive coaching</li>
            <li>Reduce client churn due to lack of progress</li>
          </ul>
        </section>

        {/* How Detection Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How Detection Works</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Data Analysis">
              The system analyses logged weights, measurements, and workout data over rolling 
              time windows (typically 2-4 weeks).
            </DocStep>

            <DocStep stepNumber={2} title="Trend Calculation">
              Statistical analysis determines if changes are within normal fluctuation or 
              represent a genuine plateau.
            </DocStep>

            <DocStep stepNumber={3} title="Alert Generation">
              When a plateau is detected, you receive an alert with the client's data and 
              the type of plateau identified.
            </DocStep>

            <DocStep stepNumber={4} title="Suggestions Provided">
              Along with the alert, you get AI-generated suggestions for breaking the plateau 
              based on the client's history and goals.
            </DocStep>
          </div>
        </section>

        {/* Plateau Types */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Types of Plateaus</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Weight Loss Plateau
              </h3>
              <p className="text-sm text-muted-foreground">
                Client's weight hasn't decreased in 2+ weeks despite being in a deficit. 
                Common causes: metabolic adaptation, water retention, or adherence issues.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weight Gain Plateau
              </h3>
              <p className="text-sm text-muted-foreground">
                Client trying to gain weight has stalled. May need calorie increase or 
                programme adjustment.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Strength Plateau
              </h3>
              <p className="text-sm text-muted-foreground">
                Lifts haven't progressed in 3+ weeks. May indicate need for deload, 
                technique work, or programme change.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Body Composition Plateau
              </h3>
              <p className="text-sm text-muted-foreground">
                Measurements haven't changed despite consistent training. May be time 
                for a diet break or training variation.
              </p>
            </div>
          </div>
        </section>

        {/* Breaking Through */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Breaking Through Plateaus
          </h2>
          <p className="text-muted-foreground mb-4">
            Common strategies the system may suggest:
          </p>
          <div className="space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Calorie Adjustment</h3>
              <p className="text-sm text-muted-foreground">
                Slight reduction for weight loss or increase for weight gain. Sometimes a 
                "diet break" at maintenance helps reset.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Programme Variation</h3>
              <p className="text-sm text-muted-foreground">
                Change exercises, rep ranges, or training split to provide new stimulus.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Deload Week</h3>
              <p className="text-sm text-muted-foreground">
                Reduce volume/intensity temporarily to allow recovery and supercompensation.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Sleep & Stress Review</h3>
              <p className="text-sm text-muted-foreground">
                Check wearable data for sleep quality and recovery. External stress can stall progress.
              </p>
            </div>
          </div>

          <DocTip className="mt-4">
            Before making major changes, verify the client is actually tracking accurately. 
            Many "plateaus" are actually tracking inconsistencies.
          </DocTip>
        </section>

        {/* Viewing Plateau Alerts */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Viewing Plateau Alerts</h2>
          <p className="text-muted-foreground mb-4">
            Plateau alerts appear in multiple places:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Dashboard:</strong> Quick view of all clients with detected plateaus</li>
            <li><strong>Client Profile:</strong> Detailed plateau history and current status</li>
            <li><strong>Notifications:</strong> Real-time alerts when new plateaus are detected</li>
            <li><strong>AI Recommendations:</strong> Plateau-specific suggestions in the recommendations panel</li>
          </ul>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How long before a plateau is detected?</h3>
              <p className="text-sm text-muted-foreground">
                Typically 2-3 weeks of no significant change. The threshold varies by metric 
                type and client history.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I adjust detection sensitivity?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, in Settings → Alerts, you can adjust how sensitive the plateau detection 
                is for your coaching style.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if the plateau is expected?</h3>
              <p className="text-sm text-muted-foreground">
                You can dismiss alerts and mark them as "expected" (e.g., during a maintenance 
                phase). Future alerts for that client will be adjusted.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Does this work without logged data?</h3>
              <p className="text-sm text-muted-foreground">
                The feature requires clients to log progress. Encourage consistent tracking for 
                accurate plateau detection.
              </p>
            </div>
          </div>
        </section>

        <DocInfo>
          Plateaus are normal and temporary. The key is catching them early and making 
          thoughtful adjustments rather than drastic changes.
        </DocInfo>
      </div>
    </DocsLayout>
  );
}