import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymMarketing() {
  return (
    <DocsLayout
      title="Marketing & Automations"
      description="Create email and SMS campaigns, set up promotions, configure automated member communications, and grow your gym."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Marketing & Automations" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Grow your membership and keep members engaged with our marketing tools. From 
          one-off campaigns to fully automated member journeys, reach the right people 
          at the right time.
        </p>
      </section>

      {/* Campaigns */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Creating Campaigns</h2>

        <h3 className="text-lg font-medium mb-3">Campaign Types</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Email Campaigns</h4>
            <p className="text-sm text-muted-foreground">
              Send newsletters, announcements, and promotions to your member list.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">SMS Campaigns</h4>
            <p className="text-sm text-muted-foreground">
              Send time-sensitive messages like flash sales or urgent announcements.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Reach members who have the app installed with instant notifications.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Multi-Channel</h4>
            <p className="text-sm text-muted-foreground">
              Combine email, SMS, and push for maximum reach on important messages.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-3">Building a Campaign</h3>
        <DocStep stepNumber={1} title="Select Your Audience">
          <p className="mb-4">Choose who should receive this campaign:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>All Members</strong> - Everyone with an active membership</li>
            <li><strong>Specific Plans</strong> - Members on certain membership types</li>
            <li><strong>By Tag</strong> - Members with specific tags</li>
            <li><strong>By Activity</strong> - Active, inactive, or new members</li>
            <li><strong>Custom Filter</strong> - Build your own criteria</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={2} title="Design Your Message">
          <p className="mb-4">Create your content using the drag-and-drop editor:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Choose a template or start from scratch</li>
            <li>Add images, buttons, and formatted text</li>
            <li>Use merge tags for personalization (e.g., {"{{first_name}}"})</li>
            <li>Preview on desktop and mobile</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Schedule or Send">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Send Now</strong> - Deliver immediately</li>
            <li><strong>Schedule</strong> - Pick a specific date and time</li>
            <li><strong>Optimal Time</strong> - Send when each member is most likely to engage</li>
          </ul>
          <DocTip className="mt-4">
            Test your email by sending a preview to yourself before launching to all members.
          </DocTip>
        </DocStep>
      </section>

      {/* Promotions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Promotions & Promo Codes</h2>

        <h3 className="text-lg font-medium mb-3">Creating a Promotion</h3>
        <p className="text-muted-foreground mb-4">
          Set up special offers to attract new members or reward existing ones:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Percentage Discount</strong> - e.g., 20% off first 3 months</li>
          <li><strong>Fixed Amount</strong> - e.g., £30 off joining fee</li>
          <li><strong>Free Period</strong> - e.g., First month free</li>
          <li><strong>Add-on Bonus</strong> - e.g., Free PT session with signup</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Promo Code Settings</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Code</strong> - The code members enter (e.g., NEWYEAR2024)</li>
          <li><strong>Valid Dates</strong> - When the promotion is active</li>
          <li><strong>Usage Limits</strong> - Maximum uses total or per person</li>
          <li><strong>Eligible Plans</strong> - Which memberships the code applies to</li>
          <li><strong>New Members Only</strong> - Restrict to first-time signups</li>
        </ul>
        <DocInfo>
          Track promo code usage in your analytics to see which promotions drive the 
          most signups.
        </DocInfo>
      </section>

      {/* Automations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Marketing Automations</h2>
        <p className="text-muted-foreground mb-4">
          Set up automated messages that trigger based on member actions:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Welcome Series</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: New member signs up
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Day 0: Welcome email with gym info and app download links</li>
              <li>Day 1: Tips for first workout</li>
              <li>Day 3: Class recommendations based on interests</li>
              <li>Day 7: Check-in asking how first week went</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Birthday Messages</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: Member's birthday
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Send birthday wishes</li>
              <li>Optional: Include a special offer or free class</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Re-Engagement</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: No check-in for 14 days
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Day 14: "We miss you" message</li>
              <li>Day 21: Offer incentive to return</li>
              <li>Day 30: Alert staff for personal outreach</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Membership Renewal</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: Membership renewal approaching
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>30 days before: Renewal reminder</li>
              <li>7 days before: Final reminder with renewal link</li>
              <li>After renewal: Thank you message</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Cancellation Prevention</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: Member initiates cancellation
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>Survey asking reason for leaving</li>
              <li>Offer alternatives (freeze, downgrade)</li>
              <li>Special retention offer if applicable</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Class Reminders</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Trigger: Member has upcoming class booking
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              <li>24 hours before: Reminder with class details</li>
              <li>2 hours before: Final reminder</li>
              <li>Reduces no-shows significantly</li>
            </ul>
          </div>
        </div>
        
        <DocWarning className="mt-6">
          Be mindful of message frequency. Too many automated messages can lead to 
          unsubscribes. Aim for helpful, not spammy.
        </DocWarning>
      </section>

      {/* Building Automations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Building Custom Automations</h2>

        <DocStep stepNumber={1} title="Define the Trigger">
          <p className="mb-4">What event starts this automation?</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Member action (signup, check-in, booking)</li>
            <li>Date-based (birthday, anniversary, expiry)</li>
            <li>Inactivity (no check-in for X days)</li>
            <li>Milestone (10th class, 6-month anniversary)</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={2} title="Set Conditions">
          <p className="mb-4">Add filters to control who enters the automation:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Membership type</li>
            <li>Member tags</li>
            <li>Location</li>
            <li>Previous automation history</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Add Actions">
          <p className="mb-4">What happens when triggered:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Send email, SMS, or push notification</li>
            <li>Wait for a period of time</li>
            <li>Add or remove tags</li>
            <li>Create a task for staff</li>
            <li>Update member record</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Activate">
          <p>Test with a sample member, then activate to process all matching members.</p>
        </DocStep>
      </section>

      {/* Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Marketing Analytics</h2>
        <p className="text-muted-foreground mb-4">
          Track the performance of your marketing efforts:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Email Metrics</strong> - Open rates, click rates, unsubscribes</li>
          <li><strong>SMS Metrics</strong> - Delivery rates, responses</li>
          <li><strong>Campaign ROI</strong> - Signups attributed to campaigns</li>
          <li><strong>Automation Performance</strong> - Completion rates, conversions</li>
          <li><strong>Promo Code Usage</strong> - Which offers perform best</li>
        </ul>
        <DocTip className="mt-4">
          A/B test your subject lines and send times to continuously improve engagement rates.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
