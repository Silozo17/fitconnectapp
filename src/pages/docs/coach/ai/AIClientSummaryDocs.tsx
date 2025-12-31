import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Brain, FileText, CheckCircle, Clock, Edit, Send, AlertTriangle } from "lucide-react";

export default function AIClientSummaryDocs() {
  return (
    <DocsLayout
      title="AI Client Summary"
      description="Automatically generate comprehensive progress summaries for your clients using AI analysis"
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach", href: "/docs/coach" },
        { label: "AI Tools", href: "/docs/coach/ai" },
        { label: "Client Summary" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This feature is for <strong>coaches on Enterprise tier</strong> who want to save time creating 
            client progress reports while maintaining a personal touch. It's ideal for coaches managing 
            multiple clients who need regular check-ins and progress updates.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            AI Client Summary automatically analyses your client's data and creates a comprehensive, 
            personalised progress report. Instead of spending 15-30 minutes reviewing data and writing 
            summaries for each client, the AI does the heavy lifting in seconds.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Brain className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Intelligent Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Reviews training logs, nutrition data, measurements, habits, and communication patterns
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Professional Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Generates well-written, encouraging summaries highlighting achievements and areas for focus
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Edit className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Coach Control</h3>
              <p className="text-sm text-muted-foreground">
                Review and edit every summary before sharing—you stay in control
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Send className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Easy Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share directly with clients via in-app messaging with one click
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Writing personalised progress summaries is valuable but time-consuming. Many coaches either:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Spend hours each week writing summaries, reducing time for actual coaching</li>
            <li>Skip summaries entirely, missing opportunities to motivate clients</li>
            <li>Send generic updates that don't feel personal</li>
          </ul>
          <p className="text-muted-foreground">
            AI Client Summary solves this by handling the analysis and initial writing, 
            freeing you to add your personal insights and coaching wisdom.
          </p>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Data Collection">
              When you request a summary, the AI gathers data the client has shared with you:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Training logs and workout completion rates</li>
                <li>Nutrition logs and meal adherence</li>
                <li>Progress measurements and photos (if shared)</li>
                <li>Habit completion streaks</li>
                <li>Session attendance</li>
                <li>Wearable data (steps, sleep, etc.)</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={2} title="AI Analysis">
              The AI identifies patterns, achievements, and areas needing attention:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Week-over-week progress trends</li>
                <li>Consistency patterns (what's working, what's slipping)</li>
                <li>Micro-wins worth celebrating</li>
                <li>Potential plateaus or regressions</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={3} title="Summary Generation">
              A professionally written summary is created with:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Personalised greeting using the client's name</li>
                <li>Key achievements and wins</li>
                <li>Progress toward goals</li>
                <li>Gentle areas for improvement</li>
                <li>Encouraging closing message</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={4} title="Coach Review">
              You review the generated summary in the approval workflow. You can:
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Approve as-is</li>
                <li>Edit any section</li>
                <li>Add personal notes or comments</li>
                <li>Regenerate if needed</li>
              </ul>
            </DocStep>

            <DocStep stepNumber={5} title="Share with Client">
              Once approved, share the summary directly via in-app messaging. 
              The client receives a notification and can view their personalised report.
            </DocStep>
          </div>
        </section>

        {/* How to Set It Up */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Set It Up</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Navigate to Client Detail">
              Go to Dashboard → Clients → Select a client
            </DocStep>
            <DocStep stepNumber={2} title="Open Summaries Tab">
              Click the "Summaries" tab in the client detail view
            </DocStep>
            <DocStep stepNumber={3} title="Generate Summary">
              Click "Generate New Summary" to create an AI-powered report
            </DocStep>
            <DocStep stepNumber={4} title="Review and Approve">
              Review the generated content, make edits if needed, then approve
            </DocStep>
            <DocStep stepNumber={5} title="Share">
              Click "Share with Client" to send via messaging
            </DocStep>
          </div>
          <DocTip className="mt-4">
            You can also schedule weekly summaries to be generated automatically. 
            Enable this in Automations → AI Summaries.
          </DocTip>
        </section>

        {/* What Happens After Setup */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What Happens After Setup</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Generated summaries appear in the client's Summaries tab</li>
            <li>Summaries remain in "Pending Review" until you approve them</li>
            <li>Approved summaries move to "Ready to Share" status</li>
            <li>Shared summaries are logged with timestamp and delivery status</li>
            <li>Clients see shared summaries in their Messages</li>
          </ul>
        </section>

        {/* Privacy & Data Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Privacy & Data Usage</h2>
          <DocWarning>
            AI summaries only use data the client has explicitly shared with you. 
            If a client revokes data sharing permissions, that data will not be included in future summaries.
          </DocWarning>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>• AI analysis is processed securely and not stored beyond the summary generation</p>
            <p>• Client data is never used to train AI models</p>
            <p>• Summaries are only visible to you and the client (once shared)</p>
            <p>• You can delete summaries at any time</p>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Limitations & Important Notes</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">AI is a starting point, not a replacement</p>
                <p className="text-sm text-muted-foreground">
                  Always review AI-generated content. Add your personal insights and coaching expertise.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Data quality affects output</p>
                <p className="text-sm text-muted-foreground">
                  Clients who log consistently get better, more detailed summaries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Not for medical advice</p>
                <p className="text-sm text-muted-foreground">
                  AI summaries should never replace professional medical guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Use Cases */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Common Use Cases</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Weekly Progress Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate summaries every Sunday evening, review Monday morning, 
                and send to clients to start their week with motivation.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">End-of-Program Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Create comprehensive summaries at the end of training blocks 
                to celebrate achievements and plan next steps.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Re-engagement</h3>
              <p className="text-sm text-muted-foreground">
                For clients who've been less active, generate a summary highlighting 
                their past wins to reignite motivation.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Can clients tell it's AI-generated?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The summary is sent as a message from you. Clients see it as a personal message. 
                Whether you disclose AI assistance is your choice.
              </p>
            </div>
            <div>
              <h3 className="font-medium">What if a client has no recent data?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The AI will note the lack of data and suggest encouraging the client 
                to log their activities. You can edit this before sharing.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I regenerate a summary?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, click "Regenerate" to create a fresh summary. Each generation may 
                vary slightly in wording while covering the same data.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How long does generation take?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Typically 5-15 seconds depending on how much client data needs to be analysed.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Is there a limit to how many summaries I can generate?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enterprise tier includes unlimited AI summary generations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
