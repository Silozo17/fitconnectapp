import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  Watch, 
  Activity,
  Heart,
  Moon,
  Footprints,
  Flame,
  Scale,
  Link2,
  Unlink,
  RefreshCw,
  Shield
} from "lucide-react";

export default function ClientWearablesDocs() {
  return (
    <DocsLayout
      title="Wearable Device Integration"
      description="Connect your fitness tracker or smartwatch to automatically sync health data with FitConnect."
      breadcrumbs={[{ label: "For Clients", href: "/docs/client" }, { label: "Wearables" }]}
    >
      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground">
          Connect your wearable device to automatically sync health and fitness data with FitConnect. 
          This gives your coach visibility into your daily activity, sleep, and other health metrics 
          to help them personalise your program.
        </p>
      </section>

      {/* Supported Devices */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Supported Platforms</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Apple Health</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Syncs data from Apple Watch, iPhone, and any app that writes to Apple Health.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Google Fit</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Syncs data from Wear OS devices and Android phones with Google Fit.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Fitbit</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Direct integration with all Fitbit trackers and smartwatches.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Garmin</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Garmin watch or fitness device for comprehensive data sync.
            </p>
          </div>
        </div>
      </section>

      {/* Data Types */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Data Is Synced</h2>
        <p className="text-muted-foreground mb-4">
          Depending on your device and what you choose to share, the following data types can be synced:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Footprints className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Steps</h3>
              <p className="text-sm text-muted-foreground">Daily step count and distance walked.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Heart Rate</h3>
              <p className="text-sm text-muted-foreground">Resting and active heart rate data.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Moon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Sleep</h3>
              <p className="text-sm text-muted-foreground">Sleep duration and quality metrics.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Calories Burned</h3>
              <p className="text-sm text-muted-foreground">Active and total energy expenditure.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Activity className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Active Minutes</h3>
              <p className="text-sm text-muted-foreground">Time spent in moderate to vigorous activity.</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <Scale className="h-5 w-5 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Weight</h3>
              <p className="text-sm text-muted-foreground">Body weight from smart scales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Connect */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          How to Connect Your Device
        </h2>
        <DocStep stepNumber={1} title="Go to Integrations">
          Navigate to Settings → Integrations in your dashboard.
        </DocStep>
        <DocStep stepNumber={2} title="Choose Your Platform">
          Select your wearable platform (Apple Health, Google Fit, Fitbit, or Garmin).
        </DocStep>
        <DocStep stepNumber={3} title="Authorize Access">
          You'll be redirected to your wearable provider to authorize FitConnect. 
          Grant the requested permissions.
        </DocStep>
        <DocStep stepNumber={4} title="Select Data to Share">
          Choose which data types you want to sync. You can change this later.
        </DocStep>
        <DocStep stepNumber={5} title="Confirm Connection">
          Once connected, data will begin syncing automatically.
        </DocStep>

        <DocTip>
          Historical data (up to 30 days) is imported when you first connect. 
          After that, data syncs automatically throughout the day.
        </DocTip>
      </section>

      {/* Sync Frequency */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          How Often Data Syncs
        </h2>
        <p className="text-muted-foreground mb-4">
          Data is synced automatically:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Every few hours throughout the day</li>
          <li>When you open the FitConnect app</li>
          <li>When you manually trigger a sync (pull-to-refresh on mobile)</li>
        </ul>
        <DocInfo>
          Sync timing depends on your wearable platform. Some providers (like Fitbit) 
          update more frequently than others.
        </DocInfo>
      </section>

      {/* Privacy Controls */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Privacy & Sharing Controls
        </h2>
        <p className="text-muted-foreground mb-4">
          You have full control over what data is shared with your coach:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Choose What to Sync</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When connecting, you choose which data types to import. Skip any 
              data you prefer to keep private.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Control Coach Access</h3>
            <p className="text-sm text-muted-foreground mt-1">
              In Data Privacy settings, you can toggle which wearable data types 
              your coach can see, even after syncing.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Disconnect Anytime</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You can disconnect your wearable at any time. Already synced data 
              remains unless you request deletion.
            </p>
          </div>
        </div>

        <DocTip>
          Sharing wearable data helps your coach understand your overall activity 
          and recovery, leading to better program adjustments.
        </DocTip>
      </section>

      {/* Disconnecting */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Unlink className="h-5 w-5 text-red-500" />
          Disconnecting Your Device
        </h2>
        <DocStep stepNumber={1} title="Go to Integrations">
          Navigate to Settings → Integrations.
        </DocStep>
        <DocStep stepNumber={2} title="Find Connected Device">
          Locate the wearable platform you want to disconnect.
        </DocStep>
        <DocStep stepNumber={3} title="Click Disconnect">
          Confirm that you want to disconnect. New data will stop syncing.
        </DocStep>

        <DocWarning>
          Disconnecting stops future syncs but doesn't delete historical data. 
          To delete synced data, go to Settings → Privacy → Request Data Deletion.
        </DocWarning>
      </section>

      {/* Troubleshooting */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Data isn't syncing</h3>
            <p className="text-sm text-muted-foreground">
              Try disconnecting and reconnecting your device. Ensure you've granted 
              all necessary permissions in your wearable's app.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Steps or calories seem wrong</h3>
            <p className="text-sm text-muted-foreground">
              We display data exactly as provided by your wearable. Check your 
              device settings (height, weight, stride length) for accuracy.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Connection keeps expiring</h3>
            <p className="text-sm text-muted-foreground">
              Some providers require periodic reauthorization. Reconnect when 
              prompted to maintain the sync.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I connect multiple devices?</h3>
            <p className="text-sm text-muted-foreground">
              You can connect one platform per type (e.g., Apple Health OR Google Fit, 
              not both). If you use multiple devices, connect the one you use most.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Does syncing drain my battery?</h3>
            <p className="text-sm text-muted-foreground">
              No. FitConnect reads data from your platform's cloud service, not 
              directly from your device. Battery impact is minimal.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">My device isn't listed. Can I still connect?</h3>
            <p className="text-sm text-muted-foreground">
              If your device syncs to Apple Health, Google Fit, or another supported 
              platform, connect through that platform instead.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
