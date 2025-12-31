import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Trophy, Target, Gift, Users } from "lucide-react";

export default function AdminChallengesDocs() {
  return (
    <DocsLayout
      title="Challenges Management | Admin Guide"
      description="Create and manage platform-wide fitness challenges."
      breadcrumbs={[{ label: "For Administrators", href: "/docs/admin" }, { label: "Challenges" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Creating Challenges
        </h2>
        <DocStep stepNumber={1} title="Define the goal">Set the target metric (steps, workouts, habits) and value.</DocStep>
        <DocStep stepNumber={2} title="Set duration">Choose start and end dates for the challenge.</DocStep>
        <DocStep stepNumber={3} title="Configure rewards">Assign XP, badges, or exclusive avatars for completion.</DocStep>
        <DocStep stepNumber={4} title="Publish">Make the challenge visible to users.</DocStep>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" />
          Reward Types
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>XP Bonus</strong> - Extra experience points for participants</li>
          <li><strong>Challenge Badges</strong> - Special badges displayed on profiles</li>
          <li><strong>Exclusive Avatars</strong> - Limited-edition avatars only available during the challenge</li>
        </ul>
      </section>
      <DocTip>Create seasonal challenges (New Year, Summer) to boost engagement at key times.</DocTip>
    </DocsLayout>
  );
}
