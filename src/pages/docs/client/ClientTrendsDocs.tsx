import { useTranslation } from "react-i18next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Footprints, Timer, Moon, Flame, Heart, BarChart3 } from "lucide-react";

const breadcrumbs = [
  { label: "Docs", href: "/docs" },
  { label: "For Clients", href: "/docs/client" },
  { label: "Wearable Trends" },
];

export default function ClientTrendsDocs() {
  const { t } = useTranslation("docs");

  return (
    <DocsLayout
      title="Wearable Trends"
      description="Track week-over-week changes in your health metrics from connected devices."
      breadcrumbs={breadcrumbs}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Understanding Wearable Trends</h2>
        <p className="text-muted-foreground">
          Wearable trends show you how your key health metrics are changing over time. 
          By comparing this week's averages to last week's, you can see whether you're 
          improving, maintaining, or need to adjust your routine.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Week-Over-Week Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The trends widget compares your 7-day rolling average against the previous 
              7 days. This smooths out daily fluctuations and reveals genuine patterns 
              in your health and activity data.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Metrics Tracked</h2>
        <p className="text-muted-foreground">
          The following metrics are automatically tracked when you have a connected wearable device.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Footprints className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold">Steps</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Daily step count averaged over the week. Higher is generally better for 
                overall activity levels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Timer className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold">Active Minutes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Minutes spent in moderate to vigorous activity. Aim for 150+ minutes 
                per week for health benefits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Moon className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className="font-semibold">Sleep</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Average hours of sleep per night. Most adults need 7-9 hours for 
                optimal recovery.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold">Calories Burned</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Total daily energy expenditure including basal metabolic rate and 
                activity calories.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <h3 className="font-semibold">Avg Heart Rate</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Average resting heart rate. A lower resting HR often indicates 
                better cardiovascular fitness.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Reading Trend Indicators</h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium text-emerald-600 dark:text-emerald-400">Trending Up</div>
                <p className="text-sm text-muted-foreground">
                  This week's average is higher than last week. Green colour indicates 
                  this is a positive change for this metric.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              <div>
                <div className="font-medium text-amber-600 dark:text-amber-400">Trending Down</div>
                <p className="text-sm text-muted-foreground">
                  This week's average is lower than last week. Amber colour indicates 
                  this change may need attention.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
              <Minus className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">Stable</div>
                <p className="text-sm text-muted-foreground">
                  Less than 3% change between weeks. Your metric is holding steady.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocTip>
          Some metrics like heart rate are better when they go down. The colour coding 
          automatically adjusts based on what's healthy for each specific metric.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Using Trends Effectively</h2>

        <DocStep stepNumber={1} title="Check Weekly">
          Review your trends at least once a week. Daily fluctuations are normal—it's 
          the weekly patterns that matter most.
        </DocStep>

        <DocStep stepNumber={2} title="Identify Patterns">
          Notice which metrics tend to move together. Low sleep often correlates with 
          fewer steps and higher heart rate the next day.
        </DocStep>

        <DocStep stepNumber={3} title="Share with Your Coach">
          Your coach can see your trends and may adjust your programme based on the data. 
          This enables more personalised coaching.
        </DocStep>

        <DocStep stepNumber={4} title="Set Improvement Goals">
          Use trends to set realistic improvement targets. Aim for gradual improvements 
          rather than dramatic changes.
        </DocStep>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Interpreting Your Data</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">
                Positive Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Steps increasing week over week</li>
                <li>• Sleep duration improving or stable</li>
                <li>• Resting heart rate trending down</li>
                <li>• Active minutes increasing</li>
                <li>• Consistent patterns across metrics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-600 dark:text-amber-400">
                Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multiple metrics declining together</li>
                <li>• Sleep consistently below 6 hours</li>
                <li>• Resting heart rate elevated for weeks</li>
                <li>• Sharp drops in activity levels</li>
                <li>• Erratic patterns week to week</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DocInfo>
          Trends require at least 2 weeks of data to generate meaningful comparisons. 
          Keep your wearable connected and synced for the most accurate insights.
        </DocInfo>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-foreground">Troubleshooting</h2>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-1">No trends showing?</h3>
              <p className="text-sm text-muted-foreground">
                Ensure your wearable is connected in the Integrations section and has 
                synced data for at least 14 days.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Data seems inaccurate?</h3>
              <p className="text-sm text-muted-foreground">
                Check that your wearable is worn correctly and charged. Try a manual 
                sync from your device's companion app.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Missing specific metrics?</h3>
              <p className="text-sm text-muted-foreground">
                Not all wearables track all metrics. The trends widget only shows 
                data types your device supports.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </DocsLayout>
  );
}
