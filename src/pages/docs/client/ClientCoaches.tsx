import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";

export default function ClientCoaches() {
  return (
    <DocsLayout
      title="Finding Coaches"
      description="Learn how to search, filter, and discover the perfect coach for your fitness journey."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Finding Coaches" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect's marketplace connects you with qualified fitness professionals across multiple 
          specialties. Whether you're looking for a personal trainer, nutritionist, boxing coach, 
          or MMA instructor, our search and filter tools help you find the right match.
        </p>
      </section>

      {/* Browsing the Marketplace */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Browsing the Marketplace</h2>
        <p className="text-muted-foreground mb-4">
          Access the coach marketplace in several ways:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Click "Find a Coach" in the navigation menu</li>
          <li>Go to "Coaches" in your client dashboard sidebar</li>
          <li>Use the specialty links (Personal Trainers, Nutritionists, Boxing, MMA) in the navigation</li>
        </ul>

        <DocScreenshot 
          alt="Coach marketplace showing coach cards with filters"
          caption="The coach marketplace with filter options"
        />
      </section>

      {/* Using Filters */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Using Filters</h2>
        <p className="text-muted-foreground mb-4">
          Narrow down your search with these filter options:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Specialty</h3>
        <p className="text-muted-foreground mb-4">
          Filter by coach type:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
          <li><strong>Personal Trainers:</strong> General fitness and strength training</li>
          <li><strong>Nutritionists:</strong> Diet planning and nutrition coaching</li>
          <li><strong>Boxing Coaches:</strong> Boxing technique and conditioning</li>
          <li><strong>MMA Coaches:</strong> Mixed martial arts training</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Session Type</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
          <li><strong>Online:</strong> Virtual sessions via video call</li>
          <li><strong>In-Person:</strong> Face-to-face sessions at a gym or location</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Price Range</h3>
        <p className="text-muted-foreground mb-6">
          Set minimum and maximum hourly rates to find coaches within your budget.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Location</h3>
        <p className="text-muted-foreground mb-6">
          Search for coaches in your area for in-person sessions. The platform can detect your 
          location automatically or you can enter it manually.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Verification Status</h3>
        <p className="text-muted-foreground mb-6">
          Toggle to show only verified coaches who have completed identity and credential verification.
        </p>

        <DocTip type="tip">
          Use multiple filters together to narrow down results. For example, filter for 
          "Nutritionist + Online + Under £50/hour" to find affordable remote nutrition coaching.
        </DocTip>
      </section>

      {/* Understanding Coach Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Understanding Coach Cards</h2>
        <p className="text-muted-foreground mb-4">
          Each coach card shows key information at a glance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Profile Photo:</strong> Coach's profile or card image</li>
          <li><strong>Name & Specialties:</strong> Their name and coaching types</li>
          <li><strong>Verified Badge:</strong> Blue checkmark if identity verified</li>
          <li><strong>Rating:</strong> Average star rating from client reviews</li>
          <li><strong>Location:</strong> Where they're based</li>
          <li><strong>Hourly Rate:</strong> Starting price per session</li>
          <li><strong>Availability:</strong> Online/In-Person badges</li>
        </ul>

        <DocScreenshot 
          alt="Coach card showing profile, name, rating, and details"
          caption="A coach card with key information"
        />
      </section>

      {/* Viewing Coach Profiles */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Viewing Coach Profiles</h2>
        <p className="text-muted-foreground mb-4">
          Click on a coach card to view their full profile, which includes:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">About Section</h3>
        <p className="text-muted-foreground mb-4">
          The coach's bio, experience, and approach to training. This helps you understand 
          their coaching style and philosophy.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Certifications</h3>
        <p className="text-muted-foreground mb-4">
          List of their professional qualifications and certifications.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Services & Pricing</h3>
        <p className="text-muted-foreground mb-4">
          Detailed breakdown of the services they offer, session durations, and prices. 
          This may include packages and subscription plans.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Reviews</h3>
        <p className="text-muted-foreground mb-4">
          Read what other clients say about their experience working with this coach.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Availability</h3>
        <p className="text-muted-foreground mb-4">
          View their calendar to see when they have available slots for sessions.
        </p>
      </section>

      {/* Saving Favourites */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Saving Favourites</h2>
        <DocStep number={1} title="Find a coach you like">
          Browse the marketplace and find coaches that interest you.
        </DocStep>
        <DocStep number={2} title="Click the heart icon">
          Click the heart icon on the coach card or profile page to save them to your favourites.
        </DocStep>
        <DocStep number={3} title="Access your favourites">
          View all saved coaches in your dashboard under "Favourites" in the sidebar.
        </DocStep>

        <DocTip type="tip">
          Use favourites to compare coaches before making a decision. Save 3-5 coaches 
          and compare their profiles, reviews, and pricing.
        </DocTip>
      </section>

      {/* Connecting with a Coach */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Connecting with a Coach</h2>
        <p className="text-muted-foreground mb-4">
          Once you've found a coach you want to work with, you have two options:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Option 1: Send a Connection Request</h3>
        <p className="text-muted-foreground mb-4">
          Some coaches prefer to chat before booking. Click "Connect" to send them a message 
          introducing yourself. They'll review your profile and can accept or decline.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Option 2: Book Directly</h3>
        <p className="text-muted-foreground mb-4">
          If the coach allows direct booking, you can book a session straight from their 
          profile without waiting for approval.
        </p>

        <DocTip type="info">
          Many coaches offer free initial consultations. Look for "Free Consultation" in their 
          services to try them out before committing.
        </DocTip>
      </section>

      {/* Tips for Choosing */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tips for Choosing the Right Coach</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Check reviews carefully</h3>
            <p className="text-sm text-muted-foreground">
              Look for reviews from clients with similar goals to yours. Quality matters more than quantity.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Read their bio</h3>
            <p className="text-sm text-muted-foreground">
              A coach's philosophy and approach should align with your preferences and goals.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Consider specialties</h3>
            <p className="text-sm text-muted-foreground">
              A coach who specialises in your goal area will have more relevant experience.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-1">Try a consultation first</h3>
            <p className="text-sm text-muted-foreground">
              If available, book a consultation to see if you connect well before committing to packages.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
