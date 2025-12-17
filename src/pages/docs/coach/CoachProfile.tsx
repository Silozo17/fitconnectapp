import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";

export default function CoachProfile() {
  return (
    <DocsLayout
      title="Profile Setup"
      description="Create a compelling profile that attracts your ideal clients."
      breadcrumbs={[
        { label: "For Coaches", href: "/docs/coach" },
        { label: "Profile Setup" },
      ]}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          Your profile is your storefront on FitConnect. A complete, professional profile 
          significantly increases your visibility in search results and helps potential 
          clients decide to work with you.
        </p>
        <p className="text-muted-foreground">
          FitConnect tracks your profile completion and rewards you with achievements as you 
          complete each section. Aim for 100% completion for best results.
        </p>
      </section>

      {/* Profile Completion */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Profile Completion Checklist</h2>
        <p className="text-muted-foreground mb-4">
          Your profile completion percentage is based on these 10 elements:
        </p>
        <div className="space-y-3">
          {[
            { item: "Profile Photo", desc: "A clear, professional headshot" },
            { item: "Display Name", desc: "How clients will see your name" },
            { item: "Bio", desc: "Your professional background and coaching style" },
            { item: "Specialties", desc: "Your coaching types (PT, nutrition, etc.)" },
            { item: "Hourly Rate", desc: "Your base session price" },
            { item: "Location", desc: "Where you're based for in-person sessions" },
            { item: "Session Types", desc: "The services you offer with prices" },
            { item: "Availability", desc: "Your working hours" },
            { item: "Stripe Connected", desc: "Payment processing set up" },
            { item: "Verification", desc: "ID and credentials verified" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-medium">{item.item}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <DocTip type="tip">
          Check your profile completion progress in your dashboard. You'll earn the "Profile Pro" 
          badge when you reach 100%!
        </DocTip>
      </section>

      {/* Profile Photo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Profile Photo</h2>
        <p className="text-muted-foreground mb-4">
          Your profile photo appears throughout the platform and is often the first thing 
          clients see. Make it count!
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Photo Requirements</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Clear, high-quality image</li>
          <li>Professional or friendly appearance</li>
          <li>Good lighting (natural light works best)</li>
          <li>Face clearly visible</li>
          <li>Neutral or fitness-related background</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Uploading Your Photo</h3>
        <DocStep number={1} title="Go to Settings">
          Navigate to your coach dashboard and click Settings in the sidebar.
        </DocStep>
        <DocStep number={2} title="Click on your avatar">
          Click the current avatar image to open the upload dialog.
        </DocStep>
        <DocStep number={3} title="Select an image">
          Choose a photo from your device.
        </DocStep>
        <DocStep number={4} title="Crop your photo">
          Use the cropping tool to frame your photo. The system uses a square (1:1) aspect ratio.
        </DocStep>
        <DocStep number={5} title="Save">
          Click "Crop & Save" to upload your new photo.
        </DocStep>

        <DocTip type="tip">
          Consider using a photo that shows you in action—training a client or demonstrating 
          an exercise. It's more engaging than a formal headshot.
        </DocTip>
      </section>

      {/* Card Image */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Marketplace Card Image</h2>
        <p className="text-muted-foreground mb-4">
          Separate from your profile photo, you can upload a card image that appears in the 
          coach marketplace search results. This uses a landscape (4:3) aspect ratio.
        </p>

        <DocStep number={1} title="Go to Settings → Profile">
          Navigate to your profile settings.
        </DocStep>
        <DocStep number={2} title="Find Card Image section">
          Scroll to the "Marketplace Card Image" section.
        </DocStep>
        <DocStep number={3} title="Upload and crop">
          Upload an image and use the 4:3 cropper to frame it.
        </DocStep>

        <DocScreenshot 
          alt="Card image upload showing landscape crop"
          caption="Upload a landscape image for your marketplace card"
        />

        <DocTip type="tip">
          A great card image might show: your training environment, you working with a client, 
          or a dynamic fitness pose. Make it eye-catching!
        </DocTip>
      </section>

      {/* Bio */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Writing Your Bio</h2>
        <p className="text-muted-foreground mb-4">
          Your bio is your chance to tell potential clients why they should work with you. 
          A well-written bio can significantly increase your conversion rate.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">What to Include</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li><strong>Your background:</strong> Qualifications, certifications, experience</li>
          <li><strong>Your approach:</strong> Training philosophy and methodology</li>
          <li><strong>Who you help:</strong> Your ideal clients and their goals</li>
          <li><strong>Results:</strong> Achievements, client success stories</li>
          <li><strong>Personal touch:</strong> A bit about you as a person</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Example Bio Structure</h3>
        <div className="p-4 rounded-lg border border-border bg-card/50 text-sm text-muted-foreground mb-6">
          <p className="mb-3">
            "Hi, I'm [Name], a certified personal trainer with [X] years of experience 
            helping [type of clients] achieve [goals].
          </p>
          <p className="mb-3">
            My approach focuses on [methodology], because I believe [philosophy]. 
            I specialise in [specific areas] and have helped clients [specific achievements].
          </p>
          <p>
            When I'm not training, you'll find me [personal interests]. I can't wait to 
            help you reach your fitness goals!"
          </p>
        </div>

        <DocTip type="warning">
          Avoid generic phrases like "I'm passionate about fitness." Instead, be specific: 
          "I've helped 50+ clients lose over 500kg combined through sustainable nutrition and strength training."
        </DocTip>
      </section>

      {/* Certifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
        <p className="text-muted-foreground mb-4">
          List your professional certifications to build credibility:
        </p>

        <DocStep number={1} title="Go to Settings → Profile">
          Navigate to your profile settings.
        </DocStep>
        <DocStep number={2} title="Find Certifications section">
          Scroll to the certifications area.
        </DocStep>
        <DocStep number={3} title="Add certifications">
          Enter each certification with the issuing body and year obtained.
        </DocStep>

        <p className="text-muted-foreground mt-4">
          Common certifications include:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
          <li>NASM, ACE, ACSM (Personal Training)</li>
          <li>Precision Nutrition, ISSA (Nutrition)</li>
          <li>First Aid / CPR</li>
          <li>Specialty certifications (kettlebell, Olympic lifting, etc.)</li>
        </ul>

        <DocTip type="info">
          Certifications listed here will be verified during the verification process. 
          Only include certifications you can provide proof for.
        </DocTip>
      </section>

      {/* Preview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Previewing Your Profile</h2>
        <p className="text-muted-foreground mb-4">
          Before going live, preview how clients will see your profile:
        </p>

        <DocStep number={1} title="View your public profile">
          Click "View Public Profile" in your dashboard to see the client-facing view.
        </DocStep>
        <DocStep number={2} title="Check the marketplace card">
          Use the card preview in Settings to see how you appear in search results.
        </DocStep>
        <DocStep number={3} title="Test on mobile">
          Check your profile on a mobile device—many clients browse on phones.
        </DocStep>

        <DocTip type="tip">
          Ask a friend or colleague to review your profile and give honest feedback. 
          Fresh eyes can spot issues you might miss.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
