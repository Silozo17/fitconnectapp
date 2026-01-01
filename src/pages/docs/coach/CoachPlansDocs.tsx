import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Dumbbell, Utensils, Sparkles, Users } from "lucide-react";

export default function CoachPlansDocs() {
  return (
    <DocsLayout
      title="Build Workout Plans | FitConnect Coach Guide"
      description="Create personalised training programmes with drag-and-drop. Use AI assistance and assign plans to clients instantly."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Building Plans" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          Workout Plan Builder
        </h2>
        <p className="text-muted-foreground">
          Create professional workout plans with our drag-and-drop plan builder.
        </p>

        <DocStep number={1} title="Create a New Plan">
          Go to <strong>Plans</strong> and click <strong>Create Workout Plan</strong>. 
          Give your plan a name and description.
        </DocStep>

        <DocStep number={2} title="Add Workout Days">
          Create workout days (e.g., "Day 1 - Upper Body", "Day 2 - Lower Body"). 
          You can add as many days as needed for the program.
        </DocStep>

        <DocStep number={3} title="Add Exercises">
          Browse the exercise library or search for specific exercises. Drag exercises 
          into your workout days in the desired order.
        </DocStep>

        <DocStep number={4} title="Set Exercise Parameters">
          For each exercise, set: sets, reps, tempo (e.g., 3-1-2), rest period, 
          and any notes or modifications.
        </DocStep>

        <DocTip type="tip">
          Use the exercise library's filter to find exercises by muscle group, equipment, 
          or difficulty level.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          Nutrition Plan Builder
        </h2>
        <p className="text-muted-foreground">
          Create meal plans with calorie and macro targets.
        </p>

        <DocStep number={1} title="Set Macro Targets">
          Define daily calorie, protein, carb, and fat targets based on your client's 
          goals and body metrics.
        </DocStep>

        <DocStep number={2} title="Build Meal Plans">
          Add meals for breakfast, lunch, dinner, and snacks. Browse the food database 
          or add custom foods.
        </DocStep>

        <DocStep number={3} title="Track Macros">
          The macro tracker shows how each meal contributes to daily targets. 
          Adjust portions to hit precise macro goals.
        </DocStep>

        <DocStep number={4} title="Add Custom Foods">
          If a food isn't in the database, add it with custom nutritional information 
          for future use.
        </DocStep>

        <DocTip type="info">
          Our food database contains over 650 items with complete nutritional data 
          including calories, protein, carbs, fat, and fiber.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI-Assisted Planning
        </h2>
        <p className="text-muted-foreground">
          Use AI tools to speed up plan creation and get suggestions.
        </p>

        <DocStep number={1} title="AI Workout Generator">
          Input client goals, fitness level, and available equipment. The AI suggests 
          a complete workout program you can customize.
        </DocStep>

        <DocStep number={2} title="AI Meal Suggestions">
          Get AI-generated meal options that fit your client's macro targets, 
          dietary restrictions, and food preferences.
        </DocStep>

        <DocStep number={3} title="Review & Customize">
          AI suggestions are starting points. Review, modify, and personalize 
          before assigning to clients.
        </DocStep>

        <DocTip type="warning">
          Always review AI-generated content for accuracy and appropriateness. 
          You know your clients better than any AI.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Assigning Plans to Clients
        </h2>
        <p className="text-muted-foreground">
          Deliver your plans to clients with a few clicks.
        </p>

        <DocStep number={1} title="Assign from Plan Builder">
          After creating a plan, click <strong>Assign to Client</strong> and select 
          which clients should receive it.
        </DocStep>

        <DocStep number={2} title="Assign from Client Profile">
          From a client's detail page, click <strong>Assign Plan</strong> to choose 
          from your saved plans.
        </DocStep>

        <DocStep number={3} title="Set Start Dates">
          Specify when the plan should start. Clients will see it in their Plans 
          section automatically.
        </DocStep>

        <DocTip type="tip">
          Create template plans for common goals (weight loss, muscle gain, etc.) 
          that you can quickly customize and assign to new clients.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
