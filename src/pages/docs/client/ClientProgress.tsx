import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { TrendingUp, Camera, LineChart, Scale } from "lucide-react";

export default function ClientProgress() {
  return (
    <DocsLayout
      title="Tracking Progress"
      description="Learn how to log your progress, upload photos, and track your fitness journey over time."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Client Guide", href: "/docs/client" },
        { label: "Tracking Progress" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Logging Measurements
        </h2>
        <p className="text-muted-foreground">
          Regularly logging your weight and body measurements helps you and your coach 
          track your progress toward your goals.
        </p>

        <DocStep number={1} title="Navigate to Progress">
          Go to <strong>Progress</strong> from your dashboard sidebar.
        </DocStep>

        <DocStep number={2} title="Add a New Entry">
          Click <strong>Log Progress</strong> to add a new progress entry.
        </DocStep>

        <DocStep number={3} title="Enter Your Data">
          Fill in your current weight, body fat percentage (if known), and body measurements 
          (chest, waist, hips, arms, legs). You don't need to fill in every field.
        </DocStep>

        <DocTip type="tip">
          For consistency, try to measure yourself at the same time of day, preferably 
          in the morning before eating.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Progress Photos
        </h2>
        <p className="text-muted-foreground">
          Photos are one of the best ways to track visual changes that scales can't show.
        </p>

        <DocStep number={1} title="Take Consistent Photos">
          Use the same lighting, poses, and clothing for each photo session. Front, side, 
          and back views are recommended.
        </DocStep>

        <DocStep number={2} title="Upload Photos">
          When logging progress, click <strong>Add Photos</strong> to upload your images. 
          You can upload multiple photos per entry.
        </DocStep>

        <DocStep number={3} title="Compare Over Time">
          Use the comparison view to see your transformation side-by-side from different 
          time periods.
        </DocStep>

        <DocTip type="info">
          Your progress photos are private and only visible to you and your connected coaches.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          Viewing Progress Charts
        </h2>
        <p className="text-muted-foreground">
          Visual charts help you understand trends and patterns in your progress.
        </p>

        <DocStep number={1} title="View Weight Trends">
          The weight chart shows your weight over time. Look for the overall trend rather 
          than daily fluctuations.
        </DocStep>

        <DocStep number={2} title="Track Measurements">
          Body measurement charts help you see changes in specific areas, which is especially 
          useful for body recomposition goals.
        </DocStep>

        <DocStep number={3} title="Export Your Data">
          You can export your progress data to share with healthcare providers or for 
          your own records.
        </DocStep>

        <DocTip type="warning">
          Weight naturally fluctuates day-to-day due to water retention, food intake, and 
          other factors. Focus on weekly averages rather than daily numbers.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
