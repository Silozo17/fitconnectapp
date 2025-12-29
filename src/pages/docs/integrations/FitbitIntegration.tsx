import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Activity, Link2, RefreshCw, Heart, Footprints, Moon, Flame, Trash2, Shield } from "lucide-react";

export default function FitbitIntegration() {
  return (
    <DocsLayout
      title="Fitbit Integration"
      description="Connect your Fitbit device to automatically sync fitness and health data with FitConnect."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations" },
        { label: "Fitbit" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Connect your Fitbit account to automatically sync your fitness data with FitConnect. 
          Your steps, heart rate, calories burned, sleep data, and activity minutes are 
          imported to help you and your coaches track your progress.
        </p>
        <DocTip>
          Fitbit works on any platform (iOS, Android, or web) — unlike Apple Health or 
          Health Connect which are platform-specific.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-500" />
          How to Connect
        </h2>
        <p className="text-muted-foreground mb-4">
          Link your Fitbit account in just a few clicks.
        </p>

        <DocStep stepNumber={1} title="Open Integrations">
          Navigate to <strong>Settings → Integrations</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Find Fitbit">
          Locate the Fitbit card in the Wearables section.
        </DocStep>

        <DocStep stepNumber={3} title="Click Connect">
          Click the <strong>Connect</strong> button. You'll be redirected to Fitbit's 
          authorization page.
        </DocStep>

        <DocStep stepNumber={4} title="Sign In to Fitbit">
          Sign in with your Fitbit account credentials.
        </DocStep>

        <DocStep stepNumber={5} title="Grant Permissions">
          Review the data FitConnect is requesting and click <strong>Allow</strong>.
        </DocStep>

        <DocStep stepNumber={6} title="Confirm Connection">
          You'll be redirected back to FitConnect. Your Fitbit should now show as "Connected".
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Data That Syncs</h2>
        <p className="text-muted-foreground mb-4">
          The following data is automatically imported from your Fitbit:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Footprints className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Steps</span>
            </div>
            <p className="text-xs text-muted-foreground">Daily step count</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">Heart Rate</span>
            </div>
            <p className="text-xs text-muted-foreground">Resting and average HR</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">Calories Burned</span>
            </div>
            <p className="text-xs text-muted-foreground">Total daily expenditure</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">Sleep</span>
            </div>
            <p className="text-xs text-muted-foreground">Duration and quality</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Active Minutes</span>
            </div>
            <p className="text-xs text-muted-foreground">Time spent in activity zones</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-green-500" />
          Sync Frequency
        </h2>
        <p className="text-muted-foreground mb-4">
          Your Fitbit data syncs automatically:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Automatic:</strong> Data syncs periodically throughout the day</li>
          <li><strong>On App Open:</strong> Latest data is fetched when you open FitConnect</li>
          <li><strong>Manual Refresh:</strong> Pull down on wearable data screens to force a sync</li>
        </ul>

        <DocInfo>
          There may be a delay of up to a few hours for Fitbit data to appear in FitConnect. 
          This depends on how often your Fitbit device syncs with the Fitbit app.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Coach Access & Privacy
        </h2>
        <p className="text-muted-foreground mb-4">
          Control who sees your Fitbit data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Your Fitbit data counts as "Health Data" in privacy settings</li>
          <li>Manage access per coach in <strong>Settings → Privacy → Data Privacy</strong></li>
          <li>You can share some health metrics but not others</li>
          <li>If access is revoked, coaches see "No access" for wearable data</li>
        </ul>

        <DocTip>
          Sharing your Fitbit data helps coaches understand your overall activity levels 
          and adjust your training program accordingly.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" />
          Disconnecting
        </h2>
        <p className="text-muted-foreground mb-4">
          To remove the Fitbit connection:
        </p>

        <DocStep stepNumber={1} title="Disconnect in FitConnect">
          Go to <strong>Settings → Integrations</strong> and click <strong>Disconnect</strong> 
          next to Fitbit.
        </DocStep>

        <DocStep stepNumber={2} title="Revoke in Fitbit (Optional)">
          For extra security, go to your Fitbit app → Settings → Connected Applications 
          and revoke FitConnect's access.
        </DocStep>

        <DocTip>
          Disconnecting stops future data syncing but doesn't delete previously synced data 
          from FitConnect.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
