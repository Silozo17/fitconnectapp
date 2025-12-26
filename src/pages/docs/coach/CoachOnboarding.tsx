import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";
import { useNativePricing } from "@/hooks/useNativePricing";
import { useActivePricing } from "@/hooks/useActivePricing";
import { isDespia } from "@/lib/despia";

export default function CoachOnboarding() {
  // Use native pricing on native apps, web pricing otherwise
  const isNativeApp = isDespia();
  const webPricing = useActivePricing();
  const nativePricing = useNativePricing();
  const pricing = isNativeApp ? nativePricing : webPricing;

  return (
    <DocsLayout
      title="Getting Started as a Coach"
      description="Complete guide to setting up your coaching business on FitConnect."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Getting Started" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          Welcome to FitConnect! This guide walks you through the complete onboarding process 
          to get your coaching business up and running. The onboarding wizard will guide you 
          through each step, but this documentation provides additional detail and tips.
        </p>
      </section>

      {/* Account Creation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 1: Create Your Account</h2>
        <DocStep number={1} title="Sign up">
          Click "Get Started" on the homepage and select "I'm a fitness coach". 
          Enter your email and create a secure password.
        </DocStep>
        <DocStep number={2} title="Verify your email">
          Check your inbox for a verification email and click the link to confirm your account.
        </DocStep>
        <DocStep number={3} title="Start onboarding">
          After verification, you'll be automatically redirected to the coach onboarding wizard.
        </DocStep>

        <DocTip type="tip">
          Use a professional email address that clients will recognise and trust.
        </DocTip>
      </section>

      {/* Basic Info */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 2: Basic Information</h2>
        <p className="text-muted-foreground mb-4">Enter your professional details:</p>
        
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Display Name:</strong> How clients will see your name (e.g., "Coach Mike" or "Mike Johnson")</li>
          <li><strong>Bio:</strong> A compelling description of your experience, approach, and what makes you unique</li>
          <li><strong>Location:</strong> Your city or area for in-person sessions</li>
          <li><strong>Experience:</strong> Years of professional coaching experience</li>
        </ul>

        <DocScreenshot 
          docId="coach-info-form"
          alt="Coach basic info form with name, bio, and location fields"
          caption="Enter your basic professional information"
        />

        <DocTip type="tip" title="Writing a Great Bio">
          Your bio should cover: your qualifications, coaching philosophy, types of clients you work best with, 
          and any notable achievements. Keep it personal and authentic—clients want to know the real you.
        </DocTip>
      </section>

      {/* Specialties */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 3: Specialties</h2>
        <p className="text-muted-foreground mb-4">
          Select your coaching specialties. You can choose multiple:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Personal Training:</strong> General fitness, strength training, weight loss</li>
          <li><strong>Nutrition:</strong> Diet planning, meal prep guidance, macro coaching</li>
          <li><strong>Boxing:</strong> Boxing technique, conditioning, sparring</li>
          <li><strong>MMA:</strong> Mixed martial arts, grappling, striking</li>
          <li><strong>Bodybuilding:</strong> Competition prep, posing, physique development</li>
        </ul>

        <DocTip type="info">
          Be honest about your specialties. Clients search by specialty, so only select areas where 
          you have real expertise and can deliver results.
        </DocTip>
      </section>

      {/* Services & Pricing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 4: Services & Pricing</h2>
        <p className="text-muted-foreground mb-4">
          Define the services you offer and set your prices:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Hourly Rate</h3>
        <p className="text-muted-foreground mb-4">
          Set your base hourly rate. This is displayed on your profile and in search results.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Session Types</h3>
        <p className="text-muted-foreground mb-4">
          Create different session types with specific durations and prices:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Free Consultation:</strong> 15-30 min intro call (recommended)</li>
          <li><strong>Standard Session:</strong> Your typical training session</li>
          <li><strong>Extended Session:</strong> Longer sessions for complex training</li>
          <li><strong>Online Session:</strong> Virtual coaching via video call</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Online vs In-Person</h3>
        <p className="text-muted-foreground mb-6">
          Indicate whether you offer online sessions, in-person sessions, or both. 
          Online expands your potential client base significantly.
        </p>

        <DocTip type="tip">
          Offering a free consultation dramatically increases connection requests. 
          Use it to qualify leads and build rapport before they commit.
        </DocTip>
      </section>

      {/* Availability */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 5: Availability</h2>
        <p className="text-muted-foreground mb-4">
          Set your working hours for each day of the week:
        </p>

        <DocStep number={1} title="Enable days">
          Toggle on the days you're available to work.
        </DocStep>
        <DocStep number={2} title="Set time ranges">
          For each active day, set your start and end times.
        </DocStep>
        <DocStep number={3} title="Consider time zones">
          If you offer online sessions to clients in different locations, consider 
          extending your hours to accommodate different time zones.
        </DocStep>

        <DocScreenshot 
          docId="availability-settings"
          alt="Availability settings showing daily time slots"
          caption="Configure your weekly availability"
        />

        <DocTip type="info">
          You can always adjust your availability later. Many coaches start with limited hours 
          and expand as they build their client base.
        </DocTip>
      </section>

      {/* Stripe Connect */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 6: Connect Payments (Stripe)</h2>
        <p className="text-muted-foreground mb-4">
          To receive payments from clients, you need to connect a Stripe account:
        </p>

        <DocStep number={1} title="Click Connect with Stripe">
          Click the Stripe Connect button to start the setup process.
        </DocStep>
        <DocStep number={2} title="Create or log in to Stripe">
          You'll be redirected to Stripe. Create a new account or log in to an existing one.
        </DocStep>
        <DocStep number={3} title="Complete verification">
          Stripe will ask for business information and bank details to verify your identity.
        </DocStep>
        <DocStep number={4} title="Return to FitConnect">
          After completing Stripe setup, you'll be redirected back to continue onboarding.
        </DocStep>

        <DocTip type="warning">
          You can skip this step, but you won't be able to accept payments until Stripe is connected. 
          We strongly recommend completing it during onboarding.
        </DocTip>

        <DocTip type="info" title="About Platform Fees">
          FitConnect charges a small commission on client payments. The rate depends on your 
          subscription tier: Free (4%), Starter (3%), Pro (2%), Enterprise (1%).
        </DocTip>
      </section>

      {/* Integrations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 7: Integrations (Optional)</h2>
        <p className="text-muted-foreground mb-4">
          Connect optional integrations to enhance your coaching:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Video Conferencing:</strong> Connect Zoom or Google Meet for automatic meeting links</li>
          <li><strong>Calendar:</strong> Sync with Google Calendar or Outlook to manage all appointments</li>
        </ul>

        <DocTip type="tip">
          These integrations can be set up later from Settings → Integrations. 
          Feel free to skip during onboarding and return when ready.
        </DocTip>
      </section>

      {/* Dual Account */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 8: Dual Account (Optional)</h2>
        <p className="text-muted-foreground mb-4">
          You can optionally create a client profile in addition to your coach profile:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Train with other coaches on the platform</li>
          <li>Experience the client side of FitConnect</li>
          <li>Compete on leaderboards and earn achievements</li>
        </ul>

        <DocTip type="info">
          Many coaches find value in also being clients. It helps you understand the client 
          experience and stay motivated with your own fitness goals.
        </DocTip>
      </section>

      {/* Choose Plan */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Step 9: Choose Your Plan</h2>
        <p className="text-muted-foreground mb-4">
          Select a subscription plan for your coaching business:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">Free</h3>
            <p className="text-2xl font-bold mb-2">{pricing.formatPrice(0)}<span className="text-sm font-normal">/month</span></p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Up to 3 clients</li>
              <li>• Basic features</li>
              <li>• 4% platform commission</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-primary/50 bg-primary/5">
            <h3 className="font-semibold text-lg mb-2">Starter</h3>
            <p className="text-2xl font-bold mb-2">{pricing.formatPrice(pricing.getSubscriptionPrice('starter', 'monthly'))}<span className="text-sm font-normal">/month</span></p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Up to 10 clients</li>
              <li>• All features</li>
              <li>• 3% platform commission</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">Pro</h3>
            <p className="text-2xl font-bold mb-2">{pricing.formatPrice(pricing.getSubscriptionPrice('pro', 'monthly'))}<span className="text-sm font-normal">/month</span></p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Up to 50 clients</li>
              <li>• Priority support</li>
              <li>• 2% platform commission</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
            <p className="text-2xl font-bold mb-2">{pricing.formatPrice(pricing.getSubscriptionPrice('enterprise', 'monthly'))}<span className="text-sm font-normal">/month</span></p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited clients</li>
              <li>• White-label options</li>
              <li>• 1% platform commission</li>
            </ul>
          </div>
        </div>

        <DocTip type="tip">
          Start with the Free plan to test the platform, then upgrade as you grow. 
          You can change plans anytime from your settings.
        </DocTip>

        <DocTip type="info" title="📱 Subscribing on Mobile">
          If you're using the iOS or Android app, plan purchases use in-app purchases 
          (Apple App Store or Google Play) instead of card payments. Prices shown are 
          platform-specific and managed through your device's app store account.
        </DocTip>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>
        <p className="text-muted-foreground mb-4">
          After completing onboarding, focus on these priorities:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li><strong>Complete verification</strong> to earn your verified badge</li>
          <li><strong>Upload a professional photo</strong> and card image</li>
          <li><strong>Create session packages</strong> to offer discounted bundles</li>
          <li><strong>Set up message templates</strong> for common responses</li>
          <li><strong>Build workout and nutrition templates</strong> you can quickly assign to clients</li>
        </ol>
      </section>

      {/* Changelog */}
      <section className="mt-16 pt-8 border-t border-border">
        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Changelog</h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><strong>26 December 2024:</strong> Added mobile in-app purchase note for Step 9 (plan selection).</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
