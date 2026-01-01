import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Loader2, Send, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage, logError } from "@/lib/error-utils";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [planType, setPlanType] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: coachProfile } = useCoachProfile();
  const queryClient = useQueryClient();

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPlanType("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!coachProfile?.id) {
      toast.error("Coach profile not found");
      return;
    }

    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("send-client-invitation", {
        body: {
          email,
          firstName,
          lastName,
          coachName: coachProfile.display_name || "Your Coach",
          message: message || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send invitation");
      }

      const data = response.data;

      // Show appropriate success message based on response
      if (data.userExists && data.connectionRequestSent) {
        toast.success("Connection request sent!", {
          description: `${firstName} already has an account. They'll receive an in-app notification.`,
          icon: <UserCheck className="w-4 h-4" />,
        });
      } else if (data.emailSent) {
        toast.success("Invitation email sent!", {
          description: `${firstName} will receive an email to join FitConnect.`,
          icon: <Send className="w-4 h-4" />,
        });
      } else {
        toast.success("Invitation sent successfully!");
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });

      resetForm();
      onOpenChange(false);
    } catch (error: unknown) {
      logError("AddClientModal", error);
      const message = getErrorMessage(error);
      
      // Handle specific error messages
      if (message.includes("already connected")) {
        toast.error("This client is already connected to you");
      } else if (message.includes("pending")) {
        toast.error("A connection request is already pending with this client");
      } else if (message.includes("not registered as a client")) {
        toast.error("This user exists but isn't registered as a client");
      } else {
        toast.error(message || "Failed to send invitation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite New Client
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-background border-border"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 min-w-0">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full pl-10 bg-background border-border"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If this user already exists, they'll receive an in-app connection request instead of an email.
            </p>
          </div>
          
          <div className="space-y-2 min-w-0">
            <Label htmlFor="planType">Initial Plan Type</Label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select a plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal-training">Personal Training</SelectItem>
                <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                <SelectItem value="hybrid">Hybrid (Training + Nutrition)</SelectItem>
                <SelectItem value="online">Online Coaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to include in the invitation..."
              className="w-full bg-background border-border min-h-[80px]"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
