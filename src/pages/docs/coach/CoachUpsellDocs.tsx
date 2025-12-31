import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocSection } from "@/components/docs/DocSection";
import { DocTip } from "@/components/docs/DocTip";
import { DocStep } from "@/components/docs/DocStep";
import { Sparkles, TrendingUp, Package, Utensils, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function CoachUpsellDocs() {
  return (
    <DocsLayout
      title="Upsell Insights"
      description="Discover opportunities to offer additional services to clients who are ready for more."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Upsell Insights" },
      ]}
    >
      <DocSection title="What are Upsell Insights?">
        <p className="text-muted-foreground mb-4">
          Upsell Insights uses client behaviour data to identify opportunities where 
          clients may benefit from additional services. Rather than guessing who might 
          be interested in upgrading, the system analyses engagement patterns, progress, 
          and usage to suggest well-timed recommendations.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Data-Driven</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Suggestions based on actual client behaviour, not assumptions
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Well-Timed</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recommendations appear when clients are most receptive
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Types of Suggestions">
        <p className="text-muted-foreground mb-4">
          The system identifies four main types of upsell opportunities:
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Package Upgrade</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Client is nearing the end of their current package and has been 
              consistently engaged. Suggesting renewal or an upgraded package 
              with more sessions.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Trigger: Package 75%+ used with high attendance rate
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Add Nutrition</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Client is making progress with training but hasn't yet added 
              nutrition coaching. Their engagement suggests they're ready 
              for a more comprehensive approach.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Trigger: No nutrition plan but high workout adherence
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Extend Sessions</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Client consistently books shorter sessions but their progress 
              suggests they could benefit from longer, more comprehensive 
              training time.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Trigger: Multiple short sessions booked, strong engagement
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Premium Feature</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Client's usage patterns suggest they would benefit from 
              premium features like advanced analytics, priority booking, 
              or additional check-ins.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Trigger: Power user behaviour without premium access
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Confidence Levels">
        <p className="text-muted-foreground mb-4">
          Each suggestion includes a confidence level based on how strongly the 
          data supports the recommendation:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-card text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-green-600">High Confidence</h4>
            <p className="text-sm text-muted-foreground">
              Multiple strong signals indicate readiness
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium text-yellow-600">Medium Confidence</h4>
            <p className="text-sm text-muted-foreground">
              Some positive signals, worth exploring
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card text-center">
            <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h4 className="font-medium">Low Confidence</h4>
            <p className="text-sm text-muted-foreground">
              Weak signals, may not be the right time
            </p>
          </div>
        </div>
        <DocTip className="mt-4">
          Focus on high-confidence suggestions first. Low-confidence suggestions 
          can be dismissed or revisited later if circumstances change.
        </DocTip>
      </DocSection>

      <DocSection title="Acting on Suggestions">
        <div className="space-y-4">
          <DocStep number={1} title="Review the Suggestion">
            Read the reason why this client was identified and the suggested product or service.
          </DocStep>
          <DocStep number={2} title="Consider Timing">
            Check if the client has any upcoming sessions where you could discuss naturally.
          </DocStep>
          <DocStep number={3} title="Personalise Your Approach">
            Frame the upsell around the client's goals and progress, not just the product.
          </DocStep>
          <DocStep number={4} title="Record the Outcome">
            Mark suggestions as accepted or dismissed to improve future recommendations.
          </DocStep>
        </div>
      </DocSection>

      <DocSection title="Best Practices">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Lead with Value</h4>
            <p className="text-sm text-muted-foreground">
              Frame recommendations around how the additional service will help 
              the client achieve their goals faster, not around selling more.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Choose the Right Moment</h4>
            <p className="text-sm text-muted-foreground">
              Discuss upgrades after celebrating a win or during a natural 
              transition point (end of package, goal achieved).
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Respect "Not Now"</h4>
            <p className="text-sm text-muted-foreground">
              If a client declines, dismiss the suggestion. The system will 
              only resurface it if circumstances significantly change.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-medium mb-2">Don't Over-Sell</h4>
            <p className="text-sm text-muted-foreground">
              Focus on one suggestion at a time. Presenting multiple upsells 
              can feel pushy and damage trust.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Managing Suggestions">
        <p className="text-muted-foreground mb-4">
          Each suggestion can be managed with these actions:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 font-medium">Pending</td>
                <td className="py-2">New suggestion, not yet acted upon</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Accepted</td>
                <td className="py-2">Client took up the offer</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Dismissed</td>
                <td className="py-2">Not relevant or client declined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Privacy">
        <p className="text-muted-foreground">
          Upsell suggestions are generated from data already collected through 
          normal platform usage. Clients are never shown that they've been 
          identified for upselling. All suggestions are visible only to you 
          and are designed to help you serve clients better, not to be shared 
          with them directly.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
