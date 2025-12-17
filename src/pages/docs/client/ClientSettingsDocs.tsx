import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { Settings, Watch, Bell, Lock } from "lucide-react";

export default function ClientSettingsDocs() {
  return (
    <DocsLayout
      title="Settings & Integrations"
      description="Learn how to manage your profile, privacy settings, wearable connections, and notifications."
      breadcrumbs={[
        { label: "Docs", href: "/docs" },
        { label: "Client Guide", href: "/docs/client" },
        { label: "Settings & Integrations" }
      ]}
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your personal information and fitness profile from your settings page.
        </p>

        <DocStep number={1} title="Access Settings">
          Click your avatar in the top navigation and select <strong>Settings</strong>, 
          or go to <strong>Settings</strong> from your dashboard sidebar.
        </DocStep>

        <DocStep number={2} title="Update Profile">
          Edit your name, location, fitness goals, and health information. This helps 
          your coach understand your needs better.
        </DocStep>

        <DocStep number={3} title="Change Avatar">
          Select from your unlocked avatars to personalize your profile across the platform.
        </DocStep>

        <DocTip type="info">
          Keep your health information (medical conditions, allergies, dietary restrictions) 
          up to date so your coach can create safe and effective plans.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Watch className="h-6 w-6 text-primary" />
          Wearable Integrations
        </h2>
        <p className="text-muted-foreground">
          Connect your fitness devices to automatically sync health data with the platform.
        </p>

        <DocStep number={1} title="Supported Devices">
          We support Apple Health, Google Fit, Fitbit, and Garmin devices.
        </DocStep>

        <DocStep number={2} title="Connect a Device">
          Go to <strong>Settings → Integrations</strong> and click <strong>Connect</strong> 
          next to your device. You'll be redirected to authorize the connection.
        </DocStep>

        <DocStep number={3} title="Data Syncing">
          Once connected, your steps, heart rate, calories burned, sleep data, and 
          activity will automatically sync to your profile.
        </DocStep>

        <DocTip type="tip">
          Your coach can see synced data to better understand your activity levels and 
          adjust your plans accordingly.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Notification Preferences
        </h2>
        <p className="text-muted-foreground">
          Control what notifications you receive and how you receive them.
        </p>

        <DocStep number={1} title="Notification Types">
          Choose to receive notifications for: new messages, session reminders, 
          plan updates, achievement unlocks, and challenge updates.
        </DocStep>

        <DocStep number={2} title="Delivery Methods">
          Select how you want to be notified: in-app notifications, email, or both.
        </DocStep>

        <DocStep number={3} title="Quiet Hours">
          Set quiet hours to pause notifications during specific times (e.g., overnight).
        </DocStep>

        <DocTip type="info">
          Session reminders are sent 24 hours and 1 hour before scheduled sessions by default.
        </DocTip>
      </section>

      <section className="space-y-6 mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          Privacy & Security
        </h2>
        <p className="text-muted-foreground">
          Control your data privacy and account security settings.
        </p>

        <DocStep number={1} title="Leaderboard Visibility">
          Choose whether to appear on public leaderboards. You can also set an alias 
          instead of using your real name.
        </DocStep>

        <DocStep number={2} title="Data Sharing">
          Control what health data is shared with your coaches. You can limit access 
          to specific data types.
        </DocStep>

        <DocStep number={3} title="Account Security">
          Enable two-factor authentication for additional account security. You can also 
          view recent login activity.
        </DocStep>

        <DocTip type="warning">
          If you suspect unauthorized access to your account, change your password 
          immediately and contact support.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
