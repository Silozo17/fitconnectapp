import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning } from "@/components/docs/DocComponents";
import { Heart, TrendingUp, Calendar, Download, Shield, Activity } from "lucide-react";

export default function ClientHealthHistoryDocs() {
  return (
    <DocsLayout
      title="Health History | Client Guide"
      description="Track and review your health data over time. Understand trends in your weight, measurements, vitals, and overall wellness journey."
      breadcrumbs={[{ label: "Client Guide", href: "/docs/client" }, { label: "Health History" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Understanding Your Health Data
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect maintains a comprehensive history of your health metrics, allowing you to track progress 
          and identify trends over time. This data helps both you and your coaches make informed decisions 
          about your fitness journey.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Body Measurements</h3>
            <p className="text-sm text-muted-foreground">Weight, body fat percentage, muscle mass, and circumference measurements.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Vital Signs</h3>
            <p className="text-sm text-muted-foreground">Resting heart rate, blood pressure, and other health indicators.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Activity Data</h3>
            <p className="text-sm text-muted-foreground">Steps, calories burned, active minutes from connected wearables.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Sleep & Recovery</h3>
            <p className="text-sm text-muted-foreground">Sleep duration, quality scores, and recovery metrics.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Viewing Trends & Progress
        </h2>
        <DocStep stepNumber={1} title="Navigate to Health History">
          Go to your Profile → Health → History to access your complete health timeline.
        </DocStep>
        <DocStep stepNumber={2} title="Select a metric">
          Choose which health metric you want to analyze (weight, measurements, vitals, etc.).
        </DocStep>
        <DocStep stepNumber={3} title="Adjust time range">
          Use the date picker to view data for the last week, month, 3 months, year, or custom range.
        </DocStep>
        <DocStep stepNumber={4} title="Analyze the chart">
          The interactive chart shows your progress with trend lines and averages.
        </DocStep>
        <DocTip>
          Tap any data point on the chart to see the exact value and date it was recorded.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Logging New Measurements
        </h2>
        <p className="text-muted-foreground mb-4">
          Keep your health data up to date by logging measurements regularly:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Manual Entry:</strong> Tap the "+" button to add new measurements manually</li>
          <li><strong>Wearable Sync:</strong> Connected devices automatically upload data</li>
          <li><strong>Photo Progress:</strong> Add progress photos alongside measurements</li>
          <li><strong>Notes:</strong> Add context to entries (e.g., "after holiday", "morning weight")</li>
        </ul>
        <DocWarning>
          For accurate tracking, try to measure at consistent times (e.g., weight every morning before breakfast).
        </DocWarning>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Connected Wearables
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect integrates with popular fitness wearables and health apps:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Apple Health</h3>
            <p className="text-sm text-muted-foreground">Syncs workouts, steps, heart rate, sleep, and body measurements from iPhone and Apple Watch.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Google Fit</h3>
            <p className="text-sm text-muted-foreground">Connects activity data, heart rate, and wellness metrics from Android devices.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Fitbit</h3>
            <p className="text-sm text-muted-foreground">Imports steps, sleep data, heart rate, and workout summaries.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Garmin</h3>
            <p className="text-sm text-muted-foreground">Syncs detailed workout data, stress levels, and body battery.</p>
          </div>
        </div>
        <DocTip>
          Connect your wearables in Settings → Integrations → Wearables for automatic data syncing.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-amber-500" />
          Exporting Your Data
        </h2>
        <p className="text-muted-foreground mb-4">
          You own your health data and can export it anytime:
        </p>
        <DocStep stepNumber={1} title="Go to Data Export">
          Navigate to Settings → Privacy → Export My Data.
        </DocStep>
        <DocStep stepNumber={2} title="Select data types">
          Choose which health metrics you want to export.
        </DocStep>
        <DocStep stepNumber={3} title="Choose format">
          Export as CSV (spreadsheet) or JSON (for apps).
        </DocStep>
        <DocStep stepNumber={4} title="Download">
          Your data file will be generated and available for download.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Privacy Controls
        </h2>
        <p className="text-muted-foreground mb-4">
          Control who can see your health data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Coach Visibility:</strong> Choose which metrics your coaches can view</li>
          <li><strong>Historical Access:</strong> Limit how far back coaches can see</li>
          <li><strong>Gym Sharing:</strong> Control what gym staff can access</li>
          <li><strong>Data Deletion:</strong> Request deletion of specific entries or all history</li>
        </ul>
        <DocWarning>
          Limiting coach access may affect their ability to create personalized plans for you.
        </DocWarning>
      </section>
    </DocsLayout>
  );
}
