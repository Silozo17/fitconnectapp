import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Dumbbell, Zap, Settings, Clock, Target, Repeat } from "lucide-react";

export default function AIWorkoutGeneratorDocs() {
  return (
    <DocsLayout
      title="AI Workout Generator | FitConnect Coach Guide"
      description="Create personalised training programmes in seconds. AI builds plans based on client goals and equipment."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Workout Generator" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This feature is for <strong>coaches on Pro tier and above</strong> who want to quickly 
            create structured workout programs as a starting point. It's especially useful when 
            onboarding new clients or needing inspiration for program design.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            The AI Workout Generator creates complete, structured training programs based on your 
            specifications. Instead of starting from a blank slate, you get a professionally 
            designed program that you can customise to your client's needs.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Target className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Goal-Oriented</h3>
              <p className="text-sm text-muted-foreground">
                Programs designed around specific goals: strength, muscle building, fat loss, endurance
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Settings className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Equipment-Aware</h3>
              <p className="text-sm text-muted-foreground">
                Specify available equipment and the AI adapts exercises accordingly
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Time-Conscious</h3>
              <p className="text-sm text-muted-foreground">
                Set session duration and the AI creates workouts that fit the time available
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Repeat className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Progressive Structure</h3>
              <p className="text-sm text-muted-foreground">
                Multi-week programs with built-in progression and periodisation
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Program design is one of the most time-consuming parts of coaching. The AI Workout 
            Generator helps by:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Reducing the time from hours to minutes for initial program creation</li>
            <li>Providing evidence-based exercise selection and programming</li>
            <li>Ensuring no muscle groups are forgotten</li>
            <li>Offering fresh ideas and exercise variations</li>
            <li>Creating a solid foundation you can refine with your expertise</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Set the Parameters">
              You provide key information about the client and program:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li><strong>Goal:</strong> What the client wants to achieve</li>
                <li><strong>Experience level:</strong> Beginner, intermediate, or advanced</li>
                <li><strong>Days per week:</strong> How many training days (1-7)</li>
                <li><strong>Session duration:</strong> How long each workout should take</li>
                <li><strong>Available equipment:</strong> Full gym, home gym, bodyweight only, etc.</li>
                <li><strong>Focus areas:</strong> Specific muscle groups to prioritise</li>
                <li><strong>Injuries/limitations:</strong> Movements to avoid</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={2} title="AI Generation">
              The AI creates a complete program including:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Exercise selection appropriate for the goal and level</li>
                <li>Sets, reps, and rest periods</li>
                <li>Proper warm-up and cool-down suggestions</li>
                <li>Weekly structure (push/pull, upper/lower, etc.)</li>
                <li>Progression guidelines</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={3} title="Review and Customise">
              You review the generated program and can:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Swap exercises for alternatives</li>
                <li>Adjust sets, reps, or rest times</li>
                <li>Add or remove exercises</li>
                <li>Rearrange the workout structure</li>
                <li>Add coaching notes and cues</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={4} title="Assign to Client">
              Once satisfied, assign the program to your client. They'll receive it in 
              their Plans section with all exercises, sets, and reps ready to follow.
            </DocStep>
          </div>
        </section>

        {/* How to Set It Up */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Use It</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Open Plan Builder">
              Go to Dashboard → Plans → Create New Plan
            </DocStep>
            <DocStep stepNumber={2} title="Click AI Generate">
              Click the "AI Generate" button in the plan builder toolbar
            </DocStep>
            <DocStep stepNumber={3} title="Fill in Parameters">
              Complete the form with goal, experience level, days, equipment, etc.
            </DocStep>
            <DocStep stepNumber={4} title="Generate">
              Click "Generate Program" and wait a few seconds for the AI to create the plan
            </DocStep>
            <DocStep stepNumber={5} title="Review and Edit">
              Review the generated exercises, make adjustments as needed
            </DocStep>
            <DocStep stepNumber={6} title="Save and Assign">
              Save the plan and assign it to your client
            </DocStep>
          </div>
          <DocTip className="mt-4">
            Save your favourite generated programs as templates. You can then quickly 
            duplicate and customise them for similar clients.
          </DocTip>
        </section>

        {/* Input Parameters */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Input Parameters Explained</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Goal</h3>
              <p className="text-sm text-muted-foreground mb-2">Options include:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li><strong>Build Muscle:</strong> Hypertrophy-focused with moderate rep ranges</li>
                <li><strong>Build Strength:</strong> Lower rep, higher intensity focus</li>
                <li><strong>Lose Fat:</strong> Higher volume, circuit-style elements</li>
                <li><strong>Improve Endurance:</strong> Longer sessions, conditioning focus</li>
                <li><strong>General Fitness:</strong> Balanced approach to all fitness components</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Experience Level</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li><strong>Beginner:</strong> Simpler movements, more rest, focus on form</li>
                <li><strong>Intermediate:</strong> Compound movements, moderate volume</li>
                <li><strong>Advanced:</strong> Complex movements, higher volume, advanced techniques</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Available Equipment</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li><strong>Full Gym:</strong> All equipment available</li>
                <li><strong>Home Gym:</strong> Dumbbells, bench, basic equipment</li>
                <li><strong>Bodyweight Only:</strong> No equipment needed</li>
                <li><strong>Resistance Bands:</strong> Band-focused exercises</li>
                <li><strong>Custom:</strong> Specify exact equipment available</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Limitations & Important Notes</h2>
          <DocWarning>
            AI-generated programs are starting points. Your coaching expertise in assessing 
            form, adjusting for individual differences, and progressing appropriately is essential.
          </DocWarning>
          <div className="mt-4 space-y-3">
            <p className="text-muted-foreground">
              <strong>• Exercise demonstrations:</strong> Generated programs include exercise names 
              but clients may need coaching on proper form.
            </p>
            <p className="text-muted-foreground">
              <strong>• Individual variation:</strong> The AI doesn't know your client's specific 
              biomechanics, preferences, or training history. Always personalise.
            </p>
            <p className="text-muted-foreground">
              <strong>• Medical conditions:</strong> While you can note injuries, the AI is not 
              a substitute for medical advice or physical therapy protocols.
            </p>
          </div>
        </section>

        {/* Common Use Cases */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Common Use Cases</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">New Client Onboarding</h3>
              <p className="text-sm text-muted-foreground">
                Quickly generate a starting program during or right after the consultation, 
                then refine based on initial sessions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Program Variety</h3>
              <p className="text-sm text-muted-foreground">
                When clients need a fresh program after completing a training block, 
                generate new ideas to prevent staleness.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Equipment Constraints</h3>
              <p className="text-sm text-muted-foreground">
                Client travelling or gym closed? Generate a bodyweight or hotel-gym 
                program to keep them on track.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Can I regenerate if I don't like the result?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, click "Regenerate" to get a different program with the same parameters, 
                or adjust parameters and generate again.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Does the AI learn from my edits?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Currently, each generation is independent. Your edits don't train the AI, 
                but you can save edited programs as templates for future use.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How many exercises per workout?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This depends on session duration and goal. Typically 5-8 exercises per 
                session, adjusted based on your specifications.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I generate programs for group classes?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can generate a program and assign it to multiple clients 
                or save it as a group class template.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
