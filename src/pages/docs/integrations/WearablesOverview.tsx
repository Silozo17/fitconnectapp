import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Watch, Smartphone, Activity, Heart, Footprints, Moon, Flame, Shield, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

export default function WearablesOverview() {
  return (
    <DocsLayout
      title="Wearables & Health Data"
      description="Connect your fitness devices to automatically track your activity, sleep, and health metrics."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations" },
        { label: "Wearables Overview" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect integrates with popular fitness wearables and health platforms to 
          automatically track your activity. This data helps you monitor progress and 
          gives your coaches insights into your daily activity levels.
        </p>
        <DocTip>
          You control what data coaches can see via your Data Privacy settings.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-500" />
          Supported Platforms
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect any of these platforms to sync your health data:
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">🍎 Apple Health</h4>
              <span className="text-xs bg-muted px-2 py-1 rounded">iOS Only</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Syncs data from Apple Watch and iPhone health sensors. Available exclusively 
              on iOS devices via the FitConnect native app.
              <RouterLink to="/docs/integrations/apple-health" className="text-primary hover:underline ml-1">
                Learn more →
              </RouterLink>
            </p>
            <p className="text-xs text-muted-foreground">
              Compatible devices: Apple Watch, iPhone (with health sensors)
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">🤖 Health Connect</h4>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Google's health data hub for Android. Aggregates data from various fitness 
              apps and wearables. Available via the FitConnect Android app.
              <RouterLink to="/docs/integrations/health-connect" className="text-primary hover:underline ml-1">
                Learn more →
              </RouterLink>
            </p>
            <p className="text-xs text-muted-foreground">
              Compatible devices: Samsung Galaxy Watch, Google Pixel Watch, most Android wearables
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">⌚ Fitbit</h4>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Any Platform</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Connect directly to your Fitbit account from any device (iOS, Android, or web). 
              <RouterLink to="/docs/integrations/fitbit" className="text-primary hover:underline ml-1">
                Learn more →
              </RouterLink>
            </p>
            <p className="text-xs text-muted-foreground">
              Compatible devices: All Fitbit trackers and smartwatches
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">🏃 Garmin</h4>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Direct Garmin Connect integration is in development. Stay tuned!
              <RouterLink to="/docs/integrations/garmin" className="text-primary hover:underline ml-1">
                Learn more →
              </RouterLink>
            </p>
            <p className="text-xs text-muted-foreground">
              Compatible devices: All Garmin wearables and fitness trackers
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Data Types
        </h2>
        <p className="text-muted-foreground mb-4">
          The following health metrics can be synced from your wearables:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Footprints className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Steps</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Heart Rate</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Calories</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Moon className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Sleep</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Activity className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Active Minutes</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50 text-center">
            <Watch className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
            <span className="text-sm font-medium">Weight</span>
          </div>
        </div>

        <DocInfo>
          Not all data types are available from all platforms. The specific metrics 
          depend on your device's capabilities and what data you've granted access to.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Privacy Controls
        </h2>
        <p className="text-muted-foreground mb-4">
          You're in control of your health data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Synced data is visible only to you by default</li>
          <li>Choose which coaches can see your health data</li>
          <li>Manage permissions per data type (e.g., share steps but not sleep)</li>
          <li>Access settings via <strong>Settings → Privacy → Data Privacy</strong></li>
        </ul>
        <RouterLink 
          to="/docs/client/data-privacy" 
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <Link className="h-4 w-4" />
          Learn more about Data Privacy controls
        </RouterLink>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">How Coaches Use This Data</h2>
        <p className="text-muted-foreground mb-4">
          When you share wearable data with your coaches, they can:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>View your daily activity levels and trends</li>
          <li>Understand your recovery through sleep data</li>
          <li>Track calorie expenditure for nutrition planning</li>
          <li>Monitor heart rate for intensity recommendations</li>
          <li>Include wearable data in progress reports</li>
        </ul>

        <DocTip>
          Sharing wearable data gives coaches a complete picture of your lifestyle, 
          helping them create more effective and personalised programs.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
