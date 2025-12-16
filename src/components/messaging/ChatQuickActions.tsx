import { useState } from "react";
import { DollarSign, Calendar, CreditCard, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSessionTypes } from "@/hooks/useCoachSchedule";
import { useAuth } from "@/contexts/AuthContext";

interface ChatQuickActionsProps {
  coachId: string;
  onSendMessage: (message: string) => Promise<boolean>;
}

const ChatQuickActions = ({ coachId, onSendMessage }: ChatQuickActionsProps) => {
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [sending, setSending] = useState(false);
  const { role } = useAuth();

  const { data: sessionTypes = [] } = useSessionTypes(coachId);

  const isCoach = role === "coach";

  const handleSendPricing = async () => {
    setSending(true);
    
    let pricingMessage = "📋 **My Session Pricing:**\n\n";
    
    if (sessionTypes.length > 0) {
      sessionTypes.forEach(type => {
        pricingMessage += `• **${type.name}** - ${type.duration_minutes} min - $${type.price}\n`;
        if (type.description) {
          pricingMessage += `  _${type.description}_\n`;
        }
      });
    } else {
      pricingMessage += "Please contact me to discuss pricing for your specific needs.";
    }

    await onSendMessage(pricingMessage);
    setSending(false);
    setShowPricingDialog(false);
  };

  const handleSendBookingLink = async () => {
    setSending(true);
    const bookingMessage = `📅 **Ready to book a session?**\n\nClick my profile to view my availability and book a time that works for you!`;
    await onSendMessage(bookingMessage);
    setSending(false);
  };

  const handleSendPaymentRequest = async () => {
    if (!paymentAmount) return;
    
    setSending(true);
    const paymentMessage = `💳 **Payment Request**\n\nAmount: $${paymentAmount}\n${paymentDescription ? `For: ${paymentDescription}\n` : ""}\n_Payment processing coming soon. For now, please arrange payment directly._`;
    await onSendMessage(paymentMessage);
    setSending(false);
    setShowPaymentDialog(false);
    setPaymentAmount("");
    setPaymentDescription("");
  };

  // Only show quick actions for coaches
  if (!isCoach) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-card/50">
        <span className="text-xs text-muted-foreground mr-2">Quick Actions:</span>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowPricingDialog(true)}
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Send Pricing
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={handleSendBookingLink}
          disabled={sending}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Booking Link
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setShowPaymentDialog(true)}
        >
          <CreditCard className="h-3 w-3 mr-1" />
          Request Payment
        </Button>
      </div>

      {/* Pricing Preview Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Pricing Information</DialogTitle>
            <DialogDescription>
              This will send your session types and pricing to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {sessionTypes.length > 0 ? (
              <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                {sessionTypes.map(type => (
                  <div key={type.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.duration_minutes} minutes</p>
                    </div>
                    <p className="font-bold text-primary">${type.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No session types configured yet. Go to Schedule → Session Types to add your offerings.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPricingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPricing} disabled={sending || sessionTypes.length === 0}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Pricing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Request Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payment</DialogTitle>
            <DialogDescription>
              Send a payment request to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Personal Training Session - December 15"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPaymentRequest} disabled={sending || !paymentAmount}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatQuickActions;
