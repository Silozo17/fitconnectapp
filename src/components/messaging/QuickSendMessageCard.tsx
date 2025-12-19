import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Package, 
  CreditCard, 
  FileText, 
  Dumbbell, 
  Utensils, 
  Layers,
  Check,
  X,
  CheckCheck,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuickSendMetadata } from "@/types/messaging";
import { Message, getQuickSendMetadata } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickSendMessageCardProps {
  message: Message;
  isMine: boolean;
  currentProfileId: string;
  onStatusUpdate?: () => void;
}

const itemTypeConfig = {
  'package': {
    icon: Package,
    label: 'Package Offer',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  'subscription': {
    icon: CreditCard,
    label: 'Subscription Plan',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  'digital-product': {
    icon: FileText,
    label: 'Digital Product',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  'digital-bundle': {
    icon: Layers,
    label: 'Digital Bundle',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  'training-plan': {
    icon: Dumbbell,
    label: 'Training Plan',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  'meal-plan': {
    icon: Utensils,
    label: 'Meal Plan',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  }
};

const formatPrice = (price: number, currency: string = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

const QuickSendMessageCard = ({ 
  message, 
  isMine, 
  currentProfileId,
  onStatusUpdate 
}: QuickSendMessageCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  
  const metadata = getQuickSendMetadata(message.metadata);
  if (!metadata) return null;
  
  const config = itemTypeConfig[metadata.itemType] || itemTypeConfig['package'];
  const Icon = config.icon;
  
  // Client can respond if: they received the message, it's pending, and they're not the coach
  const canRespond = !isMine && metadata.status === 'pending';
  
  const handleAccept = async () => {
    setUpdating(true);
    try {
      // Update message status
      const { error } = await supabase
        .from('messages')
        .update({
          metadata: {
            ...metadata,
            status: 'accepted',
            respondedAt: new Date().toISOString()
          }
        })
        .eq('id', message.id);
      
      if (error) throw error;
      
      toast({
        title: "Offer accepted!",
        description: "Redirecting to checkout...",
      });
      
      onStatusUpdate?.();
      
      // Navigate to checkout
      const checkoutParams = new URLSearchParams({
        type: metadata.itemType,
        itemId: metadata.itemId,
        coachId: metadata.coachId,
        returnUrl: window.location.pathname
      });
      
      navigate(`/checkout?${checkoutParams.toString()}`);
    } catch (err) {
      console.error('Error accepting offer:', err);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleDecline = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          metadata: {
            ...metadata,
            status: 'declined',
            respondedAt: new Date().toISOString()
          }
        })
        .eq('id', message.id);
      
      if (error) throw error;
      
      toast({
        title: "Offer declined",
        description: "The coach has been notified.",
      });
      
      onStatusUpdate?.();
    } catch (err) {
      console.error('Error declining offer:', err);
      toast({
        title: "Error",
        description: "Failed to decline offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (metadata.status) {
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
            <CheckCheck className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/30">
            <X className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <Card className={cn(
        "max-w-[85%] sm:max-w-[70%] overflow-hidden border",
        isMine ? "bg-primary/5 border-primary/20" : "bg-muted border-border"
      )}>
        <CardContent className="p-0">
          {/* Header */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 border-b",
            config.bgColor
          )}>
            <Icon className={cn("w-4 h-4", config.color)} />
            <span className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </span>
            <div className="ml-auto">
              {getStatusBadge()}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-foreground">
              {metadata.itemName}
            </h4>
            
            {metadata.itemDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {metadata.itemDescription}
              </p>
            )}
            
            {/* Additional info */}
            <div className="flex flex-wrap gap-2 text-sm">
              {metadata.price !== undefined && metadata.price > 0 && (
                <span className="font-medium text-foreground">
                  {formatPrice(metadata.price, metadata.currency)}
                </span>
              )}
              {metadata.sessionCount && (
                <span className="text-muted-foreground">
                  • {metadata.sessionCount} sessions
                </span>
              )}
              {metadata.billingPeriod && (
                <span className="text-muted-foreground">
                  • {metadata.billingPeriod}
                </span>
              )}
            </div>
          </div>
          
          {/* Actions for client */}
          {canRespond && (
            <div className="flex gap-2 p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                disabled={updating}
                className="flex-1"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={updating}
                className="flex-1"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Accept & Pay
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Responded timestamp */}
          {metadata.respondedAt && (
            <div className="px-4 pb-2 text-xs text-muted-foreground">
              {metadata.status === 'accepted' ? 'Accepted' : 'Declined'} {format(new Date(metadata.respondedAt), 'MMM d, HH:mm')}
            </div>
          )}
          
          {/* Message timestamp */}
          <div className={cn(
            "flex items-center gap-1 px-4 pb-2",
            isMine ? "justify-end" : "justify-start"
          )}>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {isMine && (
              message.read_at ? (
                <CheckCheck className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Check className="w-3 h-3 text-muted-foreground/50" />
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickSendMessageCard;
