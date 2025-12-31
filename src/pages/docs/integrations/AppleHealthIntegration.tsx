import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocStep, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Apple, Smartphone, Activity, Heart, Moon, Footprints, ShieldCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function AppleHealthIntegration() {
  return (
    <DocsLayout
      title="Apple Health Integration"
      description="Connect your iPhone's Apple Health data to sync steps, heart rate, sleep, and more with FitConnect."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Apple Health" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">iOS Only</h2>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
          <Apple className="h-6 w-6 text-foreground mt-0.5" />
          <div>
            <p className="font-medium">Apple Health is available exclusively on iOS devices</p>
            <p className="text-sm text-muted-foreground mt-1">
              You'll need an iPhone running iOS 14 or later to connect Apple Health. Android users 
              can connect via <Link to="/docs/integrations/health-connect" className="text-primary hover:underline">Health Connect</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Connecting Apple Health</h2>
        
        <DocStep stepNumber={1} title="Open FitConnect on your iPhone">
          Make sure you're using the FitConnect app on your iPhone, not a web browser.
        </DocStep>
        
        <DocStep stepNumber={2} title="Go to Settings">
          Tap your profile icon, then navigate to <strong>Settings → Integrations → Apple Health</strong>.
        </DocStep>
        
        <DocStep stepNumber={3} title="Tap Connect">
          Press the <strong>Connect Apple Health</strong> button. This will open the iOS Health 
          permissions screen.
        </DocStep>
        
        <DocStep stepNumber={4} title="Grant Permissions">
          Select which data types you want to share with FitConnect. We recommend enabling all 
          available options for the best experience.
        </DocStep>
        
        <DocStep stepNumber={5} title="Confirm Connection">
          Return to FitConnect. You should see a "Connected" status and your most recent data 
          will begin syncing.
        </DocStep>
        
        <DocWarning>
          If you don't see the permission prompt, check that Health is enabled in your iPhone's 
          Privacy settings under Settings → Privacy & Security → Health.
        </DocWarning>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Types Synced</h2>
        <p>The following data is imported from Apple Health when permissions are granted:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Footprints className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Steps</h3>
              <p className="text-sm text-muted-foreground">
                Daily step count from your iPhone and connected devices (Apple Watch, etc.)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Heart className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Heart Rate</h3>
              <p className="text-sm text-muted-foreground">
                Resting heart rate, average heart rate, and heart rate during workouts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Activity className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Calories Burned</h3>
              <p className="text-sm text-muted-foreground">
                Active energy and resting energy expenditure tracked by Apple Watch.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Moon className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Sleep</h3>
              <p className="text-sm text-muted-foreground">
                Sleep duration and sleep stages (if tracked by Apple Watch or third-party app).
              </p>
            </div>
          </div>
        </div>
        
        <DocInfo>
          Additional data types like workout sessions, weight, and body measurements can also 
          sync if you track them in Apple Health.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Permission Requirements</h2>
        <p>FitConnect requires the following Health permissions:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Read access</strong> – To import your health data into FitConnect</li>
          <li><strong>Background refresh</strong> – To sync data automatically (optional)</li>
        </ul>
        
        <p className="text-muted-foreground">
          We never request write access to your Health data. FitConnect only reads data you 
          explicitly share.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Manual Sync</h2>
        <p>
          To ensure you have the latest data, you can trigger a manual sync:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to <strong>Settings → Integrations → Apple Health</strong></li>
          <li>Tap the <strong>Sync Now</strong> button</li>
          <li>Wait for the sync to complete (usually a few seconds)</li>
        </ol>
        
        <DocTip>
          If you've just completed a workout or recorded new data, wait a minute or two before 
          syncing to ensure Apple Health has processed the latest information.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Connection fails or permissions don't appear</h3>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
              <li>Make sure you're using the FitConnect app on iPhone, not Safari</li>
              <li>Check that Apple Health is enabled: Settings → Privacy → Health</li>
              <li>Restart the FitConnect app and try again</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Data not syncing</h3>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
              <li>Verify permissions are still granted in Health app settings</li>
              <li>Check that your iPhone has recorded data in Apple Health</li>
              <li>Try a manual sync from the Integrations page</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Sync completed but no data showing</h3>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
              <li>Apple Health may not have recorded data yet today</li>
              <li>Some data types require an Apple Watch or compatible device</li>
              <li>Check the date range you're viewing in FitConnect</li>
            </ul>
          </div>
        </div>
        
        <DocWarning>
          Due to iOS limitations, background sync may not always run immediately. For the most 
          accurate data, use manual sync before reviewing your statistics.
        </DocWarning>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Privacy Considerations</h2>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-green-500/5 border-green-500/30">
          <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium">Your health data stays private</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>Data is encrypted in transit and at rest</li>
              <li>Only you and your coach can see your synced data</li>
              <li>You can revoke access at any time from iOS Health settings</li>
              <li>Disconnecting removes the link but your historical data remains in FitConnect</li>
            </ul>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          See our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for 
          full details on how we handle your health data.
        </p>
      </section>
    </DocsLayout>
  );
}
