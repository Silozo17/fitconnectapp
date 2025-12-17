import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";

export default function ClientProfile() {
  return (
    <DocsLayout
      title="Creating Your Profile"
      description="Set up your client profile to get personalised coach recommendations and better service."
      breadcrumbs={[
        { label: "For Clients", href: "/docs/client" },
        { label: "Creating Your Profile" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          Your profile is the foundation of your FitConnect experience. It helps coaches understand 
          your goals, health considerations, and preferences so they can provide tailored guidance.
        </p>
        <p className="text-muted-foreground">
          You'll complete most of your profile during onboarding, but you can update it anytime 
          from your dashboard settings.
        </p>
      </section>

      {/* During Onboarding */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Setting Up During Onboarding</h2>
        <p className="text-muted-foreground mb-6">
          When you first sign up, you'll be guided through these steps:
        </p>

        <DocStep number={1} title="Personal Information">
          Enter your first name and age. Optionally select your pronouns for how coaches should 
          address you. Your name will be visible to coaches you connect with.
        </DocStep>

        <DocScreenshot 
          docId="client-profile-form"
          alt="Personal information form showing name, age, and pronoun fields"
          caption="Step 1: Personal Information"
        />

        <DocStep number={2} title="Body Metrics">
          Enter your current height and weight. These metrics help coaches create appropriate 
          workout intensities and nutrition plans. You can update these as you progress.
        </DocStep>

        <DocStep number={3} title="Fitness Goals">
          Select your primary fitness goals from options like weight loss, muscle gain, improved 
          endurance, flexibility, or general health. You can select multiple goals.
        </DocStep>

        <DocTip type="tip">
          Be specific about your goals. If you want to lose 10kg, that's more actionable than 
          just "weight loss". You can discuss specific targets with your coach.
        </DocTip>

        <DocStep number={4} title="Dietary Information">
          Specify any dietary restrictions (vegetarian, vegan, gluten-free, etc.) and food 
          allergies. This is crucial for coaches creating nutrition plans.
        </DocStep>

        <DocTip type="warning">
          Always disclose food allergies accurately. Coaches use this information to create 
          safe meal plans for you.
        </DocTip>

        <DocStep number={5} title="Connect Devices (Optional)">
          Connect your fitness wearables like Apple Health, Google Fit, Fitbit, or Garmin. 
          This allows automatic syncing of your activity data.
        </DocStep>
      </section>

      {/* Updating Your Profile */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Updating Your Profile Later</h2>
        <p className="text-muted-foreground mb-4">
          To update your profile after initial setup:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
          <li>Go to your Client Dashboard</li>
          <li>Click on "Settings" in the sidebar</li>
          <li>Select the "Profile" tab</li>
          <li>Make your changes and click "Save"</li>
        </ol>

        <DocScreenshot 
          docId="client-settings-page"
          alt="Client settings page with profile tab selected"
          caption="Profile settings in your dashboard"
        />
      </section>

      {/* Health Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Health Information</h2>
        <p className="text-muted-foreground mb-4">
          In your settings, you can also add important health information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Medical Conditions:</strong> Any conditions that might affect your training</li>
          <li><strong>Allergies:</strong> Food and environmental allergies</li>
          <li><strong>Dietary Restrictions:</strong> Lifestyle or religious dietary requirements</li>
        </ul>

        <DocTip type="info">
          Your health information is only visible to coaches you've connected with. It's kept 
          private and secure. Coaches need this information to create safe, effective programmes.
        </DocTip>
      </section>

      {/* Profile Picture */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Profile Picture</h2>
        <p className="text-muted-foreground mb-4">
          Add a profile picture to personalise your account:
        </p>
        <DocStep number={1} title="Click on your avatar">
          Go to Settings → Profile and click on your current avatar or the placeholder image.
        </DocStep>
        <DocStep number={2} title="Upload an image">
          Select an image from your device. The image can be any size or aspect ratio.
        </DocStep>
        <DocStep number={3} title="Crop your image">
          Use the cropping tool to adjust how your photo appears. The system enforces a square 
          crop for consistency.
        </DocStep>
        <DocStep number={4} title="Save">
          Click "Crop & Save" to upload your new profile picture.
        </DocStep>
      </section>

      {/* Leaderboard Settings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Leaderboard Privacy</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect includes competitive leaderboards. By default, you're not shown on public 
          leaderboards. To participate:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
          <li>Go to Settings → Profile</li>
          <li>Toggle "Show me on leaderboards" to ON</li>
          <li>Optionally set a display name (alias) for privacy</li>
          <li>Ensure your location (city, county, country) is set for location-based rankings</li>
        </ol>

        <DocTip type="info">
          Only your first name (or alias) and location are shown on leaderboards. Your full 
          profile is never publicly visible.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
