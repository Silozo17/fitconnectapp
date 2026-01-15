import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymLeads() {
  return (
    <DocsLayout
      title="Lead Management"
      description="Capture leads, track them through your sales pipeline, schedule follow-ups, and convert prospects into gym members."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Lead Management" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Turn interested prospects into paying members with our lead management system. 
          Capture leads from multiple sources, track their journey, and never miss a follow-up.
        </p>
      </section>

      {/* Capturing Leads */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Capturing Leads</h2>
        
        <h3 className="text-lg font-medium mb-3">Lead Sources</h3>
        <p className="text-muted-foreground mb-4">
          Leads can come from various channels:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Website Form</h4>
            <p className="text-sm text-muted-foreground">
              Embed a signup form on your website that automatically creates leads.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Social Media</h4>
            <p className="text-sm text-muted-foreground">
              Link Facebook/Instagram lead ads to import leads directly.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Walk-Ins</h4>
            <p className="text-sm text-muted-foreground">
              Staff manually add leads when prospects visit the gym.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Referrals</h4>
            <p className="text-sm text-muted-foreground">
              Members refer friends and leads are tracked with referral source.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Trial Classes</h4>
            <p className="text-sm text-muted-foreground">
              People who book trial classes are automatically added as leads.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Events</h4>
            <p className="text-sm text-muted-foreground">
              Collect contact info at open days, seminars, or competitions.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-3">Adding a Lead Manually</h3>
        <DocStep stepNumber={1} title="Navigate to Leads">
          <p>Go to your gym dashboard and click "Leads" in the sidebar.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Add Lead">
          <p className="mb-4">Enter the prospect's information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Name</strong> - First and last name</li>
            <li><strong>Contact</strong> - Email and/or phone number</li>
            <li><strong>Source</strong> - Where they heard about you</li>
            <li><strong>Interests</strong> - What classes or services they're interested in</li>
            <li><strong>Notes</strong> - Any additional information from the conversation</li>
          </ul>
        </DocStep>
      </section>

      {/* Lead Pipeline */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Lead Pipeline</h2>
        <p className="text-muted-foreground mb-4">
          Track leads through your sales process using pipeline stages:
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div>
              <h4 className="font-medium">New</h4>
              <p className="text-sm text-muted-foreground">Just entered the system, needs initial contact</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div>
              <h4 className="font-medium">Contacted</h4>
              <p className="text-sm text-muted-foreground">Initial outreach made, awaiting response</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <div>
              <h4 className="font-medium">Tour Scheduled</h4>
              <p className="text-sm text-muted-foreground">Booked for a gym visit or trial class</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <div>
              <h4 className="font-medium">Trial Completed</h4>
              <p className="text-sm text-muted-foreground">Visited the gym, follow-up needed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div>
              <h4 className="font-medium">Converted</h4>
              <p className="text-sm text-muted-foreground">Became a paying member</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div>
              <h4 className="font-medium">Lost</h4>
              <p className="text-sm text-muted-foreground">Not interested or went elsewhere</p>
            </div>
          </div>
        </div>

        <DocTip>
          Customise your pipeline stages in Settings → Leads to match your sales process.
        </DocTip>
      </section>

      {/* Follow-Up System */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Follow-Up System</h2>

        <h3 className="text-lg font-medium mb-3">Scheduling Follow-Ups</h3>
        <p className="text-muted-foreground mb-4">
          Never forget to follow up with a lead:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Set a follow-up date and time when updating a lead</li>
          <li>Choose follow-up type: call, email, SMS, or meeting</li>
          <li>Add notes about what to discuss</li>
          <li>Assign to a specific staff member</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Follow-Up Reminders</h3>
        <p className="text-muted-foreground mb-4">
          Staff receive reminders for scheduled follow-ups:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Push notification on mobile app</li>
          <li>Email reminder if preferred</li>
          <li>Dashboard widget showing today's follow-ups</li>
          <li>Overdue follow-ups highlighted in red</li>
        </ul>
        <DocInfo>
          Configure reminder timing in Settings. A 15-minute advance reminder works well 
          for most teams.
        </DocInfo>

        <h3 className="text-lg font-medium mb-3 mt-6">Activity Logging</h3>
        <p className="text-muted-foreground mb-4">
          Every interaction is logged on the lead's profile:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Calls made and outcomes</li>
          <li>Emails sent and opened</li>
          <li>SMS messages</li>
          <li>Notes from conversations</li>
          <li>Stage changes and who made them</li>
        </ul>
      </section>

      {/* Automated Lead Nurturing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Automated Lead Nurturing</h2>
        <p className="text-muted-foreground mb-4">
          Set up automated sequences to nurture leads:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Welcome Sequence</h4>
            <p className="text-sm text-muted-foreground">
              Automatically send a welcome email when a new lead is captured, followed by 
              information about your gym over the next few days.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Trial Reminders</h4>
            <p className="text-sm text-muted-foreground">
              Send reminder emails before a scheduled trial class, and follow-up messages 
              after they attend.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Re-engagement</h4>
            <p className="text-sm text-muted-foreground">
              Automatically reach out to leads that have gone cold, offering special 
              incentives to return.
            </p>
          </div>
        </div>

        <DocTip className="mt-6">
          Automated emails should feel personal. Use merge tags to include the lead's 
          name and interests.
        </DocTip>
      </section>

      {/* Converting Leads */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Converting Leads to Members</h2>

        <DocStep stepNumber={1} title="Open the Lead">
          <p>Find the lead in your pipeline and open their profile.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Convert to Member">
          <p>The lead's information will be pre-filled in the new member form.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Select Membership">
          <p>Choose the membership plan they're signing up for and process payment.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Complete Conversion">
          <p className="mb-4">
            The lead is moved to "Converted" status and a member profile is created.
          </p>
          <DocInfo>
            The conversion is tracked in your analytics, showing which lead sources have 
            the best conversion rates.
          </DocInfo>
        </DocStep>
      </section>

      {/* Lead Reporting */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Lead Analytics</h2>
        <p className="text-muted-foreground mb-4">
          Track your lead generation and conversion performance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Lead Volume</strong> - How many leads are coming in</li>
          <li><strong>Source Performance</strong> - Which channels bring the most leads</li>
          <li><strong>Conversion Rate</strong> - Percentage of leads becoming members</li>
          <li><strong>Time to Convert</strong> - Average days from lead to member</li>
          <li><strong>Staff Performance</strong> - Who's best at closing leads</li>
          <li><strong>Pipeline Health</strong> - Leads stuck in each stage</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
