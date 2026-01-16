import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Target, Dumbbell, Award, Users, Settings, Star } from "lucide-react";

export default function ClientDisciplineSetupDocs() {
  return (
    <DocsLayout
      title="Discipline Setup | Client Guide"
      description="Configure your fitness disciplines to personalize your FitConnect experience. Get matched with relevant coaches, challenges, and content."
      breadcrumbs={[{ label: "Client Guide", href: "/docs/client" }, { label: "Discipline Setup" }]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          What Are Disciplines?
        </h2>
        <p className="text-muted-foreground mb-4">
          Disciplines are the fitness activities and training styles you're interested in. Setting up your 
          disciplines helps FitConnect personalize your experience by:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Recommending coaches who specialize in your interests</li>
          <li>Showing relevant challenges and competitions</li>
          <li>Curating your feed with appropriate content</li>
          <li>Matching you with like-minded members on leaderboards</li>
          <li>Suggesting gyms and classes that align with your goals</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          Available Disciplines
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Strength Training</h3>
            <p className="text-sm text-muted-foreground">Weightlifting, powerlifting, bodybuilding, and general strength work.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Combat Sports</h3>
            <p className="text-sm text-muted-foreground">Boxing, MMA, kickboxing, Brazilian Jiu-Jitsu, and martial arts.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Endurance</h3>
            <p className="text-sm text-muted-foreground">Running, cycling, swimming, triathlon, and cardio training.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Flexibility & Wellness</h3>
            <p className="text-sm text-muted-foreground">Yoga, Pilates, mobility work, and recovery practices.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Functional Fitness</h3>
            <p className="text-sm text-muted-foreground">CrossFit, HIIT, circuit training, and general fitness.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Sports Specific</h3>
            <p className="text-sm text-muted-foreground">Training for specific sports like football, tennis, golf, etc.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-500" />
          Setting Up Your Disciplines
        </h2>
        <DocStep stepNumber={1} title="Navigate to settings">
          Go to Profile → Settings → Fitness Preferences → Disciplines.
        </DocStep>
        <DocStep stepNumber={2} title="Select your disciplines">
          Browse the list and select all disciplines you're interested in. You can choose multiple.
        </DocStep>
        <DocStep stepNumber={3} title="Set your primary discipline">
          Choose one discipline as your primary focus. This will be weighted more heavily in recommendations.
        </DocStep>
        <DocStep stepNumber={4} title="Set experience levels">
          For each discipline, indicate your experience level (beginner, intermediate, advanced).
        </DocStep>
        <DocStep stepNumber={5} title="Save preferences">
          Tap "Save" to update your profile. Changes take effect immediately.
        </DocStep>
        <DocTip>
          You can update your disciplines anytime as your interests evolve. Your recommendations will adjust automatically.
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Following Discipline Content
        </h2>
        <p className="text-muted-foreground mb-4">
          Beyond setting your disciplines, you can follow specific entities within each discipline:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Top Coaches:</strong> Follow leading coaches in your discipline for content and updates</li>
          <li><strong>Gyms:</strong> Follow gyms that specialize in your disciplines</li>
          <li><strong>Challenges:</strong> Get notified about discipline-specific challenges</li>
          <li><strong>Leaderboards:</strong> Compete on discipline-specific rankings</li>
        </ul>
        <DocInfo>
          Following entities doesn't commit you to anything—it simply helps curate your experience.
        </DocInfo>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Discipline-Based Matching
        </h2>
        <p className="text-muted-foreground mb-4">
          Your discipline settings influence various parts of the platform:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Coach Discovery</h3>
            <p className="text-sm text-muted-foreground">Coaches specializing in your disciplines appear first in search results.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Leaderboard Categories</h3>
            <p className="text-sm text-muted-foreground">Compete on leaderboards specific to your primary discipline.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Challenge Recommendations</h3>
            <p className="text-sm text-muted-foreground">See challenges relevant to your training style and interests.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium">Gym Classes</h3>
            <p className="text-sm text-muted-foreground">Classes matching your disciplines are highlighted in gym schedules.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          Discipline-Specific Achievements
        </h2>
        <p className="text-muted-foreground mb-4">
          Earn badges and achievements tied to your disciplines:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Discipline Master:</strong> Complete milestones within a specific discipline</li>
          <li><strong>Cross-Trainer:</strong> Earn achievements across multiple disciplines</li>
          <li><strong>Specialist:</strong> Reach advanced levels in your primary discipline</li>
          <li><strong>Explorer:</strong> Try new disciplines outside your usual training</li>
        </ul>
        <DocTip>
          Adding new disciplines can unlock fresh achievements and keep your training varied!
        </DocTip>
      </section>
    </DocsLayout>
  );
}
