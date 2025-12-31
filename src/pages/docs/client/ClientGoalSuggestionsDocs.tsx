import { useTranslation } from "react-i18next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Sparkles, TrendingUp, CheckCircle2, XCircle, RefreshCw, Brain } from "lucide-react";

const breadcrumbs = [
  { label: "Docs", href: "/docs" },
  { label: "For Clients", href: "/docs/client" },
  { label: "Goal Suggestions" },
];

export default function ClientGoalSuggestionsDocs() {
  const { t } = useTranslation("docs");

  return (
    <DocsLayout
      title="Adaptive Goal Suggestions"
      description="AI-powered goal recommendations that evolve with your progress."
      breadcrumbs={breadcrumbs}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">What are Adaptive Goal Suggestions?</h2>
        <p className="text-muted-foreground">
          Adaptive goal suggestions use AI to analyse your progress, habits, and performance 
          data to recommend personalised goals. These suggestions evolve as you improve, 
          ensuring your targets remain challenging yet achievable.
        </p>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Powered by AI</h3>
                <p className="text-muted-foreground mt-1">
                  The AI analyses patterns in your workout completion, habit streaks, 
                  wearable data, and progress metrics to suggest goals tailored 
                  specifically to your current fitness level and trajectory.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">How Goal Suggestions Work</h2>

        <DocStep stepNumber={1} title="Data Analysis">
          The AI continuously monitors your activity patterns, completed workouts, habit 
          compliance, and any connected wearable data to understand your current capabilities.
        </DocStep>

        <DocStep stepNumber={2} title="Pattern Recognition">
          It identifies trends like improving strength, increasing endurance, or areas where 
          you might be plateauing. This informs what type of goal would be most beneficial.
        </DocStep>

        <DocStep stepNumber={3} title="Personalised Recommendations">
          Based on the analysis, the AI generates goal suggestions with realistic targets, 
          timeframes, and actionable steps to achieve them.
        </DocStep>

        <DocStep stepNumber={4} title="Continuous Adaptation">
          As you make progress (or face setbacks), the AI adjusts future suggestions. 
          Goals that were too easy get harder; ones that were too ambitious get recalibrated.
        </DocStep>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Types of Goal Suggestions</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-blue-500" />
                Performance Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Targets based on workout performance metrics.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "Increase your bench press by 5kg in 4 weeks"</li>
                <li>• "Run 5km under 25 minutes"</li>
                <li>• "Complete 10 pull-ups unassisted"</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Consistency Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Focus on building sustainable habits.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "Complete 4 workouts per week for a month"</li>
                <li>• "Log meals for 21 consecutive days"</li>
                <li>• "Hit your step goal 5 days this week"</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Wellness Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Holistic health improvements beyond exercise.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "Average 7+ hours of sleep this week"</li>
                <li>• "Reduce resting heart rate by 5 bpm"</li>
                <li>• "Complete all habit check-ins for 2 weeks"</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4 text-orange-500" />
                Recovery Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Suggested when rest is needed.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• "Take 2 active recovery days this week"</li>
                <li>• "Complete 3 stretching sessions"</li>
                <li>• "Achieve optimal readiness score 3 times"</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Managing Your Suggestions</h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Accept a Goal</div>
                <p className="text-sm text-muted-foreground">
                  Tap "Accept" to add the suggested goal to your active goals. It will 
                  appear on your dashboard and you can track progress towards it.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Dismiss a Suggestion</div>
                <p className="text-sm text-muted-foreground">
                  Not interested in a particular goal? Dismiss it and the AI will learn 
                  from your preference to provide better suggestions in the future.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Request New Suggestions</div>
                <p className="text-sm text-muted-foreground">
                  Want different options? Refresh to get a new set of AI-generated 
                  goal suggestions based on your latest data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocTip>
          The more goals you accept or dismiss, the better the AI understands your 
          preferences. Don't hesitate to dismiss goals that don't align with your interests!
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Coach Collaboration</h2>
        
        <p className="text-muted-foreground">
          While AI suggestions are helpful, your coach plays a crucial role in your goal-setting 
          journey. Here's how they work together:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Coach-Set Goals</h3>
              <p className="text-sm text-muted-foreground">
                Your coach can set specific goals based on their professional assessment. 
                These appear alongside AI suggestions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">AI-Assisted Coaching</h3>
              <p className="text-sm text-muted-foreground">
                Coaches can see AI suggestions for you and approve or modify them before 
                they become your official goals.
              </p>
            </CardContent>
          </Card>
        </div>

        <DocWarning>
          AI suggestions are recommendations, not requirements. Always discuss major goals 
          with your coach, especially if you have health conditions or injuries.
        </DocWarning>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Getting Better Suggestions</h2>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Log Your Workouts</div>
                  <p className="text-sm text-muted-foreground">
                    Detailed workout logs help the AI understand your current performance.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Complete Habits</div>
                  <p className="text-sm text-muted-foreground">
                    Habit data shows the AI what routines you can maintain consistently.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Update Progress</div>
                  <p className="text-sm text-muted-foreground">
                    Regular progress updates help calibrate goal difficulty.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Connect Wearables</div>
                  <p className="text-sm text-muted-foreground">
                    Automatic data from wearables provides richer insights for the AI.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocInfo>
          Goal suggestions require some initial data to generate meaningful recommendations. 
          Use the platform for at least a week before expecting personalised suggestions.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
