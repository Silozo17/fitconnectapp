import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip } from "@/components/docs/DocComponents";
import { Calculator, Scale, Flame, Activity, Percent, Dumbbell, Droplets, Heart } from "lucide-react";

export default function ClientToolsDocs() {
  return (
    <DocsLayout
      title="Fitness Calculator Tools | BMI, TDEE & Macros"
      description="Use BMI, TDEE and macro calculators. Set realistic fitness goals based on your personal metrics."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Fitness Tools" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect provides a suite of fitness calculators to help you understand your body, 
          set realistic goals, and track your progress. These tools are available to all users 
          and use scientifically-backed formulas.
        </p>
        <DocTip>
          While these calculators provide useful estimates, work with your coach for personalised 
          recommendations tailored to your specific situation.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-green-500" />
          Food Lookup Tool
        </h2>
        <p className="text-muted-foreground mb-4">
          Search our extensive food database to find nutritional information for any food.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Generic Foods:</strong> Search for common foods like "chicken breast" or "brown rice" (powered by CalorieNinjas)</li>
          <li><strong>Branded Products:</strong> Find UK supermarket products like "Tesco Greek Yogurt" (powered by Open Food Facts)</li>
          <li><strong>Barcode Scanner:</strong> Scan product barcodes to instantly look up nutritional information</li>
        </ul>
        <p className="text-muted-foreground text-sm mb-4">
          The food lookup tool also highlights allergens based on your profile settings, helping you 
          identify foods that may contain ingredients you're sensitive to.
        </p>
        <DocTip>
          Use the food lookup tool when logging meals in your <a href="/docs/client/food-diary" className="text-primary hover:underline">Food Diary</a>.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-500" />
          BMI Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Body Mass Index (BMI) is a simple measure of body fat based on height and weight. 
          While it doesn't account for muscle mass, it's a useful starting point.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="p-3 rounded-lg border border-border bg-blue-500/10 text-center">
            <span className="text-sm font-medium">Under 18.5</span>
            <span className="block text-xs text-muted-foreground">Underweight</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-green-500/10 text-center">
            <span className="text-sm font-medium">18.5 - 24.9</span>
            <span className="block text-xs text-muted-foreground">Normal</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-yellow-500/10 text-center">
            <span className="text-sm font-medium">25 - 29.9</span>
            <span className="block text-xs text-muted-foreground">Overweight</span>
          </div>
          <div className="p-3 rounded-lg border border-border bg-red-500/10 text-center">
            <span className="text-sm font-medium">30+</span>
            <span className="block text-xs text-muted-foreground">Obese</span>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          BMR Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Basal Metabolic Rate (BMR) is the number of calories your body burns at rest. 
          This is the minimum energy needed for basic functions like breathing and circulation.
        </p>
        <p className="text-muted-foreground">
          We use the Mifflin-St Jeor equation, which is considered the most accurate for most people.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          TDEE Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Total Daily Energy Expenditure (TDEE) is your BMR plus the calories burned through 
          daily activities and exercise. This is the number you need to know for weight management:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Eat below TDEE</strong> to lose weight (calorie deficit)</li>
          <li><strong>Eat at TDEE</strong> to maintain weight</li>
          <li><strong>Eat above TDEE</strong> to gain weight/muscle (calorie surplus)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-purple-500" />
          Ideal Weight Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Estimates a healthy weight range based on your height, age, and gender. Multiple 
          formulas are used including Devine, Robinson, and Miller to give you a range.
        </p>
        <DocTip>
          Ideal weight varies significantly based on muscle mass, body composition, and 
          individual factors. Use this as a guide, not a strict target.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-amber-500" />
          Body Fat Percentage Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Estimates your body fat percentage using the U.S. Navy method, which requires 
          measurements of your waist, neck, and (for women) hips.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Essential fat:</strong> 2-5% (men) / 10-13% (women)</p>
          <p><strong>Athletes:</strong> 6-13% (men) / 14-20% (women)</p>
          <p><strong>Fitness:</strong> 14-17% (men) / 21-24% (women)</p>
          <p><strong>Average:</strong> 18-24% (men) / 25-31% (women)</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-red-500" />
          One Rep Max Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Estimates your one-repetition maximum (1RM) for any lift based on the weight you 
          can lift for multiple reps. Useful for:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Setting training percentages</li>
          <li>Tracking strength progress over time</li>
          <li>Programming periodised training</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water Intake Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Calculates your recommended daily water intake based on:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Body weight</li>
          <li>Activity level</li>
          <li>Climate/environment</li>
          <li>Exercise duration</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Heart Rate Zone Calculator
        </h2>
        <p className="text-muted-foreground mb-4">
          Calculates your heart rate training zones based on your age and resting heart rate:
        </p>
        <div className="space-y-2 mb-4">
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Zone 1 - Recovery</span>
              <span className="text-xs text-muted-foreground">50-60% max HR</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Zone 2 - Aerobic</span>
              <span className="text-xs text-muted-foreground">60-70% max HR</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Zone 3 - Tempo</span>
              <span className="text-xs text-muted-foreground">70-80% max HR</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Zone 4 - Threshold</span>
              <span className="text-xs text-muted-foreground">80-90% max HR</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-card/50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Zone 5 - Maximum</span>
              <span className="text-xs text-muted-foreground">90-100% max HR</span>
            </div>
          </div>
        </div>
        <DocTip>
          Connect a heart rate monitor to track which zone you're in during workouts.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
