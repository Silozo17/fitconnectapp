import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  ArrowRight,
  Brain,
  FileText,
  TrendingUp,
  Dumbbell,
  Utensils,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Shield
} from "lucide-react";

const aiFeatures = [
  {
    title: "AI Client Summary",
    description: "Generate comprehensive client progress summaries automatically.",
    icon: FileText,
    tier: "Enterprise",
    color: "text-purple-500",
  },
  {
    title: "AI Plan Recommendations",
    description: "Get intelligent suggestions for plan adjustments based on client data.",
    icon: Brain,
    tier: "Enterprise",
    color: "text-blue-500",
  },
  {
    title: "AI Progress Analysis",
    description: "Automated analysis of client progress trends and patterns.",
    icon: TrendingUp,
    tier: "Pro",
    color: "text-green-500",
  },
  {
    title: "AI Workout Generator",
    description: "Generate complete workout programs based on client goals.",
    icon: Dumbbell,
    tier: "Pro",
    color: "text-orange-500",
  },
  {
    title: "AI Meal Suggestions",
    description: "Get AI-powered meal ideas that fit client macro targets.",
    icon: Utensils,
    tier: "Pro",
    color: "text-red-500",
  },
  {
    title: "AI Message Composer",
    description: "Draft personalised messages and check-ins with AI assistance.",
    icon: MessageSquare,
    tier: "Enterprise",
    color: "text-cyan-500",
  },
];

export default function CoachAIOverviewDocs() {
  return (
    <DocsLayout
      title="AI Tools for Coaches"
      description="Leverage artificial intelligence to save time, improve client outcomes, and scale your coaching business."
      breadcrumbs={[{ label: "For Coaches", href: "/docs/coach" }, { label: "AI Tools" }]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          AI Tools are designed for coaches who want to work smarter, not harder. Whether you're 
          building programs, analyzing progress, or communicating with clients, AI can help you 
          deliver better results in less time.
        </p>
      </section>

      {/* What AI Does */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What AI Tools Do</h2>
        <p className="text-muted-foreground mb-4">
          AI tools augment your expertise by handling time-consuming tasks like data analysis, 
          content generation, and pattern recognition. They help you focus on what matters most: 
          coaching your clients.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
            <h3 className="font-medium">What AI helps with</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Generating workout programs from goals</li>
              <li>• Suggesting meals that fit macro targets</li>
              <li>• Summarizing client progress</li>
              <li>• Identifying trends and patterns</li>
              <li>• Drafting personalised messages</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <AlertCircle className="h-5 w-5 text-amber-500 mb-2" />
            <h3 className="font-medium">What AI doesn't replace</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Your professional judgment</li>
              <li>• Personal relationship with clients</li>
              <li>• Medical or clinical decisions</li>
              <li>• Motivational coaching conversations</li>
              <li>• Understanding individual context</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Available AI Features */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Available AI Features</h2>
        <div className="grid gap-4">
          {aiFeatures.map((feature) => (
            <Card key={feature.title} className="bg-card">
              <CardHeader className="pb-2 flex-row items-start gap-4">
                <feature.icon className={`h-8 w-8 ${feature.color} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {feature.tier}+
                    </span>
                  </div>
                  <CardDescription className="mt-1">{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Workout Generator */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-orange-500" />
          AI Workout Generator
        </h2>
        <p className="text-muted-foreground mb-4">
          Generate complete, periodised workout programs in seconds based on client inputs.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">How It Works</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">1. Input Client Parameters</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Goal (fat loss, muscle gain, strength), experience level, days per week, 
              available equipment, injuries, and session duration.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">2. AI Generates Program</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The AI creates a complete multi-week program with exercise selection, 
              sets, reps, tempo, and progressive overload built in.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">3. Review and Customise</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Review the generated program. Make adjustments, swap exercises, or 
              modify progressions before assigning to the client.
            </p>
          </div>
        </div>

        <DocInfo>
          AI-generated programs are starting points. Always review and adjust based on 
          your knowledge of the individual client.
        </DocInfo>
      </section>

      {/* AI Meal Suggestions */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-red-500" />
          AI Meal Suggestions
        </h2>
        <p className="text-muted-foreground mb-4">
          Get AI-powered meal ideas that fit within client macro targets and dietary preferences.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">What It Considers</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Daily calorie and macro targets you've set</li>
          <li>Dietary restrictions (vegetarian, vegan, gluten-free, etc.)</li>
          <li>Food allergies and intolerances</li>
          <li>Meal timing preferences</li>
          <li>Cultural food preferences when specified</li>
        </ul>

        <DocTip>
          AI meal suggestions can be added directly to nutrition plans or shared with 
          clients as ideas. They include estimated macro breakdowns.
        </DocTip>
      </section>

      {/* AI Client Summary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          AI Client Summary (Enterprise)
        </h2>
        <p className="text-muted-foreground mb-4">
          Automatically generate comprehensive summaries of client progress, achievements, 
          and areas needing attention.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">Data Used</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Progress photos and measurements</li>
          <li>Training logs and workout completion</li>
          <li>Habit completion rates</li>
          <li>Session attendance history</li>
          <li>Goal progress and timeline</li>
          <li>Communication patterns</li>
        </ul>

        <h3 className="font-medium mt-6 mb-3">Approval Workflow</h3>
        <p className="text-muted-foreground mb-4">
          AI summaries are generated as drafts. You review, edit, and approve before 
          they're shared with clients or used in reports.
        </p>

        <DocWarning>
          AI summaries are based on available data. If a client hasn't been logging 
          consistently, the summary may be incomplete or less accurate.
        </DocWarning>
      </section>

      {/* AI Plan Recommendations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Plan Recommendations (Enterprise)
        </h2>
        <p className="text-muted-foreground mb-4">
          Receive intelligent suggestions for adjusting client plans based on their 
          progress data and adherence patterns.
        </p>
        
        <h3 className="font-medium mt-6 mb-3">Types of Recommendations</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Volume adjustments</strong> - Increase or decrease training volume</li>
          <li><strong>Progression suggestions</strong> - When to advance exercises or weights</li>
          <li><strong>Deload indicators</strong> - Signs that a client needs recovery</li>
          <li><strong>Calorie adjustments</strong> - When to update macro targets</li>
          <li><strong>Plateau interventions</strong> - Strategies when progress stalls</li>
        </ul>

        <h3 className="font-medium mt-6 mb-3">Priority Levels</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <h4 className="font-medium text-red-400">High Priority</h4>
            <p className="text-xs text-muted-foreground mt-1">Urgent attention needed</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <h4 className="font-medium text-amber-400">Medium Priority</h4>
            <p className="text-xs text-muted-foreground mt-1">Review when convenient</p>
          </div>
          <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
            <h4 className="font-medium text-green-400">Low Priority</h4>
            <p className="text-xs text-muted-foreground mt-1">Optional optimisation</p>
          </div>
        </div>
      </section>

      {/* Privacy & Data Usage */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy & Data Usage
        </h2>
        <p className="text-muted-foreground mb-4">
          AI features process client data responsibly:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Data is processed securely and not stored by AI providers</li>
          <li>AI outputs are generated fresh each time</li>
          <li>Client data sharing permissions are respected</li>
          <li>AI does not learn from or retain individual client data</li>
          <li>All processing complies with GDPR requirements</li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocWarning>
          AI tools are assistants, not replacements for professional judgment. Always 
          review AI outputs before using them with clients.
        </DocWarning>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
          <li>AI cannot make medical or clinical recommendations</li>
          <li>Outputs should be reviewed for accuracy and appropriateness</li>
          <li>AI may not account for nuances only you know about a client</li>
          <li>Quality of outputs depends on quality of input data</li>
          <li>AI features require an active subscription to the appropriate tier</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Is client data safe with AI?</h3>
            <p className="text-sm text-muted-foreground">
              Yes. Data is processed securely and not retained by AI providers. 
              We use privacy-focused AI services that comply with GDPR.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I edit AI-generated content?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely. All AI outputs are editable. We encourage you to review and 
              customise everything before using it with clients.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Do AI features use my credits?</h3>
            <p className="text-sm text-muted-foreground">
              AI features are included in your subscription tier. There are no additional 
              per-use charges for AI tools.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">How accurate is the AI?</h3>
            <p className="text-sm text-muted-foreground">
              AI provides helpful suggestions but isn't perfect. Accuracy improves with 
              more data and clearer inputs. Always apply your professional judgment.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
