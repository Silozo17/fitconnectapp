import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { FileText, Sparkles, Share2, Edit, Globe, Lock } from "lucide-react";

export default function CoachCaseStudiesDocs() {
  return (
    <DocsLayout
      title="AI Case Studies"
      description="Generate professional case studies from client data to showcase your coaching results and attract new clients."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Case Studies" }
      ]}
    >
      {/* Who This Is For */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Who This Is For
        </h2>
        <p className="text-muted-foreground">
          Coaches who want to create compelling success stories from their client transformations. 
          Case studies are powerful marketing tools that demonstrate your expertise and help 
          prospective clients understand what results they can expect.
        </p>
      </section>

      {/* What This Feature Does */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
        <p className="text-muted-foreground mb-4">
          AI Case Studies automatically generates professional narratives from your client's 
          journey data, including their goals, challenges, programme details, and measurable 
          outcomes. You can edit the generated content before publishing.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <Sparkles className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">AI-Generated Narrative</h3>
            <p className="text-sm text-muted-foreground">
              Transforms raw data into engaging, professional storytelling.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <Edit className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">Full Editing Control</h3>
            <p className="text-sm text-muted-foreground">
              Review and customise every section before publishing.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Feature Exists */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
        <p className="text-muted-foreground">
          Writing case studies is time-consuming, yet they are one of the most effective ways 
          to convert prospective clients. This feature removes the writing burden while ensuring 
          your success stories are presented professionally and compellingly.
        </p>
      </section>

      {/* How It Works */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <DocStep stepNumber={1} title="Select a Client">
            Choose a client whose transformation you want to showcase. Ideally, select clients 
            with comprehensive logged data and measurable results.
          </DocStep>
          <DocStep stepNumber={2} title="Request Client Consent">
            Before generating a case study, you must have the client's consent to use their 
            data and story. Send a consent request through the platform.
          </DocStep>
          <DocStep stepNumber={3} title="Generate the Case Study">
            Once consent is granted, click "Generate Case Study". The AI will analyse the 
            client's journey and create a structured narrative.
          </DocStep>
          <DocStep stepNumber={4} title="Review and Edit">
            Read through the generated content. Edit any sections, add personal touches, 
            adjust the tone, or add context the AI may have missed.
          </DocStep>
          <DocStep stepNumber={5} title="Publish or Save">
            Choose to publish the case study to your public profile or save it as a draft 
            for later refinement.
          </DocStep>
        </div>
      </section>

      {/* Case Study Structure */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Case Study Structure</h2>
        <p className="text-muted-foreground mb-4">
          Each generated case study includes the following sections:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Client Background</h3>
            <p className="text-sm text-muted-foreground">
              Age, initial fitness level, lifestyle factors, and any relevant challenges.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Goals & Challenges</h3>
            <p className="text-sm text-muted-foreground">
              What the client wanted to achieve and obstacles they faced.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">The Approach</h3>
            <p className="text-sm text-muted-foreground">
              Training methodology, nutrition strategy, and coaching philosophy applied.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Results & Outcomes</h3>
            <p className="text-sm text-muted-foreground">
              Measurable achievements: weight lost, strength gained, habits formed, etc.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Client Testimonial</h3>
            <p className="text-sm text-muted-foreground">
              If available, a quote or feedback from the client about their experience.
            </p>
          </div>
        </div>
      </section>

      {/* Publishing Options */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          Publishing Options
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <Globe className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">Public Profile</h3>
            <p className="text-sm text-muted-foreground">
              Publish to your coach profile where prospective clients can view it.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <Lock className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium mb-1">Private/Draft</h3>
            <p className="text-sm text-muted-foreground">
              Keep as a draft for internal reference or share via private link.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Consent */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Privacy & Consent</h2>
        <DocWarning>
          You must obtain explicit client consent before publishing any case study. Publishing 
          without consent violates platform terms and privacy regulations.
        </DocWarning>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
          <li>Consent requests are tracked in the system</li>
          <li>Clients can revoke consent at any time, requiring you to unpublish</li>
          <li>Anonymised case studies can be created if clients prefer privacy</li>
          <li>Photos require separate consent from data consent</li>
        </ul>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Limitations & Important Notes</h2>
        <DocInfo>
          The quality of generated case studies depends on the richness of client data. Clients 
          with minimal logging will produce less detailed narratives.
        </DocInfo>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
          <li>AI-generated content should always be reviewed for accuracy</li>
          <li>Generated testimonials are suggestions only—use actual client quotes when possible</li>
          <li>Case studies cannot be generated for clients who haven't consented</li>
          <li>Editing is saved automatically as drafts</li>
        </ul>
      </section>

      {/* Common Use Cases */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Common Use Cases</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Marketing Your Services</h3>
            <p className="text-sm text-muted-foreground">
              Publish case studies on your profile to demonstrate proven results to prospective clients.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Social Media Content</h3>
            <p className="text-sm text-muted-foreground">
              Use excerpts from case studies for social media posts and marketing campaigns.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Portfolio Building</h3>
            <p className="text-sm text-muted-foreground">
              Maintain a collection of success stories to share with gyms, employers, or partners.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Can I create case studies for clients not on the platform?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can create manual case studies by entering the information yourself, 
              but AI generation requires platform data.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">How long does generation take?</h3>
            <p className="text-sm text-muted-foreground">
              Typically 10-30 seconds depending on the amount of client data being analysed.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Can I regenerate a case study?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can regenerate the AI narrative at any time. This will create a new 
              version while preserving your previous edits as a separate draft.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">What if a client revokes consent?</h3>
            <p className="text-sm text-muted-foreground">
              You will be notified immediately and must unpublish the case study within 48 hours. 
              The platform may auto-unpublish if you don't take action.
            </p>
          </div>
        </div>
      </section>

      <DocTip>
        The best case studies come from clients with at least 8-12 weeks of consistent data 
        logging. Consider waiting until a client reaches a significant milestone before generating.
      </DocTip>
    </DocsLayout>
  );
}
