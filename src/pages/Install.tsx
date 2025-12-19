import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Share, Plus, CheckCircle2, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <Helmet>
          <title>FitConnect Installed | You're All Set</title>
          <meta name="description" content="FitConnect is installed on your device. Enjoy quick access to your fitness coaching platform." />
        </Helmet>
        
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
      <Helmet>
        <title>Install FitConnect | Add to Home Screen</title>
        <meta name="description" content="Install FitConnect on your device for quick access to fitness coaching, offline support, and push notifications." />
      </Helmet>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">FC</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Install FitConnect</h1>
          <p className="text-muted-foreground">
            Add FitConnect to your home screen for the best experience
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <Zap className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Instant Access</h3>
            <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
          </Card>
          <Card className="p-4">
            <Wifi className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Works Offline</h3>
            <p className="text-sm text-muted-foreground">Access your data even without internet</p>
          </Card>
          <Card className="p-4">
            <Bell className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">Get reminders for sessions & habits</p>
          </Card>
          <Card className="p-4">
            <Smartphone className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Full Screen</h3>
            <p className="text-sm text-muted-foreground">App-like experience without browser bars</p>
          </Card>
        </div>

        {/* Install Instructions */}
        {canInstall ? (
          <Card className="mb-6">
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
          <Card className="mb-6">
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
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
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
                  <span className="text-sm font-medium text-primary">2</span>
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
                  <span className="text-sm font-medium text-primary">3</span>
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
          <Card className="mb-6">
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
