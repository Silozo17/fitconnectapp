import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocSection } from "@/components/docs/DocSection";
import { DocTip } from "@/components/docs/DocTip";
import { DocStep } from "@/components/docs/DocStep";
import { Activity, TrendingUp, TrendingDown, Minus, Users, MessageSquare, ClipboardCheck, Calendar } from "lucide-react";

export default function CoachEngagementScoringDocs() {
  return (
    <DocsLayout
      title="Client Engagement Scoring"
      description="Understand how engagement scores help you identify clients who need attention and track overall client health."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Engagement Scoring" },
      ]}
    >
      <DocSection title="What is Engagement Scoring?">
        <p className="text-muted-foreground mb-4">
          Engagement scoring is a data-driven system that measures how actively each client 
          participates in their training programme. By analysing multiple behavioural signals, 
          the platform generates a score from 0-100 that helps you quickly identify which 
          clients are thriving and which may need additional support.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Proactive Coaching</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Spot disengagement before clients drop off completely
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Portfolio Health</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              See your entire client roster's engagement at a glance
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Score Components">
        <p className="text-muted-foreground mb-4">
          The overall engagement score is calculated from five key behaviours, each weighted 
          according to its importance as an engagement indicator:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Session Attendance</h4>
              </div>
              <span className="text-sm font-medium text-primary">25%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tracks completed vs scheduled sessions over the last 30 days. Clients who 
              consistently show up score higher in this component.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Habit Completion</h4>
              </div>
              <span className="text-sm font-medium text-primary">25%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Measures daily habit tracking over the last 7 days. Consistent habit logging 
              indicates high engagement with the programme.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Message Responsiveness</h4>
              </div>
              <span className="text-sm font-medium text-primary">15%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Calculates average response time to coach messages over 14 days. Faster 
              responses indicate higher engagement and commitment.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Progress Logging</h4>
              </div>
              <span className="text-sm font-medium text-primary">20%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tracks weight, measurements, and photo updates over 14 days. Regular 
              progress logging shows investment in tracking results.
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Plan Adherence</h4>
              </div>
              <span className="text-sm font-medium text-primary">15%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Measures training log completions over the last 7 days. Completing 
              assigned workouts demonstrates following the programme.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Understanding Trends">
        <p className="text-muted-foreground mb-4">
          Beyond the current score, the system tracks week-over-week changes to show 
          engagement trajectory:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-card text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-green-600">Improving</h4>
            <p className="text-sm text-muted-foreground">
              Score increased from last week
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <Minus className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium text-yellow-600">Stable</h4>
            <p className="text-sm text-muted-foreground">
              Score unchanged from last week
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-medium text-red-600">Declining</h4>
            <p className="text-sm text-muted-foreground">
              Score decreased from last week
            </p>
          </div>
        </div>
        <DocTip className="mt-4">
          A declining trend is often more actionable than a low score. A client at 60 
          trending down may need attention before a client at 50 trending up.
        </DocTip>
      </DocSection>

      <DocSection title="Using Scores Effectively">
        <div className="space-y-4">
          <DocStep number={1} title="Review Low Scores Weekly">
            Check your client list sorted by engagement score to identify those below 50.
          </DocStep>
          <DocStep number={2} title="Investigate Component Breakdown">
            Look at individual components to understand where engagement is lacking.
          </DocStep>
          <DocStep number={3} title="Take Targeted Action">
            Address specific weak areas - e.g., if habit completion is low, simplify the habit requirements.
          </DocStep>
          <DocStep number={4} title="Monitor Changes">
            After intervention, watch for trend improvements in subsequent weeks.
          </DocStep>
        </div>
      </DocSection>

      <DocSection title="Score Thresholds">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Score Range</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2">80-100</td>
                <td className="py-2 text-green-600 font-medium">Highly Engaged</td>
                <td className="py-2">Maintain current approach, consider advanced challenges</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">60-79</td>
                <td className="py-2 text-blue-600 font-medium">Engaged</td>
                <td className="py-2">Standard coaching, monitor for changes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">40-59</td>
                <td className="py-2 text-yellow-600 font-medium">At Risk</td>
                <td className="py-2">Proactive check-in, identify barriers</td>
              </tr>
              <tr>
                <td className="py-2">0-39</td>
                <td className="py-2 text-red-600 font-medium">Disengaged</td>
                <td className="py-2">Urgent intervention, consider plan adjustment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Privacy & Data">
        <p className="text-muted-foreground">
          Engagement scores are calculated from data clients have already shared through 
          normal platform usage. Scores are visible only to the coach and are not shared 
          with clients unless you choose to discuss them. All calculations happen in 
          real-time based on the most recent data, ensuring scores always reflect 
          current engagement levels.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
