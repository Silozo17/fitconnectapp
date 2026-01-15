import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo } from "@/components/docs/DocComponents";

export default function GymGrading() {
  return (
    <DocsLayout
      title="Grading System"
      description="Track belt ranks, create grading events, and record student progress for martial arts schools."
      breadcrumbs={[{ label: "For Gym Owners", href: "/docs/gym" }, { label: "Grading System" }]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">Perfect for martial arts schools, our grading system lets you track student progression through belt ranks and record grading results.</p>
        <DocInfo>The grading system is automatically enabled for martial arts gym types. You can enable it manually in Settings.</DocInfo>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Setting Up Grades</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Define your belt/grade hierarchy (white, yellow, orange, etc.)</li>
          <li>Set minimum time between gradings</li>
          <li>Define requirements for each grade (attendance, skills)</li>
          <li>Add stripe or tag levels within grades</li>
        </ul>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Grading Events</h2>
        <p className="text-muted-foreground mb-4">Create grading events to assess multiple students:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Schedule date, time, and location</li>
          <li>Invite eligible students to register</li>
          <li>Record pass/fail results</li>
          <li>Student grades update automatically</li>
        </ul>
        <DocTip className="mt-4">Send automated reminders to students before grading events.</DocTip>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progress Tracking</h2>
        <p className="text-muted-foreground">View each student's grading history from their profile. Track time at current grade, attendance since last grading, and eligibility for next grading.</p>
      </section>
    </DocsLayout>
  );
}
