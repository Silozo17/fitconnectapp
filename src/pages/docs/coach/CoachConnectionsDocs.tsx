import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, MessageSquare, Eye, Network, Shield } from "lucide-react";

export default function CoachConnectionsDocs() {
  return (
    <DocsLayout
      title="Client Connections | FitConnect Coach Guide"
      description="Accept connection requests and manage your client relationships on the platform."
      breadcrumbs={[
        { label: "Coach Guide", href: "/docs/coach" },
        { label: "Connections" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for coaches who want to network with other fitness professionals on 
            FitConnect. Connections allow you to collaborate, refer clients, and build relationships 
            with coaches in complementary specialties.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  Professional Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build a network of trusted coaches for collaboration and referrals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Connection Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send and receive connection requests from other coaches on the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Profile Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View connected coaches' profiles and specialties for referral purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Direct Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Message your connections directly to discuss referrals or collaboration.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why Build Connections</h2>
          <p className="text-muted-foreground mb-4">
            A strong professional network benefits your coaching business:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Refer clients to specialists when they need services you don't offer</li>
            <li>Receive referrals from coaches whose clients need your specialty</li>
            <li>Collaborate on clients who need multiple types of coaching</li>
            <li>Share knowledge and best practices with peers</li>
            <li>Build a support network of professionals who understand your work</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How Connections Work</h2>
          <p className="text-muted-foreground mb-4">
            Connections are mutual relationships between coaches:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Connection vs Client</h3>
              <p className="text-sm text-muted-foreground">
                Connections are coach-to-coach relationships. They're separate from your client 
                roster. Connected coaches don't see your client data or business metrics.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Mutual Acceptance</h3>
              <p className="text-sm text-muted-foreground">
                Both coaches must accept the connection. You send a request, they approve it, 
                and you become connected.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Connection Benefits</h3>
              <p className="text-sm text-muted-foreground">
                Once connected, you can message each other, see each other in your connections 
                list, and easily refer clients.
              </p>
            </div>
          </div>
        </section>

        {/* Sending Connection Requests */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Sending a Connection Request</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Find a Coach">
              Browse coaches in the marketplace or search for coaches by specialty or location.
            </DocStep>

            <DocStep stepNumber={2} title="View Their Profile">
              Click on a coach to view their full profile, credentials, and services.
            </DocStep>

            <DocStep stepNumber={3} title="Click Connect">
              If you'd like to connect, click the "Connect" button on their profile.
            </DocStep>

            <DocStep stepNumber={4} title="Add a Message (Optional)">
              Include a brief message introducing yourself and why you'd like to connect.
            </DocStep>

            <DocStep stepNumber={5} title="Wait for Response">
              The other coach will receive your request and can accept or decline it.
            </DocStep>
          </div>

          <DocTip className="mt-4">
            Personalised connection requests have a higher acceptance rate. Mention something 
            specific about their profile or how you might collaborate.
          </DocTip>
        </section>

        {/* Managing Requests */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Managing Connection Requests</h2>
          <p className="text-muted-foreground mb-4">
            View and manage incoming and outgoing requests:
          </p>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Pending Incoming</h3>
              <p className="text-sm text-muted-foreground">
                See requests from coaches who want to connect with you. Review their profile 
                before accepting or declining.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Pending Outgoing</h3>
              <p className="text-sm text-muted-foreground">
                Track requests you've sent that are awaiting response. You can cancel pending 
                requests if needed.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Connected</h3>
              <p className="text-sm text-muted-foreground">
                View all your current connections with quick access to their profiles and 
                messaging.
              </p>
            </div>
          </div>
        </section>

        {/* Using Connections */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Using Your Connections
          </h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Client Referrals</h3>
              <p className="text-sm text-muted-foreground">
                When a client needs services you don't offer (e.g., nutrition coaching, 
                physiotherapy), recommend a connected coach you trust.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together on clients who benefit from multiple specialties. Message your 
                connection to coordinate care.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Knowledge Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Exchange ideas, discuss industry trends, or seek advice from experienced 
                peers in your network.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Boundaries
          </h2>
          <DocInfo>
            Connections are about professional networking. Connected coaches cannot see your 
            client list, revenue, or private business data.
          </DocInfo>
          <div className="mt-4 bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-muted-foreground">
              What connections can see:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Your public profile information</li>
              <li>Your services and pricing (public)</li>
              <li>Your published transformations</li>
              <li>That you're connected (mutual visibility)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              What connections cannot see:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Your client list or client data</li>
              <li>Your revenue or financial information</li>
              <li>Your booking calendar details</li>
              <li>Your private notes or communications</li>
            </ul>
          </div>
        </section>

        {/* Removing Connections */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Removing a Connection</h2>
          <p className="text-muted-foreground mb-4">
            You can remove a connection at any time:
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Go to Connections">
              Navigate to your Connections list from your dashboard.
            </DocStep>

            <DocStep stepNumber={2} title="Find the Coach">
              Locate the connection you want to remove.
            </DocStep>

            <DocStep stepNumber={3} title="Click Remove">
              Select the remove or disconnect option. Confirm when prompted.
            </DocStep>
          </div>

          <DocInfo className="mt-4">
            The other coach won't be notified when you remove them. You can reconnect in the 
            future by sending a new request.
          </DocInfo>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Is there a limit to how many connections I can have?</h3>
              <p className="text-sm text-muted-foreground">
                No, you can connect with as many coaches as you like. Build the network that 
                works for your business.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I message a coach before connecting?</h3>
              <p className="text-sm text-muted-foreground">
                You can include a message with your connection request. Full messaging is 
                available once both parties accept the connection.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Do connections affect my search ranking?</h3>
              <p className="text-sm text-muted-foreground">
                No, the number of connections doesn't directly affect your visibility in search 
                results. Rankings are based on other factors like reviews and completeness.
              </p>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can clients see my connections?</h3>
              <p className="text-sm text-muted-foreground">
                No, your connection list is private. Clients cannot see which coaches you're 
                connected with.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
