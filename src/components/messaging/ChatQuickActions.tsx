import { useState } from "react";
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Loader2, 
  FileText,
  CalendarPlus,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSessionTypes } from "@/hooks/useCoachSchedule";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { useAdminView } from "@/contexts/AdminContext";
import SessionOfferDialog from "./SessionOfferDialog";

interface ChatQuickActionsProps {
  coachId: string;
  /** The auth user_id of the participant (not client_profile.id) */
  participantUserId?: string;
  onSendMessage: (message: string) => Promise<boolean>;
}

const ChatQuickActions = ({ coachId, participantUserId, onSendMessage }: ChatQuickActionsProps) => {
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTemplatesPopover, setShowTemplatesPopover] = useState(false);
  const [showSessionOfferDialog, setShowSessionOfferDialog] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [sending, setSending] = useState(false);
  const { activeProfileType } = useAdminView();

  const { data: sessionTypes = [] } = useSessionTypes(coachId);
  const { templates, loading: templatesLoading } = useMessageTemplates();

  const isCoachView = activeProfileType === "coach";

  const handleSendPricing = async () => {
    setSending(true);
    
    let pricingMessage = "**My Session Pricing:**\n\n";
    
    if (sessionTypes.length > 0) {
      sessionTypes.forEach(type => {
        pricingMessage += `• **${type.name}** - ${type.duration_minutes} min - £${type.price}\n`;
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
    setShowMobileDrawer(false);
    const bookingMessage = `**Ready to book a session?**\n\nClick my profile to view my availability and book a time that works for you!`;
    await onSendMessage(bookingMessage);
    setSending(false);
  };

  const handleSendPaymentRequest = async () => {
    if (!paymentAmount) return;
    
    setSending(true);
    const paymentMessage = `**Payment Request**\n\nAmount: £${paymentAmount}\n${paymentDescription ? `For: ${paymentDescription}\n` : ""}\n_Payment processing coming soon. For now, please arrange payment directly._`;
    await onSendMessage(paymentMessage);
    setSending(false);
    setShowPaymentDialog(false);
    setPaymentAmount("");
    setPaymentDescription("");
  };

  const handleUseTemplate = async (content: string) => {
    setSending(true);
    setShowMobileDrawer(false);
    await onSendMessage(content);
    setSending(false);
    setShowTemplatesPopover(false);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  // Only show quick actions for coach view
  if (!isCoachView) return null;

  // Desktop quick actions bar
  const DesktopQuickActions = () => (
    <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-t border-border bg-card relative z-10 overflow-x-auto">
      <span className="text-xs text-muted-foreground mr-2 flex-shrink-0">Quick:</span>
      
      {/* Templates Popover */}
      <Popover open={showTemplatesPopover} onOpenChange={setShowTemplatesPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs flex-shrink-0"
          >
            <FileText className="h-3 w-3 mr-1" />
            Templates
            {templates.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {templates.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b border-border">
            <h4 className="font-medium text-sm">Message Templates</h4>
            <p className="text-xs text-muted-foreground">Click to send</p>
          </div>
          <ScrollArea className="max-h-64">
            {templatesLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No templates yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create templates in Settings → Messages
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 mb-1 capitalize">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleUseTemplate(template.content)}
                          disabled={sending}
                          className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <p className="text-sm font-medium text-foreground">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs flex-shrink-0"
        onClick={() => setShowPricingDialog(true)}
      >
        <DollarSign className="h-3 w-3 mr-1" />
        Pricing
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs flex-shrink-0"
        onClick={handleSendBookingLink}
        disabled={sending}
      >
        <Calendar className="h-3 w-3 mr-1" />
        Book
      </Button>

      {/* Session Offer Button */}
      {participantUserId && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs flex-shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => setShowSessionOfferDialog(true)}
        >
          <CalendarPlus className="h-3 w-3 mr-1" />
          Session Offer
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs flex-shrink-0"
        onClick={() => setShowPaymentDialog(true)}
      >
        <CreditCard className="h-3 w-3 mr-1" />
        Payment
      </Button>
    </div>
  );

  // Mobile quick actions button + drawer
  const MobileQuickActions = () => (
    <div className="sm:hidden px-4 py-2 border-t border-border bg-card relative z-10">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-9"
        onClick={() => setShowMobileDrawer(true)}
      >
        <Zap className="h-4 w-4 mr-2" />
        Quick Actions
      </Button>
    </div>
  );

  return (
    <>
      <DesktopQuickActions />
      <MobileQuickActions />

      {/* Mobile Quick Actions Drawer */}
      <Drawer open={showMobileDrawer} onOpenChange={setShowMobileDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Quick Actions</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowTemplatesPopover(true);
                }}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Templates</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowPricingDialog(true);
                }}
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Pricing</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={handleSendBookingLink}
                disabled={sending}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Book</span>
              </Button>

              {participantUserId && (
                <Button
                  variant="outline"
                  className="h-14 flex-col gap-1 border-primary/30 text-primary"
                  onClick={() => {
                    setShowMobileDrawer(false);
                    setShowSessionOfferDialog(true);
                  }}
                >
                  <CalendarPlus className="h-5 w-5" />
                  <span className="text-xs">Session Offer</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                className="h-14 flex-col gap-1"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowPaymentDialog(true);
                }}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Payment</span>
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
                    <p className="font-bold text-primary">£{type.price}</p>
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
              <Label htmlFor="amount">Amount (£)</Label>
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

      {/* Session Offer Dialog */}
      {participantUserId && (
        <SessionOfferDialog
          open={showSessionOfferDialog}
          onOpenChange={setShowSessionOfferDialog}
          coachId={coachId}
          participantUserId={participantUserId}
          onOfferCreated={async (offerId, offerDetails) => {
            await onSendMessage(offerDetails);
          }}
        />
      )}
    </>
  );
};

export default ChatQuickActions;
