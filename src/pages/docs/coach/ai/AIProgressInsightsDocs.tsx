import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { TrendingUp, Activity, Scale, Brain, AlertTriangle, Target } from "lucide-react";

export default function AIProgressInsightsDocs() {
  return (
    <DocsLayout
      title="AI Progress Insights | FitConnect Coach Guide"
      description="Understand client trends with AI-powered analysis. Identify plateaus, patterns and opportunities."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Progress Insights" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What Progress Insights Analyse</h2>
        <p>
          AI Progress Insights examine your client's historical data to identify meaningful patterns 
          that might not be immediately obvious. The analysis covers multiple dimensions of their 
          fitness journey.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Body Composition</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Weight trends, measurement changes, body fat progression over time.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Activity Patterns</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Workout frequency, completion rates, session intensity, rest day patterns.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Goal Progress</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Trajectory towards targets, pace of progress, projected completion dates.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Engagement Trends</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Habit compliance, message responsiveness, plan adherence over weeks.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Sources</h2>
        <p>Insights are generated from multiple data streams:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Manual entries</strong> – Progress logs, measurements, notes entered by the client</li>
          <li><strong>Wearable data</strong> – Steps, heart rate, sleep, calories from connected devices</li>
          <li><strong>Workout logs</strong> – Completed exercises, sets, reps, weights used</li>
          <li><strong>Habit tracking</strong> – Daily habit completions and streak data</li>
          <li><strong>Session history</strong> – Attendance, cancellations, rescheduling patterns</li>
        </ul>
        
        <DocInfo>
          More data points lead to more accurate insights. Encourage clients to log consistently 
          and connect their wearable devices for the best analysis.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Understanding Trend Analysis</h2>
        <p>
          The AI identifies several types of trends in your client's data:
        </p>
        
        <div className="space-y-3 mt-4">
          <div className="p-3 border-l-4 border-green-500 bg-green-500/5 rounded-r-lg">
            <h3 className="font-medium text-green-700 dark:text-green-400">Positive Trends</h3>
            <p className="text-sm text-muted-foreground">
              Consistent improvement over time – weight loss on track, strength increasing, 
              habits becoming more consistent.
            </p>
          </div>
          
          <div className="p-3 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-lg">
            <h3 className="font-medium text-amber-700 dark:text-amber-400">Plateaus</h3>
            <p className="text-sm text-muted-foreground">
              Progress has stalled – no significant change in key metrics for 2+ weeks despite 
              continued effort.
            </p>
          </div>
          
          <div className="p-3 border-l-4 border-red-500 bg-red-500/5 rounded-r-lg">
            <h3 className="font-medium text-red-700 dark:text-red-400">Declining Trends</h3>
            <p className="text-sm text-muted-foreground">
              Metrics moving in the wrong direction – engagement dropping, weight rebounding, 
              workout frequency decreasing.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Interpreting Predictions</h2>
        <p>
          Based on current trends, the AI may project future outcomes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Goal completion estimates</strong> – "At current pace, client will reach target weight in ~6 weeks"</li>
          <li><strong>Risk indicators</strong> – "Engagement declining – may need intervention within 2 weeks"</li>
          <li><strong>Milestone projections</strong> – "On track to hit 100-day streak by [date]"</li>
        </ul>
        
        <DocWarning>
          Predictions are estimates based on historical patterns. Real-world factors like life events, 
          motivation changes, or plan adjustments will affect actual outcomes.
        </DocWarning>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Acting on Insights</h2>
        <p>Each insight type suggests different coaching actions:</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 border-b">Insight Type</th>
                <th className="text-left p-3 border-b">Suggested Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">Positive momentum</td>
                <td className="p-3 border-b">Celebrate wins, consider progressive overload</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Plateau detected</td>
                <td className="p-3 border-b">Review and adjust training or nutrition plan</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Engagement dropping</td>
                <td className="p-3 border-b">Send check-in message, schedule a call</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Inconsistent logging</td>
                <td className="p-3 border-b">Remind about tracking, simplify requirements</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Goal ahead of schedule</td>
                <td className="p-3 border-b">Discuss next goals, prevent complacency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">AI Limitations</h2>
        <DocWarning>
          AI insights are tools to support your coaching, not replace your expertise. Always combine 
          AI analysis with your professional judgement and direct client communication.
        </DocWarning>
        
        <p>The AI cannot:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Detect medical conditions or health issues</li>
          <li>Account for emotional or psychological factors</li>
          <li>Understand context that hasn't been logged</li>
          <li>Predict the impact of external life events</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
