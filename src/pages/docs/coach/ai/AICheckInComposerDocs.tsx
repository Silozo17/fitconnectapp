import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocTip, DocStep } from "@/components/docs/DocComponents";
import { MessageSquare, Sparkles, RefreshCw, Heart, Briefcase, Smile } from "lucide-react";

export default function AICheckInComposerDocs() {
  return (
    <DocsLayout
      title="AI Check-in Composer"
      description="Generate personalised check-in messages for your clients using AI-powered message composition."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Check-in Composer" },
      ]}
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What is the AI Check-in Composer?</h2>
        <p>
          The AI Check-in Composer helps you write personalised messages to your clients based on their 
          recent activity, progress, and engagement. Instead of starting from scratch, the AI generates 
          a draft message that you can review, edit, and send.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Message Tones</h2>
        <p>Choose from three distinct tones to match your coaching style and the situation:</p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smile className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Motivational</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Energetic and encouraging. Best for celebrating wins and pushing through plateaus.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h3 className="font-medium">Supportive</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Warm and understanding. Ideal for clients facing challenges or needing reassurance.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Professional</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Clear and direct. Works well for progress updates and plan adjustments.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Client Context</h2>
        <p>The AI uses the following information about your client to personalise messages:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Recent activity</strong> – Workout completions, habit streaks, logged measurements</li>
          <li><strong>Progress trends</strong> – Weight changes, strength improvements, consistency patterns</li>
          <li><strong>Engagement level</strong> – Message responsiveness, plan adherence, session attendance</li>
          <li><strong>Goals</strong> – Their stated objectives and target dates</li>
          <li><strong>Last interaction</strong> – Your previous messages and their responses</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Use</h2>
        
        <DocStep stepNumber={1} title="Open the Composer">
          Navigate to any client's profile and click the <strong>AI Check-in</strong> button in the 
          messaging section, or access it from the client card actions menu.
        </DocStep>
        
        <DocStep stepNumber={2} title="Select a Tone">
          Choose between Motivational, Supportive, or Professional based on the situation and 
          your relationship with the client.
        </DocStep>
        
        <DocStep stepNumber={3} title="Generate the Message">
          Click <strong>Generate</strong> and the AI will compose a personalised message based on 
          the client's recent data and selected tone.
        </DocStep>
        
        <DocStep stepNumber={4} title="Review and Edit">
          Read through the generated message. Make any adjustments to match your voice or add 
          specific details the AI might have missed.
        </DocStep>
        
        <DocStep stepNumber={5} title="Send or Regenerate">
          If you're happy with the message, click <strong>Send</strong>. Otherwise, click 
          <strong>Regenerate</strong> to get a new draft with the same or different tone.
        </DocStep>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Regenerating Messages</h2>
        <p>
          If the first draft doesn't quite fit, you can regenerate as many times as needed. Each 
          regeneration produces a fresh message. Try switching tones if the content direction 
          isn't working.
        </p>
        
        <DocTip>
          You can also edit the generated message before regenerating to guide the AI in a 
          specific direction for the next attempt.
        </DocTip>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">When to Use AI vs Manual Messages</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-primary mb-2">Use AI Composer When:</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Sending routine weekly check-ins</li>
              <li>Following up on progress after a few days</li>
              <li>Motivating clients who've been consistent</li>
              <li>Re-engaging clients who've been quiet</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-primary mb-2">Write Manually When:</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Discussing sensitive personal matters</li>
              <li>Responding to specific questions</li>
              <li>Sharing detailed plan changes</li>
              <li>Celebrating major milestones personally</li>
            </ul>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
