import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Watch, Activity, Heart, Moon, Footprints, Clock, Route, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function GarminIntegration() {
  return (
    <DocsLayout
      title="Garmin Integration"
      description="Connect your Garmin device to sync workouts, heart rate, sleep, and more with FitConnect."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Garmin" },
      ]}
    >
      <section className="space-y-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
          <Clock className="h-6 w-6 text-amber-500 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold">Coming Soon</h2>
            <p className="text-muted-foreground mt-1">
              Garmin integration is currently awaiting developer account approval from Garmin. 
              We'll announce availability as soon as the integration is ready.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">About Garmin Integration</h2>
        <p>
          Garmin is one of the most popular wearable ecosystems for serious athletes and fitness 
          enthusiasts. Our upcoming integration will allow you to sync data from any Garmin 
          device directly to FitConnect.
        </p>
        
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30 mt-4">
          <Watch className="h-6 w-6 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Works with all Garmin devices</p>
            <p className="text-sm text-muted-foreground mt-1">
              From entry-level fitness trackers to advanced multisport watches – any Garmin 
              device that syncs to Garmin Connect will work with FitConnect.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Supported Devices</h2>
        <p>When available, the integration will support all Garmin Connect-compatible devices, including:</p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Fitness & Running</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Forerunner series</li>
              <li>Venu series</li>
              <li>vívoactive series</li>
              <li>vívosmart series</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Multisport</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Fenix series</li>
              <li>Enduro series</li>
              <li>epix series</li>
              <li>Instinct series</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Cycling & Other</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Edge cycling computers</li>
              <li>Descent dive computers</li>
              <li>Approach golf watches</li>
              <li>Lily & Vivomove</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Planned Data Types</h2>
        <p>Once available, we plan to sync the following data from your Garmin account:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Footprints className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Steps & Distance</h3>
              <p className="text-sm text-muted-foreground">
                Daily step count, total distance walked/run, floors climbed.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Heart className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Heart Rate</h3>
              <p className="text-sm text-muted-foreground">
                24/7 heart rate, resting HR, HR zones during activities.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Activity className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Workouts & Activities</h3>
              <p className="text-sm text-muted-foreground">
                All recorded activities including runs, cycles, swims, strength sessions.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Moon className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Sleep</h3>
              <p className="text-sm text-muted-foreground">
                Sleep duration, sleep stages, sleep score, SpO2 during sleep.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Body Battery & Stress</h3>
              <p className="text-sm text-muted-foreground">
                Energy levels throughout the day and stress tracking data.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Route className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Training Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Training load, VO2 max estimates, recovery time, training status.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Will Work</h2>
        <p>
          The Garmin integration will use OAuth to securely connect your Garmin Connect account:
        </p>
        
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to Settings → Integrations → Garmin in FitConnect</li>
          <li>Click "Connect Garmin" to open the Garmin authorization page</li>
          <li>Log in to your Garmin account and approve the connection</li>
          <li>Data will sync automatically going forward</li>
        </ol>
        
        <DocInfo>
          Historical data sync will be available for a limited period (typically 30-90 days). 
          Future data syncs automatically as your Garmin uploads to Garmin Connect.
        </DocInfo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sync Frequency</h2>
        <p>
          Once connected, data will sync automatically:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Near real-time</strong> – Activities sync shortly after upload to Garmin Connect</li>
          <li><strong>Daily summary</strong> – Steps, sleep, and daily metrics sync once per day</li>
          <li><strong>On-demand</strong> – Manual sync available for immediate updates</li>
        </ul>
        
        <DocTip>
          Make sure your Garmin device regularly syncs to the Garmin Connect app. FitConnect 
          pulls data from Garmin Connect, not directly from your watch.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">In the Meantime</h2>
        <p>
          While we await Garmin developer approval, you can still track your progress:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Use Apple Health or Health Connect</strong> – If your Garmin syncs to Apple Health 
            (iOS) or Health Connect (Android), connect those integrations instead
          </li>
          <li>
            <strong>Manual logging</strong> – Enter your workout data directly in FitConnect
          </li>
          <li>
            <strong>Stay updated</strong> – We'll notify you when Garmin integration goes live
          </li>
        </ul>
        
        <p className="text-sm text-muted-foreground mt-4">
          Questions? <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link> for 
          updates on Garmin availability.
        </p>
      </section>
    </DocsLayout>
  );
}
