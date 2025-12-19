import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { Users, UserPlus, MessageCircle, Trophy, Shield, Bell } from "lucide-react";

export default function ClientConnectionsDocs() {
  return (
    <DocsLayout
      title="Connections & Friends"
      description="Connect with other FitConnect members for motivation and friendly competition."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Connections" }
      ]}
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          What Are Connections?
        </h2>
        <p className="text-muted-foreground mb-4">
          Connections are other FitConnect members you've connected with. This feature helps 
          you build a supportive community, compete on leaderboards with friends, and stay 
          motivated together.
        </p>
        <p className="text-muted-foreground">
          Your connections can see your public achievements and leaderboard position, and 
          you can cheer each other on.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-500" />
          Adding Connections
        </h2>
        <DocStep stepNumber={1} title="Find members">
          Search by username or display name in the <strong>Connections</strong> section.
        </DocStep>
        <DocStep stepNumber={2} title="Send request">
          Click &quot;Connect&quot; to send a connection request.
        </DocStep>
        <DocStep stepNumber={3} title="Wait for acceptance">
          The other person will receive a notification and can accept or decline.
        </DocStep>
        <DocStep stepNumber={4} title="Connected!">
          Once accepted, you'll appear in each other's connections list.
        </DocStep>
        <DocTip>
          You can also connect via QR code - perfect for meeting gym buddies in person!
        </DocTip>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Managing Requests
        </h2>
        <p className="text-muted-foreground mb-4">
          View and manage connection requests from the Connections tab:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Pending Requests</h3>
            <p className="text-sm text-muted-foreground">
              See requests waiting for your response. Accept or decline each one.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Sent Requests</h3>
            <p className="text-sm text-muted-foreground">
              View requests you've sent that are awaiting a response. Cancel if needed.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Competing with Friends
        </h2>
        <p className="text-muted-foreground mb-4">
          Connections unlock social features that make fitness more fun:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Friends leaderboard</strong> - Compare XP and progress with your connections</li>
          <li><strong>Challenge together</strong> - Invite friends to join challenges with you</li>
          <li><strong>Cheer reactions</strong> - Send encouragement when friends hit milestones</li>
          <li><strong>Activity feed</strong> - See when connections earn badges or complete challenges</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          Messaging Connections
        </h2>
        <p className="text-muted-foreground mb-4">
          Stay in touch with your fitness friends:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Send direct messages to connections</li>
          <li>Share workout progress and achievements</li>
          <li>Coordinate workout times and meet-ups</li>
          <li>Share tips and motivation</li>
        </ul>
        <DocTip>
          Messaging is only available between mutual connections for privacy.
        </DocTip>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Privacy Controls
        </h2>
        <p className="text-muted-foreground mb-4">
          You control what your connections can see:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Profile Visibility</h3>
            <p className="text-sm text-muted-foreground">
              Choose what appears on your public profile visible to connections.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Leaderboard Display</h3>
            <p className="text-sm text-muted-foreground">
              Control whether you appear on public leaderboards or only friends leaderboards.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Block Users</h3>
            <p className="text-sm text-muted-foreground">
              Block anyone to prevent them from sending connection requests or messages.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Remove Connections</h3>
            <p className="text-sm text-muted-foreground">
              Remove connections at any time from your connections list.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
