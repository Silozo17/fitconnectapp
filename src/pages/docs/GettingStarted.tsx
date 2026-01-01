import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep } from "@/components/docs/DocStep";
import { DocTip } from "@/components/docs/DocTip";
import { DocScreenshot } from "@/components/docs/DocScreenshot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Dumbbell, ArrowRight } from "lucide-react";

export default function GettingStarted() {
  return (
    <DocsLayout
      title="Getting Started | How to Use FitConnect App"
      description="New to FitConnect? Learn how to create your account, find personal trainers, book sessions and start your UK fitness journey in minutes."
      breadcrumbs={[{ label: "Getting Started" }]}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">What is FitConnect?</h2>
        <p className="text-muted-foreground mb-4">
          FitConnect is a comprehensive platform that connects fitness enthusiasts with professional coaches. 
          Whether you're looking for a personal trainer, nutritionist, boxing coach, or MMA instructor, 
          FitConnect makes it easy to find, book, and work with the perfect coach for your goals.
        </p>
        <p className="text-muted-foreground">
          For coaches, FitConnect provides all the tools you need to manage your business, from client 
          management and scheduling to workout planning and payment processing.
        </p>
      </section>

      {/* Choose Your Path */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Choose Your Path</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <User className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>I'm Looking for a Coach</CardTitle>
              <CardDescription>
                Find professional coaches, book sessions, and track your fitness journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/docs/client">
                  Client Guide <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <Dumbbell className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle>I'm a Fitness Coach</CardTitle>
              <CardDescription>
                Set up your profile, manage clients, and grow your coaching business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/docs/coach">
                  Coach Guide <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start for Clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Start: Finding a Coach</h2>
        <DocStep number={1} title="Create your account">
          Click "Get Started" on the homepage and choose "I'm looking for a coach". 
          Fill in your email and create a password. You can also sign up with Google for faster access.
        </DocStep>
        <DocStep number={2} title="Complete your profile">
          Tell us about your fitness goals, any health considerations, and preferences. 
          This helps coaches understand your needs and provide better recommendations.
        </DocStep>
        <DocStep number={3} title="Browse coaches">
          Use our search and filters to find coaches that match your needs. 
          Filter by specialty (personal training, nutrition, boxing, MMA), location, price range, and availability.
        </DocStep>
        <DocStep number={4} title="Connect and book">
          Found a coach you like? Send them a connection request or book a session directly. 
          Many coaches offer free consultations to help you get started.
        </DocStep>

        <DocTip type="tip">
          Save coaches to your favourites by clicking the heart icon. This makes it easy to compare options before making a decision.
        </DocTip>
      </section>

      {/* Quick Start for Coaches */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Start: Setting Up as a Coach</h2>
        <DocStep number={1} title="Create your coach account">
          Click "Get Started" and choose "I'm a fitness coach". Complete the registration process with your professional details.
        </DocStep>
        <DocStep number={2} title="Complete your profile">
          Add your bio, certifications, specialties, and profile photos. A complete profile helps attract more clients.
        </DocStep>
        <DocStep number={3} title="Set your availability">
          Configure your working hours and session types. Define the services you offer and their prices.
        </DocStep>
        <DocStep number={4} title="Connect Stripe">
          Set up Stripe to accept payments from clients. This is required to receive payments through the platform.
        </DocStep>
        <DocStep number={5} title="Get verified">
          Upload your certifications and ID for verification. Verified coaches get a badge and better visibility in search results.
        </DocStep>

        <DocTip type="info">
          While you can start accepting clients immediately, we recommend completing verification to build trust with potential clients.
        </DocTip>
      </section>

      {/* Platform Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Platform Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">For Clients</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Browse and filter coaches</li>
              <li>• Book sessions online 24/7</li>
              <li>• Receive workout & nutrition plans</li>
              <li>• Track progress with photos and metrics</li>
              <li>• Earn achievements and compete on leaderboards</li>
              <li>• Connect wearable devices</li>
              <li>• Generate grocery lists from meal plans</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">For Coaches</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Professional profile with portfolio</li>
              <li>• Client management dashboard</li>
              <li>• Workout and nutrition plan builders</li>
              <li>• Scheduling and availability management</li>
              <li>• Secure payment processing</li>
              <li>• Message templates and quick actions</li>
              <li>• Sales pipeline and analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
        <p className="text-muted-foreground mb-4">
          Ready to dive deeper? Explore our detailed guides for clients and coaches.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="lime">
            <Link to="/docs/client">Client Documentation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/docs/coach">Coach Documentation</Link>
          </Button>
        </div>
      </section>
    </DocsLayout>
  );
}
