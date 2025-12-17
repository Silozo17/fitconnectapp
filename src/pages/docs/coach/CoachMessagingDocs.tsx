import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { MessageSquare, FileText, Zap, Send } from "lucide-react";

export default function CoachMessagingDocs() {
  return (
    <DocsLayout
      title="Messaging & Templates"
      description="Learn how to communicate with clients, use quick actions, and create reusable message templates."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Messaging & Templates" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Messaging Clients
        </h2>
        <p className="text-muted-foreground">
          Stay connected with your clients through real-time messaging.
        </p>

        <DocStep number={1} title="Access Messages">
          Go to <strong>Messages</strong> from your dashboard sidebar to see all 
          your conversations.
        </DocStep>

        <DocStep number={2} title="Start a Conversation">
          Click <strong>New Message</strong> to start a conversation with any of 
          your connected clients.
        </DocStep>

        <DocStep number={3} title="Real-Time Chat">
          Messages are delivered instantly. You'll see typing indicators when 
          clients are responding and read receipts when messages are seen.
        </DocStep>

        <DocTip type="info">
          The client side panel shows their assigned plans and packages so you can 
          quickly reference their current programming while chatting.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Quick Actions
        </h2>
        <p className="text-muted-foreground">
          Use quick actions to send formatted information without typing everything manually.
        </p>

        <DocStep number={1} title="Send Pricing">
          Click the pricing quick action to send a formatted card showing your 
          session rates and packages.
        </DocStep>

        <DocStep number={2} title="Send Booking Link">
          Share a direct booking link so clients can easily schedule their next session.
        </DocStep>

        <DocStep number={3} title="Request Payment">
          Send a payment request for outstanding balances or custom services.
        </DocStep>

        <DocTip type="tip">
          Quick actions save time and ensure clients receive consistent, 
          professional-looking information.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Message Templates
        </h2>
        <p className="text-muted-foreground">
          Create reusable templates for common messages to save time.
        </p>

        <DocStep number={1} title="Create a Template">
          Go to <strong>Settings → Message Templates</strong> and click 
          <strong>Create Template</strong>.
        </DocStep>

        <DocStep number={2} title="Organize by Category">
          Assign templates to categories: Welcome, Follow-up, Pricing, Plans, or General 
          for easy organization.
        </DocStep>

        <DocStep number={3} title="Use Templates">
          When messaging, click the template icon to browse and insert saved templates 
          with one click.
        </DocStep>

        <DocTip type="tip">
          Great templates to create: Welcome message for new clients, session reminder, 
          check-in message, plan update notification, and payment follow-up.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" />
          Communication Best Practices
        </h2>
        <p className="text-muted-foreground">
          Tips for effective client communication.
        </p>

        <DocStep number={1} title="Respond Promptly">
          Try to respond to client messages within a few hours during business hours. 
          Quick responses build trust and engagement.
        </DocStep>

        <DocStep number={2} title="Be Professional">
          Maintain a professional tone while being friendly and supportive. Your messages 
          reflect your coaching brand.
        </DocStep>

        <DocStep number={3} title="Set Expectations">
          Let clients know your typical response times and preferred communication hours 
          to manage expectations.
        </DocStep>

        <DocTip type="warning">
          Avoid sharing sensitive health advice via messaging. For medical concerns, 
          always recommend clients consult healthcare professionals.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
