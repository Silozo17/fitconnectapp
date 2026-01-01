import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Shield, Eye, EyeOff, Users, Heart, Utensils, Dumbbell, Activity, Camera } from "lucide-react";

export default function ClientDataSharingDocs() {
  return (
    <DocsLayout
      title="Share Data with Coaches | FitConnect Privacy Guide"
      description="Control which health and fitness metrics your coach can view. Manage per-coach sharing permissions easily."
      breadcrumbs={[
        { label: "Client Guide", href: "/docs/client" },
        { label: "Data Sharing" }
      ]}
    >
      <div className="space-y-8">
        {/* Who This Is For */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
          <p className="text-muted-foreground">
            This guide is for <strong>all clients</strong> who want to understand and control 
            what personal data their coaches can see. Your privacy matters, and you're always 
            in control of your information.
          </p>
        </section>

        {/* What This Feature Does */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What This Feature Does</h2>
          <p className="text-muted-foreground mb-4">
            Data Privacy Controls let you decide exactly which types of information each of your 
            coaches can access. You can share everything for a comprehensive coaching experience, 
            or limit sharing to only what you're comfortable with.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Shield className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Per-Coach Control</h3>
              <p className="text-sm text-muted-foreground">
                Set different sharing preferences for each coach you work with
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Eye className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Granular Choices</h3>
              <p className="text-sm text-muted-foreground">
                Toggle individual data types on or off—share some, keep others private
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <EyeOff className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Instant Effect</h3>
              <p className="text-sm text-muted-foreground">
                Changes take effect immediately—revoke access anytime
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium mb-1">Clear Overview</h3>
              <p className="text-sm text-muted-foreground">
                See at a glance what each coach can access from one screen
              </p>
            </div>
          </div>
        </section>

        {/* Why This Feature Exists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Why This Feature Exists</h2>
          <p className="text-muted-foreground mb-4">
            We believe you should always be in control of your personal health data. While sharing 
            data with coaches helps them provide better guidance, you may have valid reasons to 
            limit what's shared:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>You want to share training logs but keep nutrition private</li>
            <li>You're working with multiple coaches and want different sharing levels</li>
            <li>You're not comfortable sharing certain metrics like weight or photos</li>
            <li>You want to stop sharing after ending a coaching relationship</li>
          </ul>
        </section>

        {/* Types of Data You Can Control */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Types of Data You Can Control</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Progress Photos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Photos you upload to track your physical progress. Includes front, side, and back poses.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Meal Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your food diary entries including meals, calories, macros, and meal photos.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Training Logs</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your workout records including exercises, sets, reps, and weights lifted.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Wearable Data</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Health metrics from your connected devices. Each metric can be controlled individually:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside ml-4">
                <li>Steps</li>
                <li>Heart rate</li>
                <li>Sleep data</li>
                <li>Calories burned</li>
                <li>Distance</li>
                <li>Active minutes</li>
                <li>Weight (from smart scale)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Set It Up */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Manage Your Sharing Preferences</h2>
          <div className="space-y-4">
            <DocStep stepNumber={1} title="Open Settings">
              Go to your Dashboard and click Settings (gear icon)
            </DocStep>
            <DocStep stepNumber={2} title="Navigate to Data Privacy">
              Click on the "Data Privacy" tab in your settings
            </DocStep>
            <DocStep stepNumber={3} title="Select a Coach">
              You'll see a list of coaches you're connected with. Each coach has their own sharing settings.
            </DocStep>
            <DocStep stepNumber={4} title="Toggle Data Types">
              For each data type, toggle the switch on (green) to share or off (grey) to keep private.
            </DocStep>
            <DocStep stepNumber={5} title="Use Quick Actions (Optional)">
              Use "Share All" to enable all data types, or "Revoke All" to disable everything at once.
            </DocStep>
          </div>
          <DocInfo className="mt-4">
            Changes are saved automatically as you toggle each setting. There's no save button needed.
          </DocInfo>
        </section>

        {/* What Happens When You Change Settings */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What Happens When You Change Settings</h2>
          
          <h3 className="text-lg font-medium mt-4 mb-2">When You Enable Sharing</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Your coach can immediately see that data type</li>
            <li>Historical data becomes visible (not just new entries)</li>
            <li>Your coach may receive better context for coaching decisions</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-2">When You Revoke Sharing</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Your coach immediately loses access to that data type</li>
            <li>They see an "Access Denied" message when trying to view that data</li>
            <li>Previously shared data is no longer visible to them</li>
            <li>You can re-enable sharing at any time to restore access</li>
          </ul>

          <DocTip className="mt-4">
            Revoking access doesn't delete any of your data—it simply stops your coach from viewing it. 
            Your records remain safe in your account.
          </DocTip>
        </section>

        {/* Access Levels */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Access Levels Explained</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="font-medium text-green-600 dark:text-green-400 mb-1">Full Access</h3>
              <p className="text-sm text-muted-foreground">
                All data types are shared. Your coach has complete visibility into your progress.
              </p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-1">Limited Access</h3>
              <p className="text-sm text-muted-foreground">
                Some data types are shared, others are private. Your coach sees only what you've enabled.
              </p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">No Access</h3>
              <p className="text-sm text-muted-foreground">
                All data types are revoked. Your coach cannot see any of your logged data.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Notes */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Important Privacy Information</h2>
          <DocWarning>
            Your data belongs to you. Even with full sharing enabled, coaches can only <em>view</em> 
            your data—they cannot edit or delete it.
          </DocWarning>
          <div className="mt-4 space-y-3 text-muted-foreground">
            <p>• <strong>Coaches never see your login credentials or payment details</strong></p>
            <p>• <strong>Messages and chat history are always visible to the coach you're chatting with</strong></p>
            <p>• <strong>Your profile photo and basic info (name, goals) are visible to connected coaches</strong></p>
            <p>• <strong>Medical conditions and allergies you've entered are visible to coaches for safety</strong></p>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">If I revoke sharing, does my coach get notified?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No, coaches are not notified when you change sharing preferences. They simply 
                won't be able to see the data if they try to access it.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can my coach request access to data I've hidden?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Coaches can see that data is restricted and may ask you to share more for 
                better coaching. The decision is always yours.
              </p>
            </div>
            <div>
              <h3 className="font-medium">What if I work with multiple coaches?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Each coach has separate sharing settings. You might share nutrition with 
                your nutritionist and training logs with your PT, for example.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Does revoking access affect my subscription?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No, your subscription and coaching relationship continue. Data sharing 
                preferences are separate from your service agreement.
              </p>
            </div>
            <div>
              <h3 className="font-medium">What happens to my data if I disconnect from a coach?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If you end the coaching relationship, the coach automatically loses access 
                to all your data. Your data remains in your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
