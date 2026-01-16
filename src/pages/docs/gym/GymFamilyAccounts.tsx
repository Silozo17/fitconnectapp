import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CreditCard, Shield, Settings, Link2, Baby, User } from "lucide-react";

const GymFamilyAccounts = () => {
  return (
    <DocsLayout
      title="Family & Linked Accounts"
      description="Manage family memberships, parent-child accounts, and linked member relationships for households that train together."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Family Accounts" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Family accounts allow households to manage multiple memberships together. Parents can 
            control children's accounts, couples can share billing, and families can take advantage 
            of group discounts while maintaining individual profiles.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Linked Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect family members under one household
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Unified Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Single payment for multiple memberships
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Parental Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage children's access and bookings
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Account Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Account Types</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Primary Account Holder</CardTitle>
                  <Badge>Parent Account</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">The main adult who manages the family account. They can:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Add and remove linked members</li>
                  <li>Manage all payment methods and billing</li>
                  <li>Book classes for any family member</li>
                  <li>View all family members' attendance and progress</li>
                  <li>Set parental controls for minors</li>
                  <li>Receive all billing communications</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Linked Adult</CardTitle>
                  <Badge variant="secondary">Partner/Spouse</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Additional adults linked to the family account:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Full access to their own profile and bookings</li>
                  <li>Can be granted co-admin rights by primary holder</li>
                  <li>Optional: Can book for children in the family</li>
                  <li>Individual login credentials</li>
                  <li>Shared billing with primary holder</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Baby className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Child Account</CardTitle>
                  <Badge variant="outline">Minor</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Accounts for members under 18:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Must be linked to a parent/guardian account</li>
                  <li>Parental consent required for signup</li>
                  <li>Parents control booking permissions</li>
                  <li>Age-appropriate class restrictions</li>
                  <li>Optional: Limited app access (view only)</li>
                  <li>Billing goes to parent account</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Setting Up Family Accounts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating a Family Account</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Start with Primary Holder">
              The main adult signs up normally. They become the primary account holder automatically 
              when they add family members.
            </DocStep>
            
            <DocStep stepNumber={2} title="Add Family Members">
              In the member portal, go to <strong>Account → Family</strong> and click <strong>Add Family Member</strong>:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>For Adults:</strong> Enter their email - they'll receive an invitation to link accounts</li>
                <li><strong>For Children:</strong> Enter their details and confirm parental consent</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Choose Membership Types">
              Select memberships for each family member. Family discounts are automatically applied 
              when eligible memberships are detected.
            </DocStep>
            
            <DocStep stepNumber={4} title="Configure Billing">
              Choose how to handle payments:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Combined:</strong> Single payment for all memberships</li>
                <li><strong>Split:</strong> Separate billing for each adult</li>
                <li><strong>Primary pays all:</strong> Everything billed to primary holder</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Set Permissions">
              Configure what linked members can do:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Who can book classes for whom</li>
                <li>Co-admin rights for partners</li>
                <li>Parental controls for children</li>
              </ul>
            </DocStep>
          </div>
          
          <DocTip className="mt-6">
            Staff can also create family accounts from the dashboard under 
            <strong> Members → Add Member → Add to Family</strong>.
          </DocTip>
        </section>

        {/* Parental Controls */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Parental Controls</h2>
          <p className="text-muted-foreground mb-4">
            Keep minors safe with comprehensive parental controls.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Require parent approval for all bookings</p>
                <p>• Restrict to specific class types only</p>
                <p>• Block certain time slots (school hours)</p>
                <p>• Limit weekly class count</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">App & Portal Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• View-only mode (no self-booking)</p>
                <p>• Hide messaging features</p>
                <p>• Disable profile photo changes</p>
                <p>• Restrict access to community features</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Check-In Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Require parent present for check-in</p>
                <p>• Set pickup authorisation list</p>
                <p>• Age verification at entry</p>
                <p>• Notify parent on check-in/out</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Multiple emergency contacts per child</p>
                <p>• Medical information on file</p>
                <p>• Allergy and condition alerts</p>
                <p>• Quick access for staff</p>
              </CardContent>
            </Card>
          </div>
          
          <DocWarning className="mt-4">
            Always obtain proper parental/guardian consent before creating accounts for minors. 
            Keep consent records on file for compliance.
          </DocWarning>
        </section>

        {/* Family Memberships & Discounts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Family Memberships & Discounts</h2>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Discount Types:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Couple's Discount</h4>
                  <p className="text-sm text-muted-foreground">2 adults in same household</p>
                </div>
                <Badge variant="outline">10% off each</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Family Bundle</h4>
                  <p className="text-sm text-muted-foreground">2+ adults + 1+ children</p>
                </div>
                <Badge variant="outline">15% off total</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Additional Child</h4>
                  <p className="text-sm text-muted-foreground">Each child after the first</p>
                </div>
                <Badge variant="outline">20% off child rate</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Parent + Child</h4>
                  <p className="text-sm text-muted-foreground">Single parent with children</p>
                </div>
                <Badge variant="outline">10% off each</Badge>
              </div>
            </div>
          </div>
          
          <DocInfo className="mt-4">
            Configure family discount rules in <strong>Settings → Memberships → Family Discounts</strong>. 
            Discounts are applied automatically when family links are established.
          </DocInfo>
        </section>

        {/* Managing Linked Accounts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Managing Linked Accounts</h2>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Primary Holder Actions:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Link2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Link New Member:</strong> Send invitation or add directly (for children)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Edit Permissions:</strong> Change what linked members can do
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Update Billing:</strong> Change payment methods and billing preferences
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Remove Member:</strong> Unlink an account (doesn't delete their account)
                </div>
              </li>
            </ul>
          </div>
          
          <h3 className="font-semibold mt-6 mb-4">Staff Actions:</h3>
          <p className="text-muted-foreground mb-4">
            Staff can manage family accounts from the member detail page:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>View all linked family members</li>
            <li>Manually link/unlink accounts</li>
            <li>Override parental controls when needed</li>
            <li>Transfer primary holder status</li>
            <li>Apply or remove family discounts</li>
          </ul>
        </section>

        {/* Booking for Family Members */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Booking for Family Members</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">From the Member App:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Select a class from the timetable</li>
                  <li>Click "Book for Family Member"</li>
                  <li>Choose which family member to book for</li>
                  <li>Confirm the booking</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">From the Gym Dashboard:</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
                  <li>Open the class booking screen</li>
                  <li>Search for any family member</li>
                  <li>The system shows their family group</li>
                  <li>Book for one or multiple family members</li>
                </ol>
              </CardContent>
            </Card>
          </div>
          
          <DocTip className="mt-4">
            When a parent books a class, the system automatically shows family members who are 
            eligible for that class based on age and membership type.
          </DocTip>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can two adults both be primary holders?</h4>
              <p className="text-sm text-muted-foreground">
                No, there can only be one primary holder. However, you can grant co-admin rights 
                to other adults, giving them nearly identical permissions.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">What happens when a child turns 18?</h4>
              <p className="text-sm text-muted-foreground">
                The system notifies both the parent and the child. The account can be converted to 
                an independent adult account, or remain linked if preferred.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can a member be in multiple family groups?</h4>
              <p className="text-sm text-muted-foreground">
                No, each member can only be part of one family group at a time. If circumstances 
                change (divorce, etc.), accounts need to be unlinked and relinked appropriately.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do cancellations work for family accounts?</h4>
              <p className="text-sm text-muted-foreground">
                Each membership can be cancelled independently. The primary holder can cancel any 
                family member's membership. Family discounts are recalculated after changes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymFamilyAccounts;
