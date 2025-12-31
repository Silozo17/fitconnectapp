import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Users, Bell, Shield, BarChart3, MessageSquare, Target } from "lucide-react";

export default function CoachClientRiskDocs() {
  return (
    <DocsLayout
      title="Client Risk Detection"
      description="Identify at-risk clients early and take proactive steps to retain them and support their journey."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Client Risk" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to proactively identify clients who may be 
            struggling, disengaging, or at risk of churning. Early intervention can save 
            relationships and improve outcomes.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Risk Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each client receives a risk score based on engagement patterns and behaviour changes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  Churn Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI predicts which clients are most likely to cancel or stop engaging.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Proactive Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when clients show warning signs before it's too late.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Intervention Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get recommended actions to re-engage at-risk clients effectively.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Losing clients is costly—both financially and emotionally. Risk detection helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Identify struggling clients before they give up or cancel</li>
            <li>Prioritise your time on clients who need the most support</li>
            <li>Reduce churn and increase client lifetime value</li>
            <li>Improve client outcomes through timely intervention</li>
            <li>Build stronger, longer-lasting coaching relationships</li>
          </ul>
        </section>

        {/* Risk Indicators */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Risk Indicators</h2>
          <p className="text-muted-foreground mb-4">
            The system analyses multiple signals to determine risk level:
          </p>
          <div className="space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Declining Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Fewer workouts logged, missed check-ins, or reduced message activity.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Habit Streak Breaks</h3>
              <p className="text-sm text-muted-foreground">
                Previously consistent clients suddenly breaking habits or missing targets.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Stalled Progress</h3>
              <p className="text-sm text-muted-foreground">
                No weight change, measurements, or strength gains over extended periods.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Session Cancellations</h3>
              <p className="text-sm text-muted-foreground">
                Increasing cancellations or no-shows to scheduled sessions.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Negative Sentiment</h3>
              <p className="text-sm text-muted-foreground">
                Frustrated messages, complaints, or expressions of doubt about continuing.
              </p>
            </div>
          </div>
        </section>

        {/* Risk Stages */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Risk Stages</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Low Risk (Healthy)
              </h3>
              <p className="text-sm text-muted-foreground">
                Client is engaged, logging workouts, and making progress. No intervention needed.
              </p>
            </div>

            <div className="bg-card/50 border border-amber-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Medium Risk (Watch)
              </h3>
              <p className="text-sm text-muted-foreground">
                Some warning signs detected. Consider a check-in message or motivational nudge.
              </p>
            </div>

            <div className="bg-card/50 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                High Risk (At Risk)
              </h3>
              <p className="text-sm text-muted-foreground">
                Multiple warning signs. Immediate outreach recommended to understand issues and provide support.
              </p>
            </div>
          </div>
        </section>

        {/* Taking Action */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Taking Action</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Review the Dashboard">
              Check your client risk dashboard to see clients sorted by risk level.
            </DocStep>

            <DocStep stepNumber={2} title="Understand the Signals">
              Click on a client to see which specific indicators triggered their risk status.
            </DocStep>

            <DocStep stepNumber={3} title="Reach Out">
              Send a personalised message addressing their specific situation. Use the suggested 
              message templates if needed.
            </DocStep>

            <DocStep stepNumber={4} title="Adjust Their Programme">
              If the issue is programme-related (too hard, boring, not fitting their schedule), 
              make adjustments collaboratively.
            </DocStep>

            <DocStep stepNumber={5} title="Follow Up">
              Set a reminder to check in again in a few days to see if engagement improves.
            </DocStep>
          </div>

          <DocTip className="mt-4">
            A genuine, empathetic message often works better than a generic check-in. 
            Reference specific data: "I noticed you haven't logged workouts this week—everything okay?"
          </DocTip>
        </section>

        {/* Automation Options */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Automation Options</h2>
          <p className="text-muted-foreground mb-4">
            You can enable automated responses for at-risk clients:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Soft Check-in:</strong> Automatic gentle message when risk is first detected</li>
            <li><strong>Coach Alert:</strong> Notification to you when a client reaches high risk</li>
            <li><strong>Recovery Sequence:</strong> Multi-day outreach sequence for disengaged clients</li>
          </ul>

          <DocInfo className="mt-4">
            Automated messages can be customised in Settings → Automations → Dropoff Rescue.
          </DocInfo>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How accurate is churn prediction?</h3>
              <p className="text-sm text-muted-foreground">
                The model learns from historical data and improves over time. It's not perfect, 
                but it catches most at-risk clients before they cancel.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I see historical risk data?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, each client's profile shows their risk history over time so you can see 
                patterns and the impact of your interventions.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do clients know they're flagged as at-risk?</h3>
              <p className="text-sm text-muted-foreground">
                No, risk status is only visible to you. Clients are not notified about their risk level.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I mute alerts for specific clients?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can mute risk alerts temporarily for clients you're already actively 
                managing or who have valid reasons for reduced activity.
              </p>
            </div>
          </div>
        </section>

        <DocWarning>
          Risk detection is a tool, not a replacement for your coaching intuition. 
          Always consider the full context before reaching out.
        </DocWarning>
      </div>
    </DocsLayout>
  );
}