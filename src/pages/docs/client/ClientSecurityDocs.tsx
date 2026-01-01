import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocWarning, DocInfo } from "@/components/docs/DocComponents";
import { 
  Shield, 
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  LogOut,
  Key,
  UserCheck,
  ToggleLeft,
  History
} from "lucide-react";

export default function ClientSecurityDocs() {
  return (
    <DocsLayout
      title="Account Security & 2FA | FitConnect Client Guide"
      description="Protect your account with two-factor authentication, manage sessions and follow security best practices."
      breadcrumbs={[{ label: "Client Guide", href: "/docs/client" }, { label: "Account Security" }]}
    >
      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Overview
        </h2>
        <p className="text-muted-foreground">
          Your FitConnect account contains personal health data, payment information, and private 
          conversations with your coach. We provide several security features to help you keep 
          your account safe.
        </p>
      </section>

      {/* Two-Factor Authentication */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-green-500" />
          Two-Factor Authentication (2FA)
        </h2>
        <p className="text-muted-foreground mb-4">
          Two-factor authentication adds an extra layer of security by requiring a verification 
          code in addition to your password when logging in.
        </p>

        <h3 className="font-medium mt-6 mb-3">How It Works</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">1. Enter Your Password</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Log in as usual with your email and password.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">2. Receive Verification Code</h4>
            <p className="text-sm text-muted-foreground mt-1">
              A 6-digit code is sent to your email address.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium">3. Enter the Code</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the code to complete login. Codes expire after 10 minutes.
            </p>
          </div>
        </div>

        <h3 className="font-medium mt-6 mb-3">Enabling 2FA</h3>
        <DocStep stepNumber={1} title="Go to Settings">
          Navigate to Settings → Security in your dashboard.
        </DocStep>
        <DocStep stepNumber={2} title="Enable Two-Factor Authentication">
          Toggle the 2FA switch to enable it.
        </DocStep>
        <DocStep stepNumber={3} title="Verify Your Email">
          A test code will be sent to confirm your email is working.
        </DocStep>
        <DocStep stepNumber={4} title="Confirmation">
          Once verified, 2FA is active for all future logins.
        </DocStep>

        <DocTip>
          We strongly recommend enabling 2FA, especially if you use FitConnect on 
          shared or public devices.
        </DocTip>
      </section>

      {/* Active Sessions */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-500" />
          Active Sessions
        </h2>
        <p className="text-muted-foreground mb-4">
          View and manage all devices and browsers where you're currently logged in.
        </p>

        <h3 className="font-medium mt-6 mb-3">What You Can See</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Device type</strong> - iPhone, Android, Desktop, etc.</li>
          <li><strong>Browser</strong> - Chrome, Safari, Firefox, etc.</li>
          <li><strong>Location</strong> - Approximate location based on IP</li>
          <li><strong>Last active</strong> - When the session was last used</li>
          <li><strong>Current session</strong> - Your current device is marked</li>
        </ul>

        <h3 className="font-medium mt-6 mb-3">Managing Sessions</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <LogOut className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Revoke Individual Session</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Revoke" next to any session to log out that device immediately. 
                Useful if you notice an unfamiliar session.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50 flex items-start gap-3">
            <LogOut className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Log Out of All Devices</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Use "Log out of all devices" to terminate all sessions except your 
                current one. Do this if you suspect unauthorized access.
              </p>
            </div>
          </div>
        </div>

        <DocWarning>
          You cannot revoke your current session from this screen. To log out of 
          your current device, use the Sign Out button in the menu.
        </DocWarning>
      </section>

      {/* Password Security */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-500" />
          Password Security
        </h2>
        <p className="text-muted-foreground mb-4">
          Your password is your first line of defense. Follow these best practices:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-500 font-bold flex-shrink-0">✓</div>
            <div>
              <h4 className="font-medium">Use a strong password</h4>
              <p className="text-sm text-muted-foreground">
                At least 12 characters with a mix of letters, numbers, and symbols.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-500 font-bold flex-shrink-0">✓</div>
            <div>
              <h4 className="font-medium">Use a unique password</h4>
              <p className="text-sm text-muted-foreground">
                Don't reuse passwords from other websites or apps.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-500 font-bold flex-shrink-0">✓</div>
            <div>
              <h4 className="font-medium">Use a password manager</h4>
              <p className="text-sm text-muted-foreground">
                Tools like 1Password or Bitwarden help you create and remember strong passwords.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-500 font-bold flex-shrink-0">✗</div>
            <div>
              <h4 className="font-medium">Never share your password</h4>
              <p className="text-sm text-muted-foreground">
                FitConnect staff will never ask for your password. Don't share it with anyone.
              </p>
            </div>
          </div>
        </div>

        <h3 className="font-medium mt-6 mb-3">Changing Your Password</h3>
        <DocStep stepNumber={1} title="Go to Settings → Security">
          Navigate to the security settings in your dashboard.
        </DocStep>
        <DocStep stepNumber={2} title="Click Change Password">
          You'll need to enter your current password for verification.
        </DocStep>
        <DocStep stepNumber={3} title="Enter New Password">
          Enter your new password twice to confirm it.
        </DocStep>
      </section>

      {/* Forgot Password */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-amber-500" />
          Forgot Your Password?
        </h2>
        <p className="text-muted-foreground mb-4">
          If you've forgotten your password, you can reset it:
        </p>
        <DocStep stepNumber={1} title="Go to the login page">
          Visit the FitConnect login page.
        </DocStep>
        <DocStep stepNumber={2} title="Click 'Forgot password?'">
          Find the link below the login form.
        </DocStep>
        <DocStep stepNumber={3} title="Enter your email">
          Enter the email address associated with your account.
        </DocStep>
        <DocStep stepNumber={4} title="Check your email">
          You'll receive a password reset link. Click it to set a new password.
        </DocStep>

        <DocInfo>
          Password reset links expire after 1 hour. If your link has expired, 
          request a new one.
        </DocInfo>
      </section>

      {/* Suspicious Activity */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">If You Suspect Unauthorized Access</h2>
        <p className="text-muted-foreground mb-4">
          If you notice suspicious activity on your account, take these steps immediately:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-medium">Log out of all devices</h4>
              <p className="text-sm text-muted-foreground">
                Use the "Log out of all devices" option in Settings → Security.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-medium">Change your password</h4>
              <p className="text-sm text-muted-foreground">
                Set a new, strong password that you haven't used before.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-medium">Enable 2FA</h4>
              <p className="text-sm text-muted-foreground">
                If you haven't already, enable two-factor authentication.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-medium">Contact support</h4>
              <p className="text-sm text-muted-foreground">
                Let us know about the suspicious activity so we can help investigate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Why do I see sessions from different locations?</h3>
            <p className="text-sm text-muted-foreground">
              Locations are based on IP addresses, which can sometimes show approximate 
              or incorrect locations due to VPNs or mobile networks. If you don't recognize 
              a session, revoke it to be safe.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">Can I use biometric login (Face ID, fingerprint)?</h3>
            <p className="text-sm text-muted-foreground">
              Biometric login is available on supported mobile devices through the app. 
              It uses your device's secure biometric system.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">What if I lose access to my email?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our support team with proof of identity. We'll help you recover 
              your account through a manual verification process.
            </p>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
