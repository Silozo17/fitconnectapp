import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Image, Bell, Search, Clock, Shield } from "lucide-react";

export default function ClientMessagesDocs() {
  return (
    <DocsLayout
      title="Message Your Coach | FitConnect Client Guide"
      description="Chat with coaches, share progress photos and get guidance. Real-time messaging built in."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Messages" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for clients who want to communicate with their coaches through FitConnect's 
            built-in messaging system. Whether you need to ask questions, share progress updates, or 
            send photos, the messaging feature keeps all your coaching conversations in one place.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">What This Feature Does</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Direct Messaging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Send text messages directly to your coach with real-time delivery and read receipts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" />
                  Photo Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Share progress photos, meal photos, or form check videos directly in your conversation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get notified when your coach responds so you never miss important guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  Message History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access your complete conversation history to reference past advice and instructions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            Effective coaching requires ongoing communication between you and your coach. The messaging 
            system exists to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Keep all coaching conversations organised in one secure place</li>
            <li>Allow quick questions without waiting for your next session</li>
            <li>Enable progress photo sharing for technique feedback and accountability</li>
            <li>Create a record of advice and guidance you can reference later</li>
            <li>Build a stronger relationship with your coach between sessions</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">How It Works</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Access Messages">
              Navigate to your dashboard and click on "Messages" in the sidebar, or click on a 
              coach's profile and select the message button.
            </DocStep>

            <DocStep stepNumber={2} title="Select a Conversation">
              Choose the coach you want to message from your conversation list. Your most recent 
              conversations appear at the top.
            </DocStep>

            <DocStep stepNumber={3} title="Send Messages">
              Type your message in the text box at the bottom and press send. You can also attach 
              photos by clicking the attachment icon.
            </DocStep>

            <DocStep stepNumber={4} title="Receive Responses">
              When your coach replies, you'll see their message appear in the conversation and 
              receive a notification (if enabled).
            </DocStep>
          </div>
        </section>

        {/* How to Send Photos */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Sharing Photos</h2>
          <p className="text-muted-foreground mb-4">
            Progress photos and form checks are valuable for your coach to provide accurate feedback.
          </p>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Click the Attachment Icon">
              In any conversation, click the camera or attachment icon next to the message input.
            </DocStep>

            <DocStep stepNumber={2} title="Select Your Photo">
              Choose a photo from your device. You can select photos from your gallery or take a new one.
            </DocStep>

            <DocStep stepNumber={3} title="Add Context">
              Add a text message to explain what the photo shows (e.g., "Week 4 progress" or 
              "Is my squat form correct?").
            </DocStep>

            <DocStep stepNumber={4} title="Send">
              Your photo will be uploaded and sent to your coach securely.
            </DocStep>
          </div>

          <DocTip className="mt-4">
            For progress photos, take them in consistent lighting and poses each time to make 
            comparisons easier for your coach.
          </DocTip>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Message Notifications</h2>
          <p className="text-muted-foreground mb-4">
            Stay informed when your coach responds:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>In-app notifications:</strong> A badge appears on the Messages icon when you have unread messages</li>
            <li><strong>Push notifications:</strong> If enabled, you'll receive alerts on your device</li>
            <li><strong>Email notifications:</strong> Optional email alerts for new messages</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            You can customise your notification preferences in your account settings.
          </p>
        </section>

        {/* Privacy & Data */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </h2>
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-muted-foreground">
              Your messages and photos are private and secure:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Messages are encrypted and stored securely</li>
              <li>Only you and your coach can see your conversation</li>
              <li>Photos are stored in secure cloud storage</li>
              <li>Coaches cannot share your photos without your consent</li>
              <li>You can request deletion of your message history</li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Important Notes</h2>
          <DocWarning>
            Response times depend on your coach's availability. For urgent matters, use the contact 
            method specified by your coach for emergencies.
          </DocWarning>
          <div className="mt-4 space-y-2 text-muted-foreground">
            <p>Keep in mind:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Message history is retained for the duration of your coaching relationship</li>
              <li>Large video files may take time to upload</li>
              <li>Coaches may have messaging hours outside of which responses may be delayed</li>
            </ul>
          </div>
        </section>

        {/* Common Use Cases */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Common Use Cases</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Quick Questions</h3>
              <p className="text-sm text-muted-foreground">
                "Can I substitute chicken for salmon in today's meal plan?" — Get quick answers 
                without waiting for your next session.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Form Checks</h3>
              <p className="text-sm text-muted-foreground">
                Share a video of your exercise form and ask your coach for technique corrections.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Progress Updates</h3>
              <p className="text-sm text-muted-foreground">
                Share weekly progress photos and weigh-ins to keep your coach informed.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Schedule Changes</h3>
              <p className="text-sm text-muted-foreground">
                Let your coach know about travel, illness, or schedule changes that might affect your training.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I message multiple coaches?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, if you work with multiple coaches, you'll have separate conversations with each one.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">How long are messages kept?</h3>
              <p className="text-sm text-muted-foreground">
                Your message history is retained for the duration of your coaching relationship and 
                can be accessed at any time.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Can I delete messages?</h3>
              <p className="text-sm text-muted-foreground">
                You can delete individual messages from your side of the conversation. To delete 
                your entire message history, contact support.
              </p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">Why am I not receiving notifications?</h3>
              <p className="text-sm text-muted-foreground">
                Check your notification settings in both the app and your device settings. Make sure 
                notifications are enabled for FitConnect.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
