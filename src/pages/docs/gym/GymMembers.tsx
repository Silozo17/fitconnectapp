import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymMembers() {
  return (
    <DocsLayout
      title="Member Management"
      description="Learn how to add members, manage profiles, handle family accounts, and track member history in your gym management system."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Member Management" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Members are at the heart of your gym business. FitConnect provides comprehensive 
          tools to manage member profiles, track their journey, and maintain detailed records.
        </p>
      </section>

      {/* Adding Members */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Adding New Members</h2>
        
        <h3 className="text-xl font-medium mb-4">Manual Entry</h3>
        <DocStep stepNumber={1} title="Navigate to Members">
          <p>Go to your gym dashboard and click "Members" in the sidebar, then click "Add Member".</p>
        </DocStep>

        <DocStep stepNumber={2} title="Enter Member Details">
          <p className="mb-4">Fill in the member's information:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Personal Information</strong> - Name, email, phone, date of birth</li>
            <li><strong>Address</strong> - Full contact address</li>
            <li><strong>Emergency Contact</strong> - Name and phone number</li>
            <li><strong>Medical Information</strong> - Any conditions or notes for instructors</li>
            <li><strong>Photo</strong> - Optional profile photo for identification</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Assign Membership">
          <p className="mb-4">
            Select a membership plan for the new member. You can choose to start billing 
            immediately or set a future start date.
          </p>
          <DocTip>
            If the member needs a trial period, select a trial membership first. You can 
            convert them to a full membership later.
          </DocTip>
        </DocStep>

        <h3 className="text-xl font-medium mb-4 mt-8">Self-Signup</h3>
        <p className="text-muted-foreground mb-4">
          Enable self-signup to let potential members register online:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Share your gym's signup page link</li>
          <li>Members complete their own profile and payment</li>
          <li>Automatically added to your member list once payment is confirmed</li>
          <li>Welcome email sent automatically</li>
        </ul>
        <DocInfo>
          You can customise which fields are required during self-signup in Settings → Signup Form.
        </DocInfo>
      </section>

      {/* Member Profile */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Member Profile</h2>
        <p className="text-muted-foreground mb-4">
          Each member has a detailed profile showing their complete history with your gym:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Overview Tab</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Contact information</li>
              <li>• Current membership status</li>
              <li>• Attendance summary</li>
              <li>• Account balance</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Memberships Tab</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Active and past memberships</li>
              <li>• Class credits remaining</li>
              <li>• Renewal dates</li>
              <li>• Payment history</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Attendance Tab</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check-in history</li>
              <li>• Classes attended</li>
              <li>• Attendance patterns</li>
              <li>• Missed classes</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Notes Tab</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Staff notes</li>
              <li>• Medical alerts</li>
              <li>• Communication history</li>
              <li>• Important dates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Family Accounts */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Family Accounts</h2>
        <p className="text-muted-foreground mb-4">
          Link family members together for easier management and family pricing:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Create a parent account as the primary billing contact</li>
          <li>Add children or other family members as linked accounts</li>
          <li>Apply family membership discounts automatically</li>
          <li>Parents can book classes for their children</li>
          <li>Single invoice for all family members</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Adding Minors</h3>
        <p className="text-muted-foreground mb-4">
          When adding members under 18, additional fields are required:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Parent/Guardian name and contact</li>
          <li>Parental consent for activities</li>
          <li>Photo consent for marketing (optional)</li>
          <li>Medical information and allergies</li>
        </ul>
        <DocWarning>
          Ensure you have proper consent documentation for all minor members. You can 
          require contract signatures through the Contracts feature.
        </DocWarning>
      </section>

      {/* Member Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Member Status</h2>
        <p className="text-muted-foreground mb-4">
          Members can have different statuses that affect their access:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-green-500">Active</h4>
            <p className="text-sm text-muted-foreground">
              Member has a valid membership and can access the gym and book classes.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-blue-500">Frozen</h4>
            <p className="text-sm text-muted-foreground">
              Membership temporarily paused (e.g., for injury or holiday). Billing may be paused or reduced.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-yellow-500">Pending</h4>
            <p className="text-sm text-muted-foreground">
              Awaiting payment confirmation or document completion.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-red-500">Cancelled</h4>
            <p className="text-sm text-muted-foreground">
              Membership has ended. Member cannot access until reactivated.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-1 text-orange-500">Past Due</h4>
            <p className="text-sm text-muted-foreground">
              Payment failed or overdue. Access may be restricted based on your settings.
            </p>
          </div>
        </div>
      </section>

      {/* Member Actions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Common Actions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Freeze Membership</h4>
            <p className="text-sm text-muted-foreground">
              Pause a membership for a set period. Set a return date and choose whether to 
              pause billing completely or charge a reduced rate.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Change Membership</h4>
            <p className="text-sm text-muted-foreground">
              Upgrade or downgrade a member's plan. Prorate billing automatically or apply 
              changes at the next billing cycle.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Add Credits</h4>
            <p className="text-sm text-muted-foreground">
              Add complimentary class credits or account credit for goodwill gestures 
              or promotional offers.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Send Message</h4>
            <p className="text-sm text-muted-foreground">
              Send an email or push notification directly to the member from their profile.
            </p>
          </div>
        </div>
      </section>

      {/* Bulk Operations */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Bulk Operations</h2>
        <p className="text-muted-foreground mb-4">
          Perform actions on multiple members at once:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Export</strong> - Download member data to CSV for reporting</li>
          <li><strong>Import</strong> - Bulk upload members from a spreadsheet</li>
          <li><strong>Send Message</strong> - Email all selected members</li>
          <li><strong>Apply Tag</strong> - Add tags for filtering and segmentation</li>
        </ul>
        <DocTip>
          Use member tags to create segments for targeted marketing campaigns, like 
          "Morning Members" or "Trial Converts".
        </DocTip>
      </section>
    </DocsLayout>
  );
}
