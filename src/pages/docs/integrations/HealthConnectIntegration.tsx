import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";
import { Smartphone, Activity, Heart, Moon, Footprints, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HealthConnectIntegration() {
  return (
    <DocsLayout
      title="Health Connect (Android)"
      description="Connect your Android device's Health Connect data to sync fitness metrics with FitConnect."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Health Connect" },
      ]}
    >
      <section className="space-y-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
          <Clock className="h-6 w-6 text-amber-500 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold">Coming Soon</h2>
            <p className="text-muted-foreground mt-1">
              Health Connect integration is currently in development. We're working on native 
              Android support and will announce availability soon.
            </p>
          </div>
        </div>
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
        <h2 className="text-2xl font-semibold">What is Health Connect?</h2>
        <p>
          Health Connect is Google's new health data platform for Android, replacing the older 
          Google Fit integration. It provides a centralised way for health and fitness apps to 
          share data securely on your device.
        </p>
        
        <DocInfo>
          Health Connect keeps your data on-device by default. Apps must request explicit 
          permission to read specific data types, giving you full control over what's shared.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Why Health Connect Replaces Google Fit</h2>
        <p>
          Google is deprecating the Google Fit APIs in favour of Health Connect. Key improvements include:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Privacy-first design</strong> – Data stays on your device unless you explicitly share it</li>
          <li><strong>Granular permissions</strong> – Control exactly which data types each app can access</li>
          <li><strong>Better interoperability</strong> – More apps supporting a unified standard</li>
          <li><strong>Richer data types</strong> – Support for nutrition, sleep stages, and more</li>
        </ul>
        
        <DocWarning>
          If you previously used Google Fit with FitConnect, you'll need to set up Health Connect 
          when the integration becomes available. Your historical data will remain accessible.
        </DocWarning>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Setting Up Health Connect</h2>
        <p>
          When the integration launches, you'll be able to connect by:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Ensuring Health Connect is installed (built into Android 14+, or download from Play Store)</li>
          <li>Opening FitConnect and navigating to Settings → Integrations → Health Connect</li>
          <li>Tapping "Connect" and granting the requested permissions</li>
          <li>Selecting which data types to share with FitConnect</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Planned Data Types</h2>
        <p>Once available, we plan to support the following data from Health Connect:</p>
        
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
        <h2 className="text-2xl font-semibold">Compatible Devices</h2>
        <p>
          Health Connect works with data from many fitness devices and apps, including:
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {["Samsung Galaxy Watch", "Google Pixel Watch", "Fitbit (newer models)", 
            "Oura Ring", "Whoop", "Garmin (select models)", "Withings", "Peloton"].map((device) => (
            <span key={device} className="px-3 py-1 bg-muted rounded-full text-sm">
              {device}
            </span>
          ))}
        </div>
        
        <DocTip>
          Check your wearable's app settings to ensure it's writing data to Health Connect. 
          Some apps require you to enable this manually.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">In the Meantime</h2>
        <p>
          While we work on Health Connect support, Android users can:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Use Fitbit integration</strong> – If you have a Fitbit device, 
            <Link to="/docs/integrations/fitbit" className="text-primary hover:underline ml-1">connect directly via Fitbit</Link>
          </li>
          <li>
            <strong>Manual logging</strong> – Enter your metrics directly in FitConnect
          </li>
          <li>
            <strong>Stay updated</strong> – We'll announce Health Connect availability via email and in-app notifications
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
