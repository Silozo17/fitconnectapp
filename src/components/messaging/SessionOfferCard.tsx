import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Video, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRespondToSessionOffer, SessionOffer } from "@/hooks/useSessionOffers";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SessionOfferCardProps {
  offer: SessionOffer;
  isOwnMessage: boolean;
}

const SessionOfferCard = ({ offer, isOwnMessage }: SessionOfferCardProps) => {
  const { role } = useAuth();
  const respondToOffer = useRespondToSessionOffer();
  const [isResponding, setIsResponding] = useState(false);

  const isClient = role === "client";
  const canRespond = isClient && offer.status === "pending";
  const proposedDate = new Date(offer.proposed_date);

  const handleResponse = async (response: "accepted" | "declined") => {
    setIsResponding(true);
    try {
      await respondToOffer.mutateAsync({ offerId: offer.id, response });
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = () => {
    switch (offer.status) {
      case "accepted":
        return <Badge className="bg-success/20 text-success border-success/30">Accepted</Badge>;
      case "declined":
        return <Badge variant="outline" className="text-muted-foreground">Declined</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-warning">Expired</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-primary">Pending</Badge>;
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 max-w-[320px] border",
        isOwnMessage
          ? "bg-primary/10 border-primary/20"
          : "bg-card border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Session Offer
        </span>
        {getStatusBadge()}
      </div>

      {/* Session Type */}
      <h4 className="font-semibold text-foreground mb-3">{offer.session_type}</h4>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(proposedDate, "EEEE, MMMM do")}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{format(proposedDate, "HH:mm")} • {offer.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          {offer.is_online ? (
            <>
              <Video className="w-4 h-4 text-muted-foreground" />
              <span>Online Session</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{offer.location || "In-Person"}</span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-bold text-lg text-foreground">
            {offer.is_free ? "FREE" : `£${offer.price}`}
          </span>
        </div>
      </div>

      {/* Notes */}
      {offer.notes && (
        <p className="mt-3 text-sm text-muted-foreground italic">"{offer.notes}"</p>
      )}

      {/* Actions for Client */}
      {canRespond && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleResponse("declined")}
            disabled={isResponding}
          >
            {isResponding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Decline
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => handleResponse("accepted")}
            disabled={isResponding}
          >
            {isResponding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-3 h-3 mr-1" />
                Accept
              </>
            )}
          </Button>
        </div>
      )}

      {/* Status message for coach */}
      {!isClient && offer.status === "pending" && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Waiting for client response...
        </p>
      )}
    </div>
  );
};

export default SessionOfferCard;
