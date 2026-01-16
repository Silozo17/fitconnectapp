import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Calendar, Users, Layout, Palette, Settings, Globe, Copy } from "lucide-react";

const GymEmbedWidgets = () => {
  return (
    <DocsLayout
      title="Embed Widgets"
      description="Add class timetables, booking forms, and other widgets to your external website to let visitors book directly without leaving your site."
      breadcrumbs={[
        { label: "Gym Management", href: "/docs/gym" },
        { label: "Embed Widgets" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Embed widgets allow you to display live timetables, booking forms, and membership signups 
            directly on your own website. Visitors can view schedules and book classes without leaving 
            your site, creating a seamless experience.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Timetable Widget</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Live class schedule with booking capability
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Signup Widget</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Membership signup forms for new members
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <Layout className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Custom Widgets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Class lists, instructor profiles, and more
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Available Widgets */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Available Widgets</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Class Timetable</CardTitle>
                  <Badge>Most Popular</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Display your live class schedule with filtering and booking:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Weekly or daily view options</li>
                  <li>Filter by class type, instructor, or location</li>
                  <li>Real-time availability updates</li>
                  <li>Direct booking (members log in via popup)</li>
                  <li>Mobile responsive design</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Membership Signup</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Let visitors sign up for memberships directly:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Display available membership plans</li>
                  <li>Collect member information</li>
                  <li>Process payments via Stripe</li>
                  <li>Automatic account creation</li>
                  <li>Promotional code support</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Class List</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Showcase your class offerings:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Class descriptions and images</li>
                  <li>Duration and difficulty levels</li>
                  <li>Instructor information</li>
                  <li>Link to booking page</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Instructor Profiles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="mb-3">Feature your team:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Photos and bios</li>
                  <li>Qualifications and specialties</li>
                  <li>Classes they teach</li>
                  <li>Social links</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Generating Embed Code */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Generating Embed Code</h2>
          
          <div className="space-y-6">
            <DocStep stepNumber={1} title="Access Widget Settings">
              Navigate to <strong>Settings → Integrations → Embed Widgets</strong> in your gym dashboard.
            </DocStep>
            
            <DocStep stepNumber={2} title="Choose Widget Type">
              Select the widget you want to embed from the available options.
            </DocStep>
            
            <DocStep stepNumber={3} title="Configure Appearance">
              Customize the widget to match your website:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Theme:</strong> Light, dark, or auto (matches user's system)</li>
                <li><strong>Colours:</strong> Primary and accent colours</li>
                <li><strong>Size:</strong> Width and height (or responsive)</li>
                <li><strong>Fonts:</strong> Match your website's typography</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={4} title="Set Content Options">
              Choose what to display:
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Which locations to include (multi-location gyms)</li>
                <li>Which class types to show</li>
                <li>Default view (day, week, month)</li>
                <li>Whether to show prices</li>
              </ul>
            </DocStep>
            
            <DocStep stepNumber={5} title="Copy Embed Code">
              Click <strong>Generate Code</strong> to create your embed snippet. Copy the code to use on your website.
            </DocStep>
          </div>
        </section>

        {/* Embed Code Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Embed Code Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Basic Timetable Widget
              </h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`<div id="fitconnect-timetable"></div>
<script src="https://widgets.fitconnect.app/timetable.js"></script>
<script>
  FitConnectTimetable.init({
    gymId: 'YOUR_GYM_ID',
    container: '#fitconnect-timetable',
    theme: 'light'
  });
</script>`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Iframe Embed (Simpler)
              </h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`<iframe 
  src="https://embed.fitconnect.app/timetable/YOUR_GYM_ID"
  width="100%" 
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Signup Widget
              </h3>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`<div id="fitconnect-signup"></div>
<script src="https://widgets.fitconnect.app/signup.js"></script>
<script>
  FitConnectSignup.init({
    gymId: 'YOUR_GYM_ID',
    container: '#fitconnect-signup',
    membershipIds: ['mem_123', 'mem_456'], // Optional: specific memberships
    promoCode: 'SUMMER2024' // Optional: pre-apply promo
  });
</script>`}</pre>
              </div>
            </div>
          </div>
          
          <DocTip className="mt-6">
            The JavaScript widget offers more customization options and better integration with your 
            site. The iframe embed is simpler but has limited styling options.
          </DocTip>
        </section>

        {/* Customization */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Customization Options</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Palette className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Visual Styling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Primary colour (buttons, highlights)</p>
                <p>• Background colour/transparency</p>
                <p>• Border radius (rounded corners)</p>
                <p>• Font family override</p>
                <p>• Show/hide header and footer</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Settings className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Behaviour Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Enable/disable booking</p>
                <p>• Show prices or hide them</p>
                <p>• Redirect after booking</p>
                <p>• Open links in new tab</p>
                <p>• Mobile-first or desktop-first layout</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Timetable Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Default view (day/week/month)</p>
                <p>• Start day of week</p>
                <p>• Time format (12h/24h)</p>
                <p>• Show past classes</p>
                <p>• Highlight today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Globe className="h-5 w-5 text-primary mb-2" />
                <CardTitle className="text-base">Multi-Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Show location selector</p>
                <p>• Default to specific location</p>
                <p>• Location-specific branding</p>
                <p>• Combined or separate timetables</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Adding to Your Website */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Adding to Your Website</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WordPress</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Edit the page where you want the widget</li>
                  <li>Add an HTML block (in Gutenberg) or use a Custom HTML widget</li>
                  <li>Paste the embed code</li>
                  <li>Save and preview</li>
                </ol>
                <p className="mt-3">
                  <strong>Tip:</strong> Some page builders (Elementor, Divi) have dedicated HTML modules.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wix</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Open the Wix Editor</li>
                  <li>Click Add (+) → Embed → Custom Embeds → Embed a Widget</li>
                  <li>Paste your embed code in the HTML field</li>
                  <li>Resize and position as needed</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Squarespace</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Edit your page</li>
                  <li>Add a Code Block</li>
                  <li>Paste the embed code</li>
                  <li>Set display options and save</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom HTML/React Site</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Simply paste the embed code in your HTML file or component. For React/Vue/Angular, 
                use the provided npm package for better integration:</p>
                <div className="bg-muted rounded-lg p-3 mt-2 font-mono text-xs">
                  npm install @fitconnect/widgets
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Widget not loading</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check your gym ID is correct in the embed code</li>
                <li>• Ensure the script URL is not blocked by ad blockers</li>
                <li>• Verify the container element ID matches</li>
                <li>• Check browser console for JavaScript errors</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Styling conflicts</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use the iframe embed if your site's CSS conflicts</li>
                <li>• Add CSS specificity to override widget styles</li>
                <li>• Contact support for custom CSS options</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Booking not working</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure your gym's booking settings allow public booking</li>
                <li>• Check that the classes shown are bookable</li>
                <li>• Verify membership requirements for the classes</li>
              </ul>
            </div>
          </div>
          
          <DocWarning className="mt-4">
            Widgets require your gym to have an active subscription. Free trial gyms have limited 
            widget functionality.
          </DocWarning>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Do widgets update automatically?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Widgets fetch live data from your gym account. Any changes you make to classes, 
                schedules, or memberships are reflected immediately.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Can I track conversions from widgets?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, widgets support Google Analytics and Facebook Pixel integration. You can also 
                view widget-specific analytics in your dashboard under Marketing → Widget Analytics.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium mb-2">Is there a limit to how many widgets I can use?</h4>
              <p className="text-sm text-muted-foreground">
                No limit! You can embed widgets on as many pages as you like. Each widget can be 
                configured differently (e.g., different class filters per page).
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
};

export default GymEmbedWidgets;
