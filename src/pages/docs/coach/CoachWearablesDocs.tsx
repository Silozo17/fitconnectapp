import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Moon, Footprints, AlertTriangle, Clock, Shield, Users } from "lucide-react";

export default function CoachWearablesDocs() {
  return (
    <DocsLayout
      title="Client Wearable Data | FitConnect Coach Guide"
      description="View synced health metrics from your clients' connected devices. Monitor activity and recovery."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Wearable Dashboard" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to leverage wearable device data to better understand 
            their clients' activity, recovery, and overall health patterns. The wearable dashboard 
            aggregates data from clients who have connected devices like Apple Watch, Fitbit, Garmin, 
            or Google Fit.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-primary" />
                  Activity Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View daily steps, calories burned, and workout minutes across all connected clients.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Heart Rate Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor resting heart rate trends and heart rate variability for recovery insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4 text-primary" />
                  Sleep Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See sleep duration and quality data to understand recovery and programme rest days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  At-Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when clients show concerning patterns like reduced activity or poor sleep.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Wearable devices provide objective, continuous health data that goes beyond what clients 
            report in check-ins. The wearable dashboard helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Verify self-reported activity and identify discrepancies</li>
            <li>Catch early signs of overtraining or poor recovery</li>
            <li>Adjust training intensity based on real-time recovery data</li>
            <li>Identify clients who may be struggling before they tell you</li>
            <li>Make more data-driven decisions about programming</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How It Works</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Clients Connect Devices">
              Your clients connect their wearable devices (Apple Health, Fitbit, Garmin, Google Fit) 
              from their own dashboard settings.
            </DocStep>

            <DocStep stepNumber={2} title="Data Syncs Automatically">
              Once connected, wearable data syncs to FitConnect regularly. Clients control which 
              data types they share with you.
            </DocStep>

            <DocStep stepNumber={3} title="View Aggregated Dashboard">
              Access the wearable dashboard from your coach navigation to see all clients' data 
              in one place with filtering and search options.
            </DocStep>

            <DocStep stepNumber={4} title="Drill Down to Individual">
              Click on any client to see detailed metrics, trends, and historical data for deeper analysis.
            </DocStep>
          </div>
        </section>

        {/* Understanding the Dashboard */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Understanding the Dashboard</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Client Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                The main view shows all clients with connected devices. Each card displays their 
                name, last sync time, and key metrics like today's steps and last night's sleep.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Metric Types
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Depending on device and client permissions, you may see:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Steps and distance walked/run</li>
                <li>Active calories burned</li>
                <li>Resting heart rate and HRV</li>
                <li>Sleep duration and quality</li>
                <li>Workout sessions detected</li>
                <li>Weight (if tracked on device)</li>
              </ul>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                At-Risk Indicators
              </h3>
              <p className="text-sm text-muted-foreground">
                Clients showing concerning patterns are flagged with an alert indicator. This includes 
                sudden drops in activity, consistently poor sleep, or elevated resting heart rate.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Sync Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Each client shows when their data last synced. Grey indicators mean data is stale 
                (hasn't synced recently), which might need follow-up.
              </p>
            </div>
          </div>
        </section>

        {/* Using the Data */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Using Wearable Data Effectively</h2>
          <DocTip>
            Use wearable data as one input among many. It's best combined with self-reported 
            feedback, session performance, and your professional observation.
          </DocTip>

          <div className="mt-4 space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Recovery Programming</h3>
              <p className="text-sm text-muted-foreground">
                If a client's HRV is low or sleep quality is poor, consider reducing intensity or 
                suggesting a rest day. The data helps you programme proactively.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Accountability Conversations</h3>
              <p className="text-sm text-muted-foreground">
                When a client says they've been "very active" but steps are low, you can have a 
                supportive conversation based on objective data rather than assumptions.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Trend Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Look at weekly and monthly trends rather than single-day data. Patterns over time 
                are more meaningful than isolated readings.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data Sharing
          </h2>
          <DocInfo>
            Clients control which data types they share with you. Some clients may share only 
            steps while others share everything including heart rate and sleep.
          </DocInfo>
          <div className="mt-4 bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-muted-foreground">
              Important privacy considerations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Clients must explicitly connect their devices and grant permission</li>
              <li>They can revoke access at any time from their settings</li>
              <li>You only see data from clients who have chosen to share with you</li>
              <li>Data is used only for coaching purposes within the platform</li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Limitations & Notes</h2>
          <DocWarning>
            Wearable data has known accuracy limitations. Consumer devices can have margins of error 
            on metrics like calories and heart rate. Use data as directional guidance, not absolute truth.
          </DocWarning>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>Keep in mind:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Not all clients will have or want to connect wearable devices</li>
              <li>Data sync frequency depends on the device and client's phone</li>
              <li>Some devices provide more metrics than others</li>
              <li>Apple Health sync may sometimes be delayed (see Wearable Integration docs)</li>
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Why don't I see data for some clients?</h3>
              <p className="text-sm text-muted-foreground">
                Clients only appear if they have connected a wearable device and chosen to share 
                data with you. Some clients may not have wearable devices.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How often does data sync?</h3>
              <p className="text-sm text-muted-foreground">
                Data syncs periodically throughout the day, typically every few hours. Clients can 
                also manually sync from their wearable settings.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I see historical data?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, clicking on a client shows their historical trends and you can filter by date 
                range to see patterns over weeks or months.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">What devices are supported?</h3>
              <p className="text-sm text-muted-foreground">
                FitConnect supports Apple Health (iPhone/Apple Watch), Google Fit/Health Connect 
                (Android), Fitbit, and Garmin devices.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
