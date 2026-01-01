import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Link } from "react-router-dom";
import { Video, Settings, CheckCircle, XCircle, Shield, HelpCircle, ExternalLink } from "lucide-react";

export default function ZoomIntegration() {
  return (
    <DocsLayout
      title="Zoom Integration | FitConnect Guide"
      description="Connect Zoom for automatic meeting links on online sessions. Video conferencing for coaches."
      breadcrumbs={[
        { label: "Integrations", href: "/docs/integrations" },
        { label: "Zoom" }
      ]}
    >
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: 29 December 2025
      </p>

      {/* Overview Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect is a fitness coaching platform that connects clients with professional coaches including personal trainers, nutritionists, boxing coaches, and MMA instructors. The Zoom integration allows coaches to seamlessly create video meetings for online coaching sessions.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-foreground">Who can use it:</strong>
              <span className="text-muted-foreground"> Only coaches can connect and use the Zoom integration. Clients do not need to connect Zoom to join sessions.</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-foreground">What it does:</strong>
              <span className="text-muted-foreground"> Automatically generates Zoom meeting links when coaches schedule online sessions with clients.</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-foreground">How clients join:</strong>
              <span className="text-muted-foreground"> Clients receive meeting links in their session details and email notifications. No Zoom account is required for clients to join.</span>
            </div>
          </div>
        </div>
      </section>

      {/* How to Add/Install Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          How to Add the Integration
        </h2>
        <p className="text-muted-foreground mb-4">
          The Zoom integration is added from within the FitConnect application. There is no separate installation process from the Zoom Marketplace.
        </p>
        
        <div className="bg-card/50 border border-border rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Prerequisites</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              A FitConnect coach account (clients cannot connect Zoom)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              You must be logged into your FitConnect account
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              A Zoom account with permission to create meetings
            </li>
          </ul>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-4">
          <h3 className="font-medium mb-3">Where to Find the Integration</h3>
          <p className="text-muted-foreground">
            Navigate to <strong>Coach Dashboard → Integrations</strong>. The Zoom integration is located in the <strong>Video Conferencing</strong> section.
          </p>
        </div>
      </section>

      {/* How to Connect Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          How to Connect Zoom
        </h2>
        <p className="text-muted-foreground mb-4">
          Follow these steps to connect your Zoom account to FitConnect:
        </p>
        
        <div className="space-y-1">
          <DocStep stepNumber={1} title="Log into FitConnect">
            Sign in to your FitConnect coach account at getfitconnect.co.uk
          </DocStep>
          
          <DocStep stepNumber={2} title="Navigate to Integrations">
            From your Coach Dashboard, click on "Integrations" in the left sidebar menu.
          </DocStep>
          
          <DocStep stepNumber={3} title="Find the Zoom Card">
            Scroll to the "Video Conferencing" section and locate the Zoom card.
          </DocStep>
          
          <DocStep stepNumber={4} title="Click Connect Zoom">
            Click the "Connect" button on the Zoom card. You will be redirected to Zoom's authorisation page.
          </DocStep>
          
          <DocStep stepNumber={5} title="Authorise FitConnect">
            On Zoom's page, log in to your Zoom account if prompted, then click "Authorise" to grant FitConnect permission to create meetings on your behalf.
          </DocStep>
          
          <DocStep stepNumber={6} title="Confirm Connection">
            After authorisation, you will be automatically redirected back to FitConnect. The Zoom card will now show a "Connected" status with a green indicator.
          </DocStep>
        </div>

        <DocTip>
          Once connected, you can enable "Auto-create meetings" to automatically generate Zoom links for all new online session bookings.
        </DocTip>
      </section>

      {/* How to Use Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          How to Use the Zoom Integration
        </h2>
        <p className="text-muted-foreground mb-4">
          After connecting Zoom, the following features become available:
        </p>

        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Automatic Meeting Creation</h3>
            <p className="text-muted-foreground text-sm">
              When "Auto-create meetings" is enabled, FitConnect automatically generates a unique Zoom meeting link for each online session you schedule. The meeting link is attached to the session details.
            </p>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Meeting Links in Sessions</h3>
            <p className="text-muted-foreground text-sm">
              Zoom meeting links appear in the session details for both you and your client. Clients can click the link to join the meeting directly from their dashboard or from email notifications.
            </p>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Manual Meeting Toggle</h3>
            <p className="text-muted-foreground text-sm">
              You can toggle "Auto-create meetings" on or off at any time from the Integrations page. When disabled, you can still manually create meetings when needed.
            </p>
          </div>
        </div>

        <DocInfo>
          Only online sessions receive Zoom meeting links. In-person sessions are not affected by this integration.
        </DocInfo>
      </section>

      {/* How to Disconnect Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-primary" />
          How to Disconnect Zoom
        </h2>
        <p className="text-muted-foreground mb-4">
          You can disconnect your Zoom account at any time. Follow these steps:
        </p>

        <div className="space-y-1">
          <DocStep stepNumber={1} title="Go to Integrations">
            Navigate to Coach Dashboard → Integrations.
          </DocStep>
          
          <DocStep stepNumber={2} title="Find the Connected Zoom Card">
            Locate the Zoom card in the Video Conferencing section. It should show a "Connected" status.
          </DocStep>
          
          <DocStep stepNumber={3} title="Click Disconnect">
            Click the "Disconnect" button on the Zoom card.
          </DocStep>
          
          <DocStep stepNumber={4} title="Confirm Disconnection">
            Confirm that you want to disconnect Zoom. Your Zoom account will be unlinked from FitConnect.
          </DocStep>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-4 mt-4">
          <h3 className="font-medium mb-2">What Happens When You Disconnect</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              New sessions will no longer have Zoom meeting links generated
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Existing meeting links for scheduled sessions remain valid until the session time
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Your stored access tokens are deleted from FitConnect
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              You can reconnect your Zoom account at any time
            </li>
          </ul>
        </div>

        <DocTip>
          You can also revoke FitConnect's access directly from your Zoom account settings at zoom.us under Connected Apps.
        </DocTip>
      </section>

      {/* Permissions & Data Usage Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Permissions & Data Usage
        </h2>
        <p className="text-muted-foreground mb-4">
          FitConnect requests the minimum permissions necessary to create meetings for your coaching sessions.
        </p>

        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Permissions Requested</h3>
            <div className="space-y-3">
              <div>
                <strong className="text-sm text-foreground">Create Meetings</strong>
                <p className="text-muted-foreground text-sm">
                  Allows FitConnect to create Zoom meetings on your behalf when scheduling online coaching sessions.
                </p>
              </div>
              <div>
                <strong className="text-sm text-foreground">View User Information</strong>
                <p className="text-muted-foreground text-sm">
                  Allows FitConnect to retrieve your Zoom user ID to associate meetings with your account.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Data We Store</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <strong>OAuth Access Token:</strong> Used to create meetings on your behalf
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <strong>OAuth Refresh Token:</strong> Used to maintain your connection without requiring re-authorisation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <strong>Zoom User ID:</strong> Used to identify your Zoom account
              </li>
            </ul>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Data We Do NOT Access</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                Meeting recordings or transcripts
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                Chat messages or meeting history
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                Your personal Zoom account details
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                Meeting participants' personal information
              </li>
            </ul>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Data Security</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                All tokens are encrypted at rest
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                Tokens are transmitted securely over HTTPS
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                No Zoom data is shared with third parties
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                Tokens are deleted when you disconnect
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Troubleshooting
        </h2>

        <div className="space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Connection Failed or Error During Authorisation</h3>
            <p className="text-muted-foreground text-sm mb-2">
              If you see an error when trying to connect:
            </p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Ensure you are using a Zoom account with meeting creation permissions</li>
              <li>• Check that your Zoom account is in good standing</li>
              <li>• Try logging out of Zoom and logging back in before authorising</li>
              <li>• Clear your browser cache and try again</li>
            </ul>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Meeting Links Not Appearing</h3>
            <p className="text-muted-foreground text-sm mb-2">
              If Zoom links are not being generated for sessions:
            </p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Verify that "Auto-create meetings" is enabled in the Integrations page</li>
              <li>• Confirm the session is marked as "Online" not "In Person"</li>
              <li>• Check that your Zoom connection is still active (shows "Connected")</li>
            </ul>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Access Expired or Connection Lost</h3>
            <p className="text-muted-foreground text-sm mb-2">
              If your Zoom connection has expired:
            </p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Go to Coach Dashboard → Integrations</li>
              <li>• Click "Disconnect" on the Zoom card</li>
              <li>• Click "Connect" to re-authorise your Zoom account</li>
            </ul>
          </div>

          <div className="bg-card/50 border border-border rounded-lg p-4">
            <h3 className="font-medium mb-2">Revoked Access from Zoom</h3>
            <p className="text-muted-foreground text-sm">
              If you revoked FitConnect's access from your Zoom account settings, your connection in FitConnect may still appear as connected. Simply click "Disconnect" and then "Connect" again to re-establish the connection.
            </p>
          </div>
        </div>

        <DocWarning>
          If you continue to experience issues after trying these steps, please contact our support team for assistance.
        </DocWarning>
      </section>

      {/* Privacy & Support Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Privacy & Support
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Link 
            to="/privacy" 
            className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/80 transition-colors block"
          >
            <h3 className="font-medium mb-1">Privacy Policy</h3>
            <p className="text-muted-foreground text-sm">
              Read our full privacy policy to understand how we handle your data.
            </p>
          </Link>

          <Link 
            to="/terms" 
            className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/80 transition-colors block"
          >
            <h3 className="font-medium mb-1">Terms of Service</h3>
            <p className="text-muted-foreground text-sm">
              Review our terms of service for FitConnect.
            </p>
          </Link>

          <Link 
            to="/contact" 
            className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/80 transition-colors block"
          >
            <h3 className="font-medium mb-1">Contact Support</h3>
            <p className="text-muted-foreground text-sm">
              Need help? Get in touch with our support team.
            </p>
          </Link>

          <a 
            href="https://support.zoom.us" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-card/50 border border-border rounded-lg p-4 hover:bg-card/80 transition-colors block"
          >
            <h3 className="font-medium mb-1 flex items-center gap-1">
              Zoom Support
              <ExternalLink className="h-3 w-3" />
            </h3>
            <p className="text-muted-foreground text-sm">
              For issues with your Zoom account, visit Zoom's support centre.
            </p>
          </a>
        </div>
      </section>
    </DocsLayout>
  );
}
