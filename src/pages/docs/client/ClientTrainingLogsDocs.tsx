import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Dumbbell, Plus, Edit, Trash2, Eye, Calendar, BarChart3 } from "lucide-react";

export default function ClientTrainingLogsDocs() {
  return (
    <DocsLayout
      title="Training Logs"
      description="Log your workouts manually to track your strength training and exercise progress."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Training Logs" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          Training Logs let you manually record your workouts, including exercises, sets, reps, 
          and weights. This is perfect for tracking gym sessions that aren't part of an assigned 
          training plan, or for logging workouts when you're training independently.
        </p>
        <DocTip>
          Your training logs can be shared with coaches to help them understand your workout 
          history and adjust your programs accordingly.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-500" />
          Logging a Workout
        </h2>
        <p className="text-muted-foreground mb-4">
          Create a detailed record of your training session.
        </p>

        <DocStep stepNumber={1} title="Start a New Log">
          Navigate to <strong>Training Logs</strong> from your dashboard and tap <strong>New Workout</strong>.
        </DocStep>

        <DocStep stepNumber={2} title="Enter Workout Details">
          Fill in the basic information:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li><strong>Workout Name:</strong> e.g., "Upper Body Push", "Leg Day"</li>
          <li><strong>Date:</strong> When you performed the workout</li>
          <li><strong>Duration:</strong> Total time spent (optional)</li>
        </ul>

        <DocStep stepNumber={3} title="Add Exercises">
          For each exercise, record:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li><strong>Exercise Name:</strong> e.g., "Bench Press", "Squats"</li>
          <li><strong>Sets:</strong> Number of sets performed</li>
          <li><strong>Reps:</strong> Repetitions per set</li>
          <li><strong>Weight:</strong> Weight used (kg or lbs)</li>
          <li><strong>RPE:</strong> Rate of Perceived Exertion (1-10 scale, optional)</li>
        </ul>

        <DocStep stepNumber={4} title="Add Notes">
          Include any additional notes about the session, such as how you felt, any modifications, 
          or things to remember for next time.
        </DocStep>

        <DocStep stepNumber={5} title="Save Your Log">
          Tap <strong>Save Workout</strong> to record your training session.
        </DocStep>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Viewing Your History
        </h2>
        <p className="text-muted-foreground mb-4">
          Review your past workouts to track progress over time.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>List View:</strong> See all your logged workouts sorted by date</li>
          <li><strong>Search & Filter:</strong> Find specific workouts by name or date range</li>
          <li><strong>Expand Details:</strong> Tap any workout to see the full exercise breakdown</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Edit className="h-5 w-5 text-amber-500" />
          Editing & Deleting
        </h2>
        <p className="text-muted-foreground mb-4">
          Made a mistake? You can always update your logs.
        </p>

        <DocStep stepNumber={1} title="Edit a Workout">
          Open the workout you want to edit and tap the <strong>Edit</strong> button. 
          Make your changes and save.
        </DocStep>

        <DocStep stepNumber={2} title="Delete a Workout">
          To remove a workout, tap the <strong>Delete</strong> button. You'll be asked to confirm 
          before the log is permanently removed.
        </DocStep>

        <DocTip>
          Deleted workouts cannot be recovered. Double-check before confirming deletion.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Understanding Your Data
        </h2>
        <p className="text-muted-foreground mb-4">
          Use your training logs to track strength progress:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Volume:</strong> Total sets × reps across workouts</li>
          <li><strong>Progressive Overload:</strong> Compare weights used over time</li>
          <li><strong>Consistency:</strong> See how often you're training</li>
          <li><strong>Recovery:</strong> Note fatigue levels to optimize rest</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-red-500" />
          Coach Access
        </h2>
        <p className="text-muted-foreground mb-4">
          Control who can see your training logs:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Manage visibility in <strong>Settings → Privacy → Data Privacy</strong></li>
          <li>Share with specific coaches or keep logs private</li>
          <li>Coaches use this data to understand your training capacity and progress</li>
        </ul>
        <DocTip>
          Sharing training logs helps your coach see what you're doing outside of assigned plans, 
          allowing them to better programme your workouts.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
