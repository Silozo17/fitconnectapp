import { useTranslation } from "react-i18next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Moon, Heart, Activity, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

const breadcrumbs = [
  { label: "Client Guide", href: "/docs/client" },
  { label: "Readiness Score" },
];

export default function ClientReadinessDocs() {
  const { t } = useTranslation("docs");

  return (
    <DocsLayout
      title="Check Your Readiness Score | FitConnect Client Guide"
      description="View your daily readiness score based on sleep, recovery and activity data from your wearables."
      breadcrumbs={breadcrumbs}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">What is Readiness Score?</h2>
        <p className="text-muted-foreground">
          Your readiness score is a daily indicator that shows how prepared your body is for 
          physical activity. It combines data from your sleep, recovery metrics, and recent 
          activity levels to give you a score from 0-100.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Understanding Your Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="font-semibold text-green-600 dark:text-green-400">Optimal (80-100)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  You're well-rested and recovered. Great day for high-intensity training or challenging workouts.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="font-semibold text-blue-600 dark:text-blue-400">Good (60-79)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  You're adequately recovered. Proceed with planned training at moderate intensity.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="font-semibold text-amber-600 dark:text-amber-400">Moderate (40-59)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Consider lighter activity today. Focus on technique work or active recovery.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="font-semibold text-red-600 dark:text-red-400">Low (0-39)</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your body needs rest. Prioritise sleep, nutrition, and gentle movement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Component Scores</h2>
        <p className="text-muted-foreground">
          Your overall readiness is calculated from three key components, each contributing 
          to your total score.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5 text-indigo-500" />
                Sleep Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Measures sleep duration and quality from your connected wearable. Aims for 
                7-9 hours of quality sleep.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>• Total sleep duration</li>
                <li>• Sleep consistency</li>
                <li>• Comparison to your baseline</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-rose-500" />
                Recovery Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Based on your resting heart rate compared to your personal baseline. Lower 
                is generally better.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>• Resting heart rate</li>
                <li>• Heart rate variability</li>
                <li>• Deviation from baseline</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-emerald-500" />
                Activity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Evaluates your recent activity load to determine if you're maintaining 
                balance or overtraining.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>• Recent workout intensity</li>
                <li>• Active minutes logged</li>
                <li>• Recovery time since last session</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">How to Use Your Readiness Score</h2>

        <DocStep stepNumber={1} title="Check Your Score Daily">
          View your readiness score on your dashboard each morning. It updates automatically 
          when your wearable syncs overnight data.
        </DocStep>

        <DocStep stepNumber={2} title="Read the Recommendation">
          Each score comes with a personalised recommendation based on your current state. 
          These suggestions help you make informed decisions about your training.
        </DocStep>

        <DocStep stepNumber={3} title="Adjust Your Training">
          Use your readiness to guide workout intensity. On low readiness days, consider 
          swapping a hard session for mobility work or rest.
        </DocStep>

        <DocStep stepNumber={4} title="Track Patterns Over Time">
          Monitor how your readiness changes over weeks. Consistent low scores may indicate 
          overtraining or lifestyle factors that need attention.
        </DocStep>

        <DocTip>
          Share your readiness data with your coach! They can see your scores and adjust 
          your programme accordingly, helping you train smarter and recover better.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Improving Your Readiness</h2>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <Moon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Prioritise Sleep</div>
                  <p className="text-sm text-muted-foreground">
                    Aim for 7-9 hours of quality sleep. Keep a consistent sleep schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Balance Training Load</div>
                  <p className="text-sm text-muted-foreground">
                    Alternate hard and easy days. Include rest days in your schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Manage Stress</div>
                  <p className="text-sm text-muted-foreground">
                    High stress impacts recovery. Consider meditation or relaxation techniques.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Stay Hydrated & Nourished</div>
                  <p className="text-sm text-muted-foreground">
                    Proper nutrition and hydration support faster recovery.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocInfo>
          Readiness scores require a connected wearable device. Connect your Apple Watch, 
          Fitbit, Garmin, or other compatible device in the Integrations section.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
