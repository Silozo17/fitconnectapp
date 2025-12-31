import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocSection } from "@/components/docs/DocSection";
import { DocTip } from "@/components/docs/DocTip";
import { DocStep } from "@/components/docs/DocStep";
import { Target, TrendingUp, Calendar, BarChart3, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function CoachGoalAdherenceDocs() {
  return (
    <DocsLayout
      title="Goal Adherence Tracking"
      description="Monitor how closely clients are following their goals and projected timelines for achievement."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Goal Adherence" },
      ]}
    >
      <DocSection title="What is Goal Adherence?">
        <p className="text-muted-foreground mb-4">
          Goal adherence measures how well a client is tracking towards their 
          defined goals. By comparing current progress against the expected 
          trajectory, you can identify clients who are on track, ahead of 
          schedule, or falling behind before they become discouraged.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Progress Tracking</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Compare actual progress against expected milestones
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Projections</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              See estimated completion dates based on current pace
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="How Adherence is Calculated">
        <p className="text-muted-foreground mb-4">
          The system calculates adherence by comparing where a client should be 
          versus where they actually are:
        </p>
        <div className="space-y-4">
          <DocStep number={1} title="Define the Goal">
            Set a start value, target value, and target date for the client's goal (e.g., lose 10kg by June).
          </DocStep>
          <DocStep number={2} title="Calculate Expected Progress">
            The system creates a linear trajectory from start to target, showing where the client should be each day.
          </DocStep>
          <DocStep number={3} title="Track Actual Progress">
            As the client logs progress (weight, measurements, etc.), actual values are compared to expected values.
          </DocStep>
          <DocStep number={4} title="Generate Adherence Score">
            The percentage indicates how close actual progress is to expected progress (100% = perfectly on track).
          </DocStep>
        </div>
        <DocTip className="mt-4">
          Adherence above 100% means the client is ahead of schedule. Below 100% 
          means they're behind, but may still achieve the goal if they accelerate.
        </DocTip>
      </DocSection>

      <DocSection title="Adherence Status">
        <p className="text-muted-foreground mb-4">
          Goals are categorised into three statuses based on adherence:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-card text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-green-600">On Track</h4>
            <p className="text-sm text-muted-foreground">
              80%+ adherence - client is progressing well
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium text-yellow-600">At Risk</h4>
            <p className="text-sm text-muted-foreground">
              50-79% adherence - may need intervention
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-medium text-red-600">Behind</h4>
            <p className="text-sm text-muted-foreground">
              Below 50% - goal revision recommended
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Goal Projection Charts">
        <p className="text-muted-foreground mb-4">
          The goal adherence view includes visual charts that show:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Expected vs Actual Line</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              A dual-line chart showing the ideal trajectory and the client's 
              actual progress over time. The gap between lines indicates how 
              far ahead or behind they are.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Projected Completion</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on current pace, the system estimates when the goal will 
              actually be achieved. This may be before, on, or after the 
              original target date.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Milestone Markers</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Key milestones (25%, 50%, 75% of goal) are marked on the chart, 
              showing when they were expected vs when they were actually achieved.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Using Adherence Data">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Celebrate On-Track Clients</h4>
            <p className="text-sm text-muted-foreground">
              Use adherence data to acknowledge clients who are consistently 
              hitting their targets. Recognition reinforces positive behaviour.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Intervene Early for At-Risk Goals</h4>
            <p className="text-sm text-muted-foreground">
              When adherence drops below 80%, schedule a check-in to understand 
              barriers and adjust the plan if needed.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Revise Unrealistic Goals</h4>
            <p className="text-sm text-muted-foreground">
              If a client is consistently behind, the goal may have been too 
              aggressive. Use the data to have an honest conversation about 
              setting a more achievable target.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Adjust Training Based on Pace</h4>
            <p className="text-sm text-muted-foreground">
              Clients ahead of schedule may be ready for more challenging 
              workouts. Those behind may need simpler, more sustainable plans.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Goal Types Tracked">
        <p className="text-muted-foreground mb-4">
          Adherence can be tracked for various goal types:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Goal Type</th>
                <th className="text-left py-2 font-medium">Measurement</th>
                <th className="text-left py-2 font-medium">Example</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 font-medium">Weight Loss</td>
                <td className="py-2">kg/lbs lost</td>
                <td className="py-2">Lose 8kg by April</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Weight Gain</td>
                <td className="py-2">kg/lbs gained</td>
                <td className="py-2">Gain 5kg muscle by July</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Body Composition</td>
                <td className="py-2">Body fat %</td>
                <td className="py-2">Reach 15% body fat</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Strength</td>
                <td className="py-2">Weight lifted</td>
                <td className="py-2">Squat 100kg</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Endurance</td>
                <td className="py-2">Distance/time</td>
                <td className="py-2">Run 5K in 25 minutes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Communicating with Clients">
        <p className="text-muted-foreground mb-4">
          When discussing goal adherence with clients:
        </p>
        <div className="space-y-4">
          <DocStep number={1} title="Focus on the Journey">
            Emphasise progress made rather than distance to go. Small wins build momentum.
          </DocStep>
          <DocStep number={2} title="Be Honest About Pace">
            If the projected completion is far from the target, discuss adjustments openly.
          </DocStep>
          <DocStep number={3} title="Identify Barriers">
            When adherence drops, ask about what's getting in the way rather than criticising.
          </DocStep>
          <DocStep number={4} title="Celebrate Milestones">
            Acknowledge when clients hit 25%, 50%, 75% of their goal to maintain motivation.
          </DocStep>
        </div>
        <DocTip className="mt-4">
          Clients don't need to see adherence percentages. Use the data to inform 
          your coaching, but communicate in terms of progress and next steps.
        </DocTip>
      </DocSection>
    </DocsLayout>
  );
}
