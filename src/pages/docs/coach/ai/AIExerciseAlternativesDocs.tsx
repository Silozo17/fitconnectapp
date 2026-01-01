import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocStep, DocInfo } from "@/components/docs/DocComponents";
import { Dumbbell, RefreshCw, AlertCircle, Check, Settings } from "lucide-react";

export default function AIExerciseAlternativesDocs() {
  return (
    <DocsLayout
      title="AI Exercise Alternatives | FitConnect Coach Guide"
      description="Find suitable exercise swaps for injuries, equipment limitations or client preferences."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Exercise Alternatives" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">When to Request Alternatives</h2>
        <p>
          The AI Exercise Alternatives tool helps you quickly find suitable substitutions when a 
          client can't perform a planned exercise. Common scenarios include:
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Injury or pain</strong> – Client has a shoulder issue and can't do overhead pressing</li>
          <li><strong>Equipment unavailable</strong> – Gym is busy and the cable machine is taken</li>
          <li><strong>Home workout</strong> – Client is travelling and only has resistance bands</li>
          <li><strong>Preference</strong> – Client dislikes an exercise and wants something similar</li>
          <li><strong>Progression</strong> – Exercise has become too easy or too difficult</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Specifying Reasons</h2>
        <p>
          When requesting alternatives, specify why the substitution is needed. This helps the AI 
          provide more relevant options:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">Injury/Pain</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI avoids exercises that stress the affected area. Specify the body part (e.g., 
              "lower back", "right knee").
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Equipment</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI suggests alternatives using only available equipment. List what's accessible.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Preference</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI offers variety while targeting the same muscles. Good for keeping workouts fresh.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Difficulty</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI suggests easier or harder variations of the same movement pattern.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Equipment Availability Filters</h2>
        <p>
          Narrow down alternatives by specifying available equipment:
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {["Barbell", "Dumbbells", "Kettlebells", "Cables", "Machines", "Resistance Bands", 
            "Bodyweight Only", "Pull-up Bar", "Bench", "TRX/Suspension"].map((equip) => (
            <span key={equip} className="px-3 py-1 bg-muted rounded-full text-sm">
              {equip}
            </span>
          ))}
        </div>
        
        <DocTip>
          Save your client's home and gym equipment in their profile. The AI will automatically 
          filter alternatives based on their current workout location.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Muscle Group Matching</h2>
        <p>
          The AI ensures alternatives target the same primary and secondary muscle groups:
        </p>
        
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 border-b">Original Exercise</th>
                <th className="text-left p-3 border-b">Primary Muscles</th>
                <th className="text-left p-3 border-b">Possible Alternatives</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">Barbell Bench Press</td>
                <td className="p-3 border-b">Chest, Triceps, Shoulders</td>
                <td className="p-3 border-b">DB Press, Push-ups, Cable Fly</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Barbell Squat</td>
                <td className="p-3 border-b">Quads, Glutes, Core</td>
                <td className="p-3 border-b">Goblet Squat, Leg Press, Lunges</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Lat Pulldown</td>
                <td className="p-3 border-b">Lats, Biceps, Rear Delts</td>
                <td className="p-3 border-b">Pull-ups, Band Pulldowns, Rows</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Use</h2>
        
        <DocStep stepNumber={1} title="Select the Exercise">
          In the workout builder or client's plan, click on the exercise you want to replace 
          and select <strong>Find Alternatives</strong>.
        </DocStep>
        
        <DocStep stepNumber={2} title="Specify the Reason">
          Choose why you need an alternative (injury, equipment, preference) and add any 
          specific details.
        </DocStep>
        
        <DocStep stepNumber={3} title="Set Equipment Filters">
          Select the equipment your client has access to. Leave blank to see all options.
        </DocStep>
        
        <DocStep stepNumber={4} title="Review Suggestions">
          The AI presents 3-5 alternatives ranked by similarity. Each shows target muscles, 
          equipment needed, and difficulty level.
        </DocStep>
        
        <DocStep stepNumber={5} title="Apply to Plan">
          Click on your chosen alternative to swap it into the workout plan. The AI will 
          suggest appropriate sets, reps, and weights based on the original prescription.
        </DocStep>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Applying Alternatives to Plans</h2>
        <p>When you select an alternative, you can:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Replace once</strong> – Swap for today's session only</li>
          <li><strong>Replace in this plan</strong> – Update all instances in the current programme</li>
          <li><strong>Replace everywhere</strong> – Update across all active plans for this client</li>
        </ul>
        
        <DocInfo>
          The AI logs all substitutions so you can review what was changed and when. This helps 
          track exercise progression over time.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
