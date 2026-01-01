import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Shield, Eye, EyeOff, Users, Camera, Utensils, Dumbbell, Heart, Activity, Moon, Footprints, Flame } from "lucide-react";

export default function ClientDataPrivacyDocs() {
  return (
    <DocsLayout
      title="Control Your Data | FitConnect Privacy Guide"
      description="Manage what coaches can see, control sharing permissions and understand your privacy rights on FitConnect."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Data Privacy" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          You are in control of your data. FitConnect allows you to decide exactly what information 
          each of your coaches can see. This includes progress photos, meal logs, training logs, 
          and health data from connected wearables.
        </p>
        <DocTip>
          Sharing more data helps your coaches provide better, more personalised guidance. 
          However, you can always choose to keep certain data private.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Accessing Privacy Settings
        </h2>
        <p className="text-muted-foreground mb-4">
          Manage your data sharing preferences from one central location.
        </p>

        <DocStep stepNumber={1} title="Open Settings">
          Go to your <strong>Dashboard → Settings</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Navigate to Privacy Tab">
          Select the <strong>Privacy</strong> tab from the settings menu.
        </DocStep>

        <DocStep stepNumber={3} title="Select Data Privacy">
          You'll see a list of all your connected coaches with their current access levels.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Data Types Explained</h2>
        
        <h3 className="text-lg font-medium mb-3 mt-6">Client Data</h3>
        <p className="text-muted-foreground mb-4">
          Data you manually create within the app:
        </p>
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Progress Photos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Photos you upload to track your physical transformation. Includes front, side, and back views.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="h-4 w-4 text-green-500" />
              <span className="font-medium">Meal Logs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your food diary entries including what you eat, calories, and macronutrients.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Training Logs</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Workouts you log manually, including exercises, sets, reps, and weights.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-3">Health Data (Wearables)</h3>
        <p className="text-muted-foreground mb-4">
          Data synced from connected fitness devices:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Steps</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Heart Rate</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Calories Burned</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Sleep</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active Minutes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-green-500" />
          Managing Per-Coach Access
        </h2>
        <p className="text-muted-foreground mb-4">
          Set different permissions for each of your coaches.
        </p>

        <DocStep stepNumber={1} title="Select a Coach">
          In the Data Privacy section, find the coach whose permissions you want to change.
        </DocStep>

        <DocStep stepNumber={2} title="Expand Settings">
          Click on the coach card to expand their individual data type settings.
        </DocStep>

        <DocStep stepNumber={3} title="Toggle Access">
          Use the switches to enable or disable access for each data type.
        </DocStep>

        <div className="space-y-3 my-6">
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-400">Full Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Coach can see all your data types. Quick action: "Share All"
            </p>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-amber-400">Limited Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Coach can only see some data types that you've enabled.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-2 mb-1">
              <EyeOff className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-400">No Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Coach cannot see any of your data. Quick action: "Revoke All"
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <p className="text-muted-foreground mb-4">
          Use quick actions to manage all permissions at once:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Share All:</strong> Grants access to all data types for that coach</li>
          <li><strong>Revoke All:</strong> Removes access to all data types for that coach</li>
        </ul>
        <DocInfo>
          Changes take effect immediately. Coaches will see or lose access to your data right away.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What Coaches See</h2>
        <p className="text-muted-foreground mb-4">
          Understanding how your privacy settings affect coach visibility:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">When Access is Granted</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Coaches see your data in their client management dashboard</li>
              <li>They can use this data to create better plans for you</li>
              <li>AI analysis tools can include this data in reports</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">When Access is Revoked</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Coaches see a "No access" message for that data type</li>
              <li>Previously viewed data is no longer visible</li>
              <li>They cannot include this data in reports or analysis</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Privacy Tips</h2>
        <DocTip>
          Start by sharing all data with coaches you trust fully. You can always adjust later.
        </DocTip>
        <DocWarning>
          Limiting data access may affect the quality of coaching you receive. Coaches make 
          better recommendations when they have a complete picture of your progress.
        </DocWarning>
      </section>
    </DocsLayout>
  );
}
