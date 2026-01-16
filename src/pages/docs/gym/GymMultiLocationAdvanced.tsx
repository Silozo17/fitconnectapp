import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Settings, BarChart3, Shield, Repeat, Globe, Layers } from "lucide-react";

const GymMultiLocationAdvanced = () => {
  return (
    <DocsLayout
      title="Multi-Location Management"
      description="Manage multiple gym locations from a single dashboard with centralized or decentralized control, area manager workflows, and cross-location reporting."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Multi-Location" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Whether you operate two locations or two hundred, our multi-location system provides 
            the flexibility to manage everything centrally while empowering local teams to handle 
            day-to-day operations.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Centralized Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  One dashboard for all locations
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Local Autonomy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Empower site managers with appropriate access
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Cross-Location Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compare performance across sites
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Organization Structure */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Organization Structure</h2>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Hierarchy Levels:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Organization (Company Level)</p>
                  <p className="text-sm text-muted-foreground">
                    Top-level entity. Controls branding, billing, global settings. Usually one per company.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 ml-8">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Region / Area</p>
                  <p className="text-sm text-muted-foreground">
                    Optional grouping of locations. Useful for area managers overseeing multiple sites.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 ml-16">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Location (Site)</p>
                  <p className="text-sm text-muted-foreground">
                    Individual gym location with its own members, classes, staff, and settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Staff Roles by Level */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Staff Roles Across Locations</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Owner / Super Admin</CardTitle>
                  <Badge>Organization Level</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Full access to everything:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>View and manage all locations</li>
                  <li>Create/delete locations</li>
                  <li>Organization billing and subscription</li>
                  <li>Global settings and branding</li>
                  <li>Create and manage area managers</li>
                  <li>Cross-location reporting</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Area Manager</CardTitle>
                  <Badge variant="secondary">Region Level</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Oversees multiple locations in their area:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Access to assigned locations only</li>
                  <li>Manage site managers within their area</li>
                  <li>Area-level reporting and comparison</li>
                  <li>Approve certain actions (refunds, discounts)</li>
                  <li>Cannot create new locations</li>
                  <li>Cannot access other areas</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Site Manager</CardTitle>
                  <Badge variant="outline">Location Level</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Runs day-to-day operations at one location:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Full operational access to their location</li>
                  <li>Manage local staff and schedules</li>
                  <li>Handle member issues and bookings</li>
                  <li>Location-specific reporting</li>
                  <li>Cannot change organization settings</li>
                  <li>Cannot access other locations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Setting Up Locations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Setting Up a New Location</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Create the Location">
              Navigate to <strong>Settings → Locations → Add Location</strong>. Enter:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Location name and address</li>
                <li>Contact details (phone, email)</li>
                <li>Time zone</li>
                <li>Opening hours</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={2} title="Configure Location Settings">
              Each location can have unique settings:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Memberships:</strong> Which plans are available here</li>
                <li><strong>Classes:</strong> Location-specific class types and schedules</li>
                <li><strong>Pricing:</strong> Override prices for this location</li>
                <li><strong>Policies:</strong> Custom cancellation, booking rules</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={3} title="Assign Staff">
              Add staff members and assign their roles:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Assign site manager</li>
                <li>Add instructors, receptionists, trainers</li>
                <li>Set permissions appropriate to each role</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Set Up Resources">
              Configure location-specific resources:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Rooms and studios</li>
                <li>Equipment</li>
                <li>Check-in stations</li>
                <li>Payment terminals</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Launch">
              Once configured, toggle the location to "Active". It will appear in member searches 
              and booking options.
            </DocStep>
          </div>
        </section>

        {/* Centralized vs Local Settings */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Centralized vs Local Control</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary">Centralized (Organization Level)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Settings that apply across all locations:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Brand guidelines and logos</li>
                  <li>Global membership types</li>
                  <li>Email templates</li>
                  <li>Integration configurations</li>
                  <li>Global policies</li>
                  <li>Staff role definitions</li>
                  <li>Billing and subscription</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local (Site Level)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Settings each location can customize:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Opening hours</li>
                  <li>Class schedule</li>
                  <li>Available memberships (subset)</li>
                  <li>Local pricing overrides</li>
                  <li>Staff assignments</li>
                  <li>Room/resource configuration</li>
                  <li>Local promotions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <DocInfo className="mt-4">
            The inheritance model means locations get organization defaults but can override 
            specific settings. Changes to organization settings flow down to all locations 
            unless locally overridden.
          </DocInfo>
        </section>

        {/* Member Access */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Member Access Across Locations</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Access Models</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <div className="space-y-4 text-sm">
                  <div className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-foreground">Single Location</p>
                    <p>Member can only access their home location. Simplest model.</p>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-foreground">Multi-Location (Same Region)</p>
                    <p>Access to all locations within their area. Good for regional chains.</p>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-foreground">All Access</p>
                    <p>Full access to every location. Premium membership tier.</p>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <p className="font-medium text-foreground">Pay-Per-Visit</p>
                    <p>Home location included, pay extra for other sites.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DocTip className="mt-4">
            Create membership tiers with different access levels. "Basic" might be single location, 
            "Premium" might be all-access. This creates natural upgrade opportunities.
          </DocTip>
        </section>

        {/* Cross-Location Reporting */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cross-Location Reporting</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <BarChart3 className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Comparison Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Compare locations side by side:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Revenue comparison</li>
                  <li>Member count and growth</li>
                  <li>Retention rates</li>
                  <li>Class attendance</li>
                  <li>Staff performance</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Layers className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Consolidated Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Roll up data across locations:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Total organization revenue</li>
                  <li>Combined member count</li>
                  <li>Overall churn rate</li>
                  <li>Aggregate class stats</li>
                  <li>Group financial summary</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Location Performance Dashboard</h3>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="font-medium">London Central</p>
                <p className="text-2xl font-bold text-green-400">£52k</p>
                <p className="text-xs text-muted-foreground">+12% vs LM</p>
              </div>
              <div>
                <p className="font-medium">Manchester</p>
                <p className="text-2xl font-bold text-green-400">£38k</p>
                <p className="text-xs text-muted-foreground">+8% vs LM</p>
              </div>
              <div>
                <p className="font-medium">Birmingham</p>
                <p className="text-2xl font-bold text-yellow-400">£31k</p>
                <p className="text-xs text-muted-foreground">-2% vs LM</p>
              </div>
              <div>
                <p className="font-medium">Leeds</p>
                <p className="text-2xl font-bold text-red-400">£24k</p>
                <p className="text-xs text-muted-foreground">-8% vs LM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Area Manager Workflows */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Area Manager Workflows</h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Daily Overview</h4>
                <p className="text-sm text-muted-foreground">
                  Area managers start their day with a consolidated view of all their locations:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Yesterday's performance summary per site</li>
                  <li>Attendance anomalies or alerts</li>
                  <li>Staff absences or coverage issues</li>
                  <li>Outstanding approval requests</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Approval Workflows</h4>
                <p className="text-sm text-muted-foreground">
                  Configure which actions require area manager approval:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Refunds above a certain threshold</li>
                  <li>Large discounts or custom pricing</li>
                  <li>Staff hiring or role changes</li>
                  <li>Schedule changes affecting capacity</li>
                  <li>Member transfers between locations</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Site Visits</h4>
                <p className="text-sm text-muted-foreground">
                  Tools for when area managers visit locations:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Mobile-friendly site dashboard</li>
                  <li>Quick audit checklists</li>
                  <li>Staff performance reviews</li>
                  <li>Facility condition notes</li>
                  <li>Member feedback review</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Multi-Location Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-400 mb-3">Do</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Standardize core processes across locations</li>
                <li>✓ Allow flexibility for local market needs</li>
                <li>✓ Share best practices between sites</li>
                <li>✓ Rotate staff for cross-training</li>
                <li>✓ Benchmark location performance</li>
                <li>✓ Centralize marketing and branding</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-3">Don't</h3>
              <ul className="space-y-2 text-sm">
                <li>✗ Over-centralize everything</li>
                <li>✗ Ignore local manager insights</li>
                <li>✗ Create too many exceptions</li>
                <li>✗ Compare locations unfairly (size, demographics)</li>
                <li>✗ Neglect communication between sites</li>
                <li>✗ Forget to update all locations when needed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How is billing handled for multi-location?</h4>
              <p className="text-sm text-muted-foreground">
                Billing is at the organization level. You get one invoice covering all locations. 
                Pricing may be based on total members, locations, or a custom enterprise agreement.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can members transfer between locations?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can transfer a member's home location. Their history travels with them. 
                For multi-access members, they simply check in wherever they go.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">How do I handle staff who work at multiple locations?</h4>
              <p className="text-sm text-muted-foreground">
                Staff can be assigned to multiple locations. Their schedule shows which site they're 
                at each day. They switch between location views as needed.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I have different pricing at different locations?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, each location can override the base pricing. Useful for premium city-centre 
                locations vs suburban sites. Members see prices for their selected location.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymMultiLocationAdvanced;
