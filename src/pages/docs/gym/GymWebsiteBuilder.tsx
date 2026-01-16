import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymWebsiteBuilder() {
  return (
    <DocsLayout
      title="Website Builder"
      description="Create a professional public website for your gym with class schedules, membership signup, and custom branding."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Website Builder" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          FitConnect includes a built-in website builder so you can create a professional 
          online presence without hiring a developer. Your website automatically syncs with 
          your class schedules, memberships, and booking system.
        </p>
      </section>

      {/* Getting Started */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>

        <DocStep stepNumber={1} title="Access the Website Builder">
          <p>Go to Settings → Website or Marketing → Website Builder in your gym dashboard.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Choose a Template">
          <p className="mb-4">Select from professional templates designed for fitness businesses:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Modern Gym</strong> - Clean, minimalist design</li>
            <li><strong>Martial Arts</strong> - Bold with action imagery</li>
            <li><strong>Yoga Studio</strong> - Calm, wellness-focused</li>
            <li><strong>CrossFit Box</strong> - High-energy, community-driven</li>
            <li><strong>Classic Fitness</strong> - Traditional gym aesthetic</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Customise Your Branding">
          <p>Add your logo, choose your colour scheme, and set your fonts.</p>
        </DocStep>

        <DocTip>
          Your website automatically uses your gym's logo and colours from your general settings. 
          You can override these specifically for the website if needed.
        </DocTip>
      </section>

      {/* Website Sections */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Website Sections</h2>

        <p className="text-muted-foreground mb-4">
          Build your website by adding and arranging sections:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Hero Section</h4>
            <p className="text-sm text-muted-foreground">
              Eye-catching header with your gym name, tagline, and call-to-action button. 
              Add a background image or video to showcase your facility.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">About Us</h4>
            <p className="text-sm text-muted-foreground">
              Tell your story, mission, and what makes your gym special. 
              Include team photos and facility images.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Class Timetable</h4>
            <p className="text-sm text-muted-foreground">
              Live-synced schedule showing all your classes. Visitors can see what's 
              available and sign up or request a trial.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Membership Plans</h4>
            <p className="text-sm text-muted-foreground">
              Display your membership options with pricing, features, and signup buttons. 
              Connects directly to your payment system.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Instructors / Team</h4>
            <p className="text-sm text-muted-foreground">
              Showcase your coaches and staff with photos, bios, qualifications, 
              and specialties.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Testimonials</h4>
            <p className="text-sm text-muted-foreground">
              Display member reviews and success stories. Can pull from your 
              review system or add manually.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Contact & Location</h4>
            <p className="text-sm text-muted-foreground">
              Map, address, opening hours, phone number, and contact form. 
              Multi-location gyms can show all locations.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Gallery</h4>
            <p className="text-sm text-muted-foreground">
              Photo gallery showcasing your facility, equipment, classes in action, 
              and community events.
            </p>
          </div>
        </div>
      </section>

      {/* Customising Content */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Customising Content</h2>

        <h3 className="text-xl font-medium mb-4">Editing Text</h3>
        <p className="text-muted-foreground mb-4">
          Click on any text block to edit it directly. The editor supports:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Headings and paragraphs</li>
          <li>Bold, italic, and underline</li>
          <li>Bullet and numbered lists</li>
          <li>Links to other pages or external sites</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Adding Images</h3>
        <DocStep stepNumber={1} title="Upload Images">
          <p>Click the image placeholder or use the media library to upload new images.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Optimise for Web">
          <p>Images are automatically optimised for fast loading. Use high-quality originals for best results.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Add Alt Text">
          <p>Add descriptive alt text for accessibility and SEO.</p>
        </DocStep>

        <DocInfo>
          Recommended image sizes: Hero: 1920×1080px, Gallery: 800×600px, Team: 400×400px square.
        </DocInfo>
      </section>

      {/* Custom Domain */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Custom Domain</h2>

        <p className="text-muted-foreground mb-4">
          Your website gets a free subdomain (yourgymnname.fitconnect.com), but you can 
          connect your own domain for a professional appearance.
        </p>

        <DocStep stepNumber={1} title="Purchase a Domain">
          <p>Buy a domain from a registrar like GoDaddy, Namecheap, or Google Domains.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Add to FitConnect">
          <p>Go to Website Settings → Domain and enter your domain name.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Configure DNS">
          <p>Add the provided DNS records to your domain registrar. We'll provide the exact values.</p>
        </DocStep>

        <DocStep stepNumber={4} title="Enable SSL">
          <p>Once DNS is verified, SSL is automatically enabled for secure (https) connections.</p>
        </DocStep>

        <DocWarning>
          DNS changes can take 24-48 hours to propagate. Your site may be temporarily 
          unavailable during this period.
        </DocWarning>
      </section>

      {/* SEO Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">SEO Settings</h2>

        <p className="text-muted-foreground mb-4">
          Optimise your website for search engines:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Page Titles</h4>
            <p className="text-sm text-muted-foreground">
              Set unique titles for each page. Include your gym name and location.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Meta Descriptions</h4>
            <p className="text-sm text-muted-foreground">
              Write compelling descriptions that appear in search results.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Social Sharing</h4>
            <p className="text-sm text-muted-foreground">
              Set images and text for when your pages are shared on social media.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Google Business</h4>
            <p className="text-sm text-muted-foreground">
              Connect to Google Business Profile for local search visibility.
            </p>
          </div>
        </div>

        <DocTip>
          Include your location in page titles and descriptions to rank better for 
          local searches like "gym near me" or "boxing classes in Manchester".
        </DocTip>
      </section>

      {/* Publishing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Publishing Your Website</h2>

        <DocStep stepNumber={1} title="Preview Changes">
          <p>Click "Preview" to see how your site looks before publishing.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Review on Mobile">
          <p>Use the device switcher to check how your site looks on phones and tablets.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Publish">
          <p>Click "Publish" to make your changes live. Updates appear within minutes.</p>
        </DocStep>

        <DocInfo>
          You can make changes anytime. Unpublished changes are saved as drafts until 
          you're ready to publish them.
        </DocInfo>
      </section>

      {/* Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Website Analytics</h2>
        
        <p className="text-muted-foreground mb-4">
          Track how visitors interact with your website:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>Page Views</strong> - Most visited pages</li>
          <li><strong>Traffic Sources</strong> - Where visitors come from</li>
          <li><strong>Conversion Rate</strong> - Signups from website visits</li>
          <li><strong>Popular Classes</strong> - Which class pages get most interest</li>
        </ul>

        <DocTip>
          Connect Google Analytics for more detailed insights. Add your tracking ID 
          in Website Settings → Analytics.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
