import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Users, ClipboardList, Heart, TrendingUp } from "lucide-react";

export default function CoachClientsDocs() {
  return (
    <DocsLayout
      title="Manage Your Clients | FitConnect Coach Guide"
      description="View client rosters, track progress and manage health data. A complete CRM for personal trainers and fitness coaches."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Managing Clients" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Your Client Roster
        </h2>
        <p className="text-muted-foreground">
          View and manage all your connected clients from a single dashboard.
        </p>

        <DocStep number={1} title="Access Client List">
          Navigate to <strong>Clients</strong> from your dashboard sidebar to see all 
          your active clients.
        </DocStep>

        <DocStep number={2} title="Client Cards">
          Each client card shows their name, photo, current plan, and last activity. 
          Click a card to view full client details.
        </DocStep>

        <DocStep number={3} title="Filter & Search">
          Use filters to sort clients by activity, plan type, or status. Search by 
          name to quickly find specific clients.
        </DocStep>

        <DocTip type="tip">
          Pin important clients to the top of your list for quick access.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          Client Health Profiles
        </h2>
        <p className="text-muted-foreground">
          Access important health information to create safe and effective programs.
        </p>

        <DocStep number={1} title="View Health Data">
          Click on a client to see their health profile including medical conditions, 
          allergies, and dietary restrictions.
        </DocStep>

        <DocStep number={2} title="Fitness Goals">
          Review their stated fitness goals to ensure your programming aligns with 
          what they want to achieve.
        </DocStep>

        <DocStep number={3} title="Body Metrics">
          See their current weight, height, and body measurements to inform your 
          plan design.
        </DocStep>

        <DocTip type="warning">
          Always review medical conditions and allergies before creating workout or 
          nutrition plans. Consult medical professionals if you have concerns.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Viewing Client Data
        </h2>
        <p className="text-muted-foreground">
          Access detailed client data when they've granted you permission.
        </p>

        <DocStep number={1} title="Data Tab">
          View client meal logs, training logs, and wearable data. This tab shows:
        </DocStep>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-4">
          <li><strong>Meal Logs:</strong> Daily food diary entries with calories and macros</li>
          <li><strong>Training Logs:</strong> Manual workout records with exercises, sets, and reps</li>
          <li><strong>Wearable Data:</strong> Steps, heart rate, calories burned, sleep, and active minutes</li>
        </ul>

        <DocStep number={2} title="Photos Tab">
          Review client progress photos to track visual changes over time.
        </DocStep>

        <DocStep number={3} title="Reports Tab">
          Generate AI-powered analysis reports that summarise client progress, including 
          measurements comparison and wearable summaries.
        </DocStep>

        <DocTip type="warning">
          Data visibility depends on client privacy settings. If a client has revoked access 
          to certain data types, you'll see "No access" messages instead.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Tracking Client Progress
        </h2>
        <p className="text-muted-foreground">
          Monitor how your clients are progressing toward their goals.
        </p>

        <DocStep number={1} title="View Progress Charts">
          Access weight trends, measurement changes, and workout completion rates 
          from the client detail page.
        </DocStep>

        <DocStep number={2} title="Progress Photos">
          Review client-submitted progress photos to see visual changes over time.
        </DocStep>

        <DocStep number={3} title="Log Progress for Clients">
          You can add progress entries on behalf of clients after in-person sessions 
          or assessments.
        </DocStep>

        <DocTip type="info">
          Regular progress reviews help you adjust plans and keep clients motivated. 
          Consider scheduling monthly check-ins.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Client Notes
        </h2>
        <p className="text-muted-foreground">
          Keep private notes about each client to track important details.
        </p>

        <DocStep number={1} title="Add Notes">
          From the client detail page, click <strong>Add Note</strong> to record 
          observations, preferences, or session feedback.
        </DocStep>

        <DocStep number={2} title="Organize by Category">
          Categorize notes as General, Session Feedback, Health, or Goals for 
          easy filtering later.
        </DocStep>

        <DocStep number={3} title="Pin Important Notes">
          Pin critical notes (like injuries or important preferences) so they're 
          always visible at the top.
        </DocStep>

        <DocTip type="tip">
          Notes are private to you and not visible to clients. Use them to remember 
          important details between sessions.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
