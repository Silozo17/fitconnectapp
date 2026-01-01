import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Dumbbell, Utensils, CheckCircle, MessageSquare } from "lucide-react";

export default function ClientPlans() {
  return (
    <DocsLayout
      title="View Workout & Nutrition Plans | Training Programmes"
      description="Access personalised workout and meal plans from your coach. Track exercises, log workouts and follow nutrition programmes."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Workout & Nutrition Plans" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          Viewing Your Workout Plans
        </h2>
        <p className="text-muted-foreground">
          Once your coach assigns you a workout plan, you can access it from your dashboard.
        </p>

        <DocStep number={1} title="Access Your Plans">
          Navigate to <strong>Plans</strong> from your dashboard sidebar to see all assigned plans.
        </DocStep>

        <DocStep number={2} title="View Workout Details">
          Click on a workout day to see the full exercise list with sets, reps, tempo, and rest periods. 
          Video demonstrations are available for most exercises.
        </DocStep>

        <DocStep number={3} title="Log Your Workouts">
          After completing a workout, mark it as done to track your progress. Your coach can see 
          your completion status and provide feedback.
        </DocStep>

        <DocTip type="info">
          If you're unsure about an exercise technique, watch the video demonstration or message 
          your coach directly for guidance.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          Viewing Your Nutrition Plans
        </h2>
        <p className="text-muted-foreground">
          Your coach may also assign nutrition plans with daily meals and macro targets.
        </p>

        <DocStep number={1} title="View Daily Meals">
          Each nutrition plan shows meals for breakfast, lunch, dinner, and snacks with 
          calorie and macro information.
        </DocStep>

        <DocStep number={2} title="Track Your Macros">
          The macro tracker shows your daily targets for protein, carbs, and fat. 
          Log your food to see how you're tracking against these goals.
        </DocStep>

        <DocStep number={3} title="Generate Grocery Lists">
          Use the grocery list feature to automatically generate a shopping list based 
          on your meal plan, with links to supermarket delivery services.
        </DocStep>

        <DocTip type="tip">
          If you have dietary restrictions or allergies, make sure they're listed in your 
          profile so your coach can create appropriate meal plans.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Requesting Changes
        </h2>
        <p className="text-muted-foreground">
          Need modifications to your plan? Here's how to request changes.
        </p>

        <DocStep number={1} title="Message Your Coach">
          Use the messaging feature to discuss any concerns about your current plan 
          with your coach.
        </DocStep>

        <DocStep number={2} title="Provide Feedback">
          Let your coach know if exercises are too difficult, too easy, or if you need 
          alternatives due to equipment availability or injuries.
        </DocStep>

        <DocTip type="warning">
          Always consult with your coach before making significant changes to your 
          assigned plan to ensure you stay on track with your goals.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
