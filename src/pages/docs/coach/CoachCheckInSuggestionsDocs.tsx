import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell, Users, Clock, Star, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export default function CoachCheckInSuggestionsDocs() {
  return (
    <DocsLayout
      title="Smart Check-in Suggestions"
      description="Get AI-powered suggestions for when and how to check in with your clients."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Check-in Suggestions" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to stay connected with clients without 
            missing important touchpoints. Smart suggestions help you prioritise who needs 
            attention and when.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  New Client Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Prompts to welcome new clients and ensure they're settling in well.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Session Follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reminders to follow up after sessions to check on recovery and questions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Milestone Celebrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Alerts when clients achieve milestones so you can congratulate them.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Inactivity Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notifications when clients go quiet so you can reach out proactively.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Personal touch is what separates great coaches from average ones. Smart suggestions help you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Never forget to check in with important touchpoints</li>
            <li>Prioritise your limited time effectively</li>
            <li>Build stronger relationships through consistent communication</li>
            <li>Catch disengagement early before it becomes churn</li>
            <li>Celebrate wins with clients to boost motivation</li>
          </ul>
        </section>

        {/* Suggestion Types */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Types of Suggestions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                New Client Welcome
              </h3>
              <p className="text-sm text-muted-foreground">
                Triggered 1-3 days after a client joins. Helps them feel supported and 
                addresses early questions or concerns.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Post-Session Follow-up
              </h3>
              <p className="text-sm text-muted-foreground">
                Triggered the day after a session. Check how they're feeling and if they 
                have any questions about the workout.
              </p>
            </div>

            <div className="bg-card/50 border border-amber-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Milestone Achievement
              </h3>
              <p className="text-sm text-muted-foreground">
                Triggered when clients earn badges, hit streaks, or reach goals. 
                Celebrate their success!
              </p>
            </div>

            <div className="bg-card/50 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                Inactivity Check-in
              </h3>
              <p className="text-sm text-muted-foreground">
                Triggered when 5+ days pass without messages or activity. Reach out to 
                see if everything is okay.
              </p>
            </div>
          </div>
        </section>

        {/* Priority Levels */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Priority Levels</h2>
          <p className="text-muted-foreground mb-4">
            Suggestions are prioritised to help you focus:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Urgent
              </h3>
              <p className="text-sm text-muted-foreground">
                Time-sensitive situations like new clients needing onboarding or clients 
                showing disengagement signs.
              </p>
            </div>

            <div className="bg-card/50 border border-amber-500/30 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                Suggested
              </h3>
              <p className="text-sm text-muted-foreground">
                Important but not urgent. Session follow-ups and milestone celebrations.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Routine
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular touchpoints that are good practice but not urgent.
              </p>
            </div>
          </div>
        </section>

        {/* Using Suggestions */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Acting on Suggestions</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Review Your Suggestions">
              Check the suggestions panel on your dashboard daily or when notifications arrive.
            </DocStep>

            <DocStep stepNumber={2} title="Use Message Templates">
              Each suggestion includes a pre-written message template you can use or customise.
            </DocStep>

            <DocStep stepNumber={3} title="Send or Dismiss">
              Click "Send" to open the message composer, or "Dismiss" if you've already 
              addressed the situation.
            </DocStep>

            <DocStep stepNumber={4} title="Mark as Complete">
              After reaching out, the suggestion is marked complete and logged for your records.
            </DocStep>
          </div>

          <DocTip className="mt-4">
            Personalise the templates with specific details. Mention their recent workout, 
            use their name, and reference their goals for maximum impact.
          </DocTip>
        </section>

        {/* Message Templates */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Templates
          </h2>
          <p className="text-muted-foreground mb-4">
            Each suggestion type comes with customisable templates:
          </p>
          <div className="space-y-3">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">New Client Welcome</h3>
              <p className="text-sm text-muted-foreground italic">
                "Hey [Name]! Just checking in to see how your first few days are going. 
                Any questions about your plan or the app? I'm here to help!"
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Session Follow-up</h3>
              <p className="text-sm text-muted-foreground italic">
                "How are you feeling after yesterday's session? Any soreness or questions 
                about the exercises?"
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Milestone Celebration</h3>
              <p className="text-sm text-muted-foreground italic">
                "Congratulations on [achievement]! That's a huge accomplishment. Keep up 
                the amazing work!"
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">Inactivity Check-in</h3>
              <p className="text-sm text-muted-foreground italic">
                "Hey [Name], I noticed it's been a few days since we connected. Everything 
                okay? Let me know if you need anything adjusted."
              </p>
            </div>
          </div>

          <DocInfo className="mt-4">
            You can customise default templates in Settings → Messages → Templates.
          </DocInfo>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I turn off certain suggestion types?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, in Settings → Notifications, you can enable or disable each suggestion type.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do suggestions auto-send messages?</h3>
              <p className="text-sm text-muted-foreground">
                No, suggestions are prompts for you to act on. You always review and send 
                messages manually.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What if I miss a suggestion?</h3>
              <p className="text-sm text-muted-foreground">
                Suggestions stay in your list until you dismiss them or they become irrelevant. 
                Overdue suggestions are highlighted.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I create custom suggestion triggers?</h3>
              <p className="text-sm text-muted-foreground">
                Not currently, but you can use scheduled check-ins (see Automations → Scheduled Check-ins) 
                for custom timing.
              </p>
            </div>
          </div>
        </section>

        <DocWarning>
          Suggestions are based on data patterns. Always use your judgement—you know your 
          clients better than any algorithm.
        </DocWarning>
      </div>
    </DocsLayout>
  );
}