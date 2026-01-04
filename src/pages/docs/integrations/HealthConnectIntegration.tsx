import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";
import { Smartphone, Activity, Heart, Moon, Footprints, Watch, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HealthConnectIntegration() {
  return (
    <DocsLayout
      title="Health Connect Integration | FitConnect Guide"
      description="Connect Android Health Connect to sync fitness data from multiple wearables. Supports Fitbit, Garmin, Samsung, Huawei, and more."
      breadcrumbs={[
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Health Connect" },
      ]}
    >
      <section className="space-y-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold">Recommended for Android</h2>
            <p className="text-muted-foreground mt-1">
              Health Connect is the best way to sync your fitness data on Android. Connect any 
              wearable that writes to Health Connect and FitConnect will automatically sync your data.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Supported Wearables</h2>
        <p>
          Health Connect works as a central hub for fitness data on Android. Any wearable device 
          that syncs with Health Connect will automatically sync with FitConnect:
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {["Fitbit", "Garmin", "Samsung Galaxy Watch", "Huawei Watch", "Xiaomi Mi Band", 
            "Oura Ring", "WHOOP", "Withings", "Google Pixel Watch"].map((device) => (
            <span key={device} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium">
              {device}
            </span>
          ))}
        </div>

        <DocInfo>
          You don't need to connect each device separately to FitConnect. Just connect Health Connect 
          once, and all your wearable data flows through automatically.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Android Only</h2>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
          <Smartphone className="h-6 w-6 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium">Health Connect is Android's unified health data platform</p>
            <p className="text-sm text-muted-foreground mt-1">
              Requires Android 14 or later (or Android 9+ with Health Connect app installed). 
              iOS users should connect via <Link to="/docs/integrations/apple-health" className="text-primary hover:underline">Apple Health</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <p>
          Health Connect is Google's health data platform that acts as a central hub for all 
          your fitness and health data on Android:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Your wearable syncs to its app</strong> – Fitbit, Garmin, Samsung Health, etc.</li>
          <li><strong>The app writes to Health Connect</strong> – Most major fitness apps support this</li>
          <li><strong>FitConnect reads from Health Connect</strong> – We automatically sync your data</li>
          <li><strong>Your coach sees your progress</strong> – Steps, heart rate, sleep, and more</li>
        </ol>
        
        <DocTip>
          Check your wearable's app settings to ensure it's writing data to Health Connect. 
          Look for "Connected apps" or "Health Connect" in the settings menu.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Connecting Health Connect</h2>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open the FitConnect app on your Android device</li>
          <li>Go to <strong>Settings → Integrations</strong></li>
          <li>Tap <strong>Connect</strong> next to Health Connect</li>
          <li>Grant the requested permissions when prompted</li>
          <li>Your data will start syncing automatically</li>
        </ol>

        <DocInfo>
          Health Connect keeps your data on-device by default. FitConnect only accesses the 
          specific data types you grant permission for.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Types We Sync</h2>
        <p>FitConnect reads the following data from Health Connect:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Footprints className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Steps</h3>
              <p className="text-sm text-muted-foreground">
                Daily step count from your phone and connected wearables.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Heart className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Heart Rate</h3>
              <p className="text-sm text-muted-foreground">
                Resting and active heart rate from compatible devices.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Activity className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Calories & Activity</h3>
              <p className="text-sm text-muted-foreground">
                Active calories burned and workout sessions.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Moon className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Sleep</h3>
              <p className="text-sm text-muted-foreground">
                Sleep duration and sleep stages (when available).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Setting Up Your Wearable</h2>
        <p>
          To ensure your wearable data syncs with FitConnect, make sure your wearable's app 
          is connected to Health Connect:
        </p>
        
        <div className="space-y-4 mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              Fitbit
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open Fitbit app → Profile → App Settings → Health Connect → Enable all data types
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              Garmin
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open Garmin Connect → Settings → Health Connect → Connect and enable permissions
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              Samsung Health
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open Samsung Health → Menu → Settings → Connected Services → Health Connect
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <Watch className="h-5 w-5 text-primary" />
              Huawei Health
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open Huawei Health → Me → Settings → Data Sharing → Health Connect
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Privacy & Control</h2>
        <p>
          You have full control over what data FitConnect can access:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Granular permissions</strong> – Choose exactly which data types to share</li>
          <li><strong>On-device storage</strong> – Your data stays on your phone unless you share it</li>
          <li><strong>Revoke anytime</strong> – Disconnect from Settings → Integrations at any time</li>
          <li><strong>Coach access controls</strong> – Choose which coaches can see your health data</li>
        </ul>
        
        <DocWarning>
          If you disconnect Health Connect, your historical data will remain in FitConnect, 
          but no new data will sync until you reconnect.
        </DocWarning>
      </section>
    </DocsLayout>
  );
}
