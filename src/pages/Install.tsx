import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Share, Plus, CheckCircle2, Smartphone, Zap, RefreshCw, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead, createBreadcrumbSchema } from '@/components/shared/SEOHead';

// SoftwareApplication schema for app download page
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FitConnect",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "iOS, Android, Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2500",
    "bestRating": "5",
    "worstRating": "1"
  },
  "description": "Find personal trainers, nutritionists and boxing coaches. Track workouts, follow custom plans and achieve your fitness goals.",
  "downloadUrl": "https://play.google.com/store/apps/details?id=com.despia.fitconnect",
  "featureList": "Personal trainer discovery, Workout tracking, Nutrition plans, Progress tracking, Wearable integration"
};

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "https://getfitconnect.co.uk" },
  { name: "Download", url: "https://getfitconnect.co.uk/install" }
]);

const Install = () => {
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall();

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      // Could show a toast here
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEOHead
          title="FitConnect Installed | You're All Set"
          description="FitConnect is installed on your device. Enjoy quick access to your fitness coaching platform."
          noIndex={true}
        />
        
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription>
              FitConnect is installed on your device. Open it from your home screen for the best experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Continue to App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Download FitConnect | Free Fitness App for iOS & Android"
        description="Download FitConnect free on iOS and Android. Find personal trainers near you, track workouts and achieve your fitness goals. Rated 4.8 stars by UK users."
        canonicalPath="/install"
        keywords={["download fitness app", "personal trainer app UK", "workout app iOS", "fitness app Android", "free PT app"]}
        schema={[softwareAppSchema, breadcrumbSchema]}
      />

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
            <img src="/fitconnect-icon.png" alt="FitConnect" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Install FitConnect</h1>
          <p className="text-muted-foreground">
            Add FitConnect to your home screen for the best experience
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card variant="glass" className="p-4">
            <Zap className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Instant Access</h3>
            <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
          </Card>
          <Card variant="glass" className="p-4">
            <RefreshCw className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Seamless Sync</h3>
            <p className="text-sm text-muted-foreground">Your data syncs instantly across all devices</p>
          </Card>
          <Card variant="glass" className="p-4">
            <Bell className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">Get reminders for sessions & habits</p>
          </Card>
          <Card variant="glass" className="p-4">
            <Smartphone className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Full Screen</h3>
            <p className="text-sm text-muted-foreground">App-like experience without browser bars</p>
          </Card>
        </div>

        {/* App Store Downloads */}
        <Card variant="glass" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download the App
            </CardTitle>
            <CardDescription>
              Get the full native experience from your app store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://play.google.com/store/apps/details?id=com.despia.fitconnect&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full h-14 text-base" size="lg">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Get it on Google Play
              </Button>
            </a>
            <Button 
              disabled 
              className="w-full h-14 text-base opacity-60" 
              size="lg" 
              variant="outline"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store - Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* PWA Install Instructions */}
        <div className="mb-6">
          <p className="text-center text-sm text-muted-foreground mb-4">Or add to your home screen</p>
        </div>

        {/* Install Instructions */}
        {canInstall ? (
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install Now
              </CardTitle>
              <CardDescription>
                Click the button below to add FitConnect to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleInstall} size="lg" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Install FitConnect
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5" />
                Install on iOS
              </CardTitle>
              <CardDescription>
                Follow these steps to add FitConnect to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-2">
                <p className="text-sm font-medium text-primary">
                  Important: Make sure you're on the Get Started page before adding to home screen
                </p>
                <Link to="/get-started" className="text-sm text-primary underline">
                  Go to Get Started page first →
                </Link>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Navigate to getfitconnect.co.uk/get-started</p>
                  <p className="text-sm text-muted-foreground">
                    This ensures the app opens to the right page
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Share className="w-4 h-4 inline" /> icon at the bottom of Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Plus className="w-4 h-4 inline" /> icon in the menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    FitConnect will appear on your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install on Android
              </CardTitle>
              <CardDescription>
                Follow these steps to add FitConnect to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the three dots (⋮) in Chrome's top right corner
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Add to Home screen" or "Install app"</p>
                  <p className="text-sm text-muted-foreground">
                    The option may vary depending on your browser
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Confirm the installation</p>
                  <p className="text-sm text-muted-foreground">
                    FitConnect will appear on your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip link */}
        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Continue without installing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
