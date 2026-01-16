import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymMessaging() {
  return (
    <DocsLayout
      title="Member Messaging"
      description="Communicate effectively with your members through in-app messages, email campaigns, push notifications, and SMS."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Member Messaging" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Keep your members informed and engaged with FitConnect's comprehensive messaging 
          tools. Send individual messages, broadcast to groups, or create automated campaigns.
        </p>
      </section>

      {/* Messaging Channels */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Messaging Channels</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-blue-500">In-App Messages</h4>
            <p className="text-sm text-muted-foreground">
              Send messages directly to members' FitConnect inbox. Best for: detailed 
              communications, attachments, and ongoing conversations.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-green-500">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Instant alerts to members' phones. Best for: time-sensitive updates, 
              class reminders, and quick announcements.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-purple-500">Email</h4>
            <p className="text-sm text-muted-foreground">
              Professional email communications with your gym branding. Best for: 
              newsletters, detailed information, and formal communications.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2 text-orange-500">SMS</h4>
            <p className="text-sm text-muted-foreground">
              Text messages directly to members' phones. Best for: urgent updates, 
              payment reminders, and reaching members without the app.
            </p>
          </div>
        </div>

        <DocInfo>
          Members can set their communication preferences in their profile. 
          Respect these settings to maintain trust and legal compliance.
        </DocInfo>
      </section>

      {/* Sending Individual Messages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Sending Individual Messages</h2>

        <DocStep stepNumber={1} title="Open Member Profile">
          <p>Navigate to the member you want to message and click their profile.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Click Message">
          <p>Click the "Message" or "Send Message" button on their profile.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Choose Channel">
          <p>Select how you want to send the message: in-app, email, SMS, or push notification.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Compose and Send">
          <p>Write your message, add any attachments if needed, and send.</p>
        </DocStep>

        <DocTip>
          Use the quick message feature from the member list to send messages 
          without opening the full profile.
        </DocTip>
      </section>

      {/* Broadcast Messages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Broadcast Messages</h2>

        <p className="text-muted-foreground mb-4">
          Send the same message to multiple members at once:
        </p>

        <DocStep stepNumber={1} title="Go to Messaging">
          <p>Navigate to Marketing → Messages or Communications → Broadcast.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Create New Broadcast">
          <p>Click "New Broadcast" and choose your message channel.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Select Recipients">
          <p className="mb-4">Choose who receives the message:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>All Members</strong> - Everyone in your database</li>
            <li><strong>Active Members</strong> - Currently active memberships only</li>
            <li><strong>Specific Membership</strong> - Members on a particular plan</li>
            <li><strong>Class Attendees</strong> - Members booked into a specific class</li>
            <li><strong>Custom Segment</strong> - Use tags and filters</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Compose Your Message">
          <p>Write your message. Use merge tags to personalise (e.g., {"{{first_name}}"})</p>
        </DocStep>

        <DocStep stepNumber={5} title="Schedule or Send">
          <p>Send immediately or schedule for a specific date and time.</p>
        </DocStep>

        <DocWarning>
          Broadcasting to large lists? Use email or push notifications. SMS charges 
          per message and can be costly for large groups.
        </DocWarning>
      </section>

      {/* Message Templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Message Templates</h2>

        <p className="text-muted-foreground mb-4">
          Save time with reusable templates for common messages:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Welcome Messages</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• New member welcome</li>
              <li>• Trial welcome</li>
              <li>• First class tips</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Reminders</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Class reminder</li>
              <li>• Membership renewal</li>
              <li>• Payment due</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Engagement</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We miss you</li>
              <li>• Milestone celebration</li>
              <li>• Referral invite</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Operations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Class cancellation</li>
              <li>• Schedule change</li>
              <li>• Facility closure</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-medium mb-4">Creating a Template</h3>
        <DocStep stepNumber={1} title="Go to Templates">
          <p>Navigate to Settings → Message Templates.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Create New Template">
          <p>Click "New Template", give it a name, and choose the channel type.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Write Your Template">
          <p>Compose your message using merge tags for personalisation.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Save">
          <p>Save the template. It's now available when composing messages.</p>
        </DocStep>
      </section>

      {/* Merge Tags */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Personalisation with Merge Tags</h2>

        <p className="text-muted-foreground mb-4">
          Make messages personal by inserting member data automatically:
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6 font-mono text-sm">
          <p>{"Hi {{first_name}},"}</p>
          <p className="mt-2">{"Your {{membership_name}} membership is renewing on {{renewal_date}}."}</p>
          <p className="mt-2">{"Thanks for being a member since {{join_date}}!"}</p>
        </div>

        <h3 className="text-lg font-medium mb-3">Available Merge Tags</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><code>{"{{first_name}}"}</code> - Member's first name</li>
          <li><code>{"{{last_name}}"}</code> - Member's last name</li>
          <li><code>{"{{email}}"}</code> - Member's email address</li>
          <li><code>{"{{membership_name}}"}</code> - Current membership plan</li>
          <li><code>{"{{renewal_date}}"}</code> - Next renewal date</li>
          <li><code>{"{{join_date}}"}</code> - Date they joined</li>
          <li><code>{"{{last_visit}}"}</code> - Most recent check-in</li>
          <li><code>{"{{gym_name}}"}</code> - Your gym's name</li>
        </ul>
      </section>

      {/* Automated Messages */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Automated Messages</h2>

        <p className="text-muted-foreground mb-4">
          Set up messages that send automatically based on triggers:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">Welcome Sequence</h4>
            <p className="text-sm text-muted-foreground">
              Send a series of emails over the first few weeks to onboard new members.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">Birthday Message</h4>
            <p className="text-sm text-muted-foreground">
              Automatic birthday wishes with an optional discount or free class.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">Absence Follow-Up</h4>
            <p className="text-sm text-muted-foreground">
              Check in with members who haven't visited in X days.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1">Renewal Reminders</h4>
            <p className="text-sm text-muted-foreground">
              Remind members before their membership expires.
            </p>
          </div>
        </div>

        <DocTip>
          Combine automated messages with your lead nurturing and retention strategies 
          in the Marketing & Automations section.
        </DocTip>
      </section>

      {/* Message History */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Message History & Analytics</h2>
        
        <p className="text-muted-foreground mb-4">
          Track all communications and measure effectiveness:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Sent Messages</strong> - View all outbound messages</li>
          <li><strong>Open Rates</strong> - Track email and push notification opens</li>
          <li><strong>Click Rates</strong> - See how many clicked your links</li>
          <li><strong>Delivery Status</strong> - Monitor failed deliveries</li>
          <li><strong>Unsubscribes</strong> - Track who has opted out</li>
        </ul>

        <DocInfo>
          All member communications are logged in their profile history. 
          Staff can see what messages a member has received.
        </DocInfo>
      </section>
    </DocsLayout>
  );
}
