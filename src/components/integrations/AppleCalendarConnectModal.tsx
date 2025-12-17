import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Eye, EyeOff, Loader2, Apple, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AppleCalendarConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppleCalendarConnectModal = ({ open, onOpenChange }: AppleCalendarConnectModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  const handleConnect = async () => {
    if (!email || !password) {
      toast.error("Please enter your iCloud email and app-specific password");
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("calendar-caldav-connect", {
        body: { email, appSpecificPassword: password, provider: "apple_calendar" },
      });

      if (error) throw error;

      toast.success("Apple Calendar connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["calendar-connections"] });
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900">
              <Apple className="h-5 w-5 text-white" />
            </div>
            Connect Apple Calendar
          </DialogTitle>
          <DialogDescription>
            Connect your iCloud Calendar using an app-specific password for secure access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-primary">Secure Connection</p>
              <p className="text-muted-foreground mt-1">
                We use an app-specific password, not your main iCloud password. This is Apple's recommended way for third-party apps.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">How to generate an app-specific password:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Sign in to <a href="https://appleid.apple.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">appleid.apple.com <ExternalLink className="h-3 w-3" /></a></li>
              <li>Go to Security → App-Specific Passwords</li>
              <li>Click "Generate Password"</li>
              <li>Name it "FitConnect" and copy the password</li>
            </ol>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="icloud-email">iCloud Email</Label>
              <Input
                id="icloud-email"
                type="email"
                placeholder="your@icloud.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConnecting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-password">App-Specific Password</Label>
              <div className="relative">
                <Input
                  id="app-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isConnecting}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: xxxx-xxxx-xxxx-xxxx (generated from Apple ID settings)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConnecting}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting || !email || !password}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Calendar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppleCalendarConnectModal;
