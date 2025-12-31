import React, { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Video, User, MessageSquare, Calendar, UserPlus, Building, Rocket } from "lucide-react";
import fallbackCoachImage from "@/assets/fallback-coach.webp";
import FavouriteButton from "@/components/favourites/FavouriteButton";
import StarRating from "@/components/reviews/StarRating";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { QualifiedCoachBadge } from "@/components/verification/QualifiedCoachBadge";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { getDisplayLocation } from "@/lib/location-utils";
import { useTranslation } from "@/hooks/useTranslation";
import { getCoachTypeDisplayLabel } from "@/constants/coachTypes";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";

interface CoachCardProps {
  coach: MarketplaceCoach;
  onBook?: (coach: MarketplaceCoach) => void;
  onRequestConnection?: (coach: MarketplaceCoach) => void;
  linkPrefix?: string;
}

const CoachCard = React.memo(({ coach, onBook, onRequestConnection, linkPrefix }: CoachCardProps) => {
  const { t } = useTranslation('coaches');
  // Use pre-fetched rating/review data from RPC instead of N+1 queries
  const averageRating = coach.avg_rating ?? coach.rating ?? 0;
  const reviewCount = coach.review_count ?? coach.reviews_count ?? 0;
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const autoLinkPrefix = useCoachLinkPrefix();
  const effectiveLinkPrefix = linkPrefix ?? autoLinkPrefix;
  const { convertForViewer } = useExchangeRates();
  const { isIOSNative } = usePlatformRestrictions();

  const isClient = user && (role === "client" || role === "admin");
  const isAuthenticated = !!user;

  const handleMessage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    navigate(`/dashboard/client/messages/${coach.id}`);
  }, [isAuthenticated, navigate, coach.id]);

  const handleBook = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    onBook?.(coach);
  }, [isAuthenticated, navigate, onBook, coach]);

  const handleRequestConnection = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth?redirect=/coaches");
      return;
    }
    onRequestConnection?.(coach);
  }, [isAuthenticated, navigate, onRequestConnection, coach]);

  const handleSignUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/auth?tab=register&role=client");
  }, [navigate]);

  // Memoize converted rate calculation
  const coachCurrency = (coach.currency as CurrencyCode) || 'GBP';
  const convertedRate = useMemo(() => 
    coach.hourly_rate ? convertForViewer(coach.hourly_rate, coachCurrency) : null,
    [coach.hourly_rate, coachCurrency, convertForViewer]
  );

  return (
    <div className={`group glass-card-elevated rounded-2xl overflow-hidden hover-lift relative ${coach.is_sponsored ? "ring-2 ring-primary/50" : ""}`}>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {coach.is_sponsored && (
          <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
            <Rocket className="w-3 h-3 mr-1" />
            {t('card.boosted')}
          </Badge>
        )}
        <FavouriteButton coachId={coach.id} />
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {(coach.card_image_url || coach.profile_image_url) ? (
          // Priority 1: Uploaded card or profile image
          <img src={coach.card_image_url || coach.profile_image_url || ""} alt={coach.display_name || "Coach"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : coach.avatars?.slug ? (
          // Priority 2: Selected character avatar displayed full-width
          <div className="w-full h-full overflow-hidden bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-400">
            <img 
              src={getAvatarImageUrl(coach.avatars.slug)} 
              alt={coach.display_name || "Coach"} 
              className="w-full h-[180%] object-contain object-top"
            />
          </div>
        ) : (
          // Priority 3: Fallback to gym image
          <img 
            src={fallbackCoachImage} 
            alt={coach.display_name || "Coach"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {coach.in_person_available && (
            <Badge className="bg-accent/90 text-accent-foreground border-0 backdrop-blur-sm"><User className="w-3 h-3 mr-1" />{t('card.inPerson')}</Badge>
          )}
          {coach.online_available && (
            <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm"><Video className="w-3 h-3 mr-1" />{t('card.online')}</Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={averageRating} reviewCount={reviewCount} size="sm" />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {coach.display_name || "Coach"}
          </h3>
          {coach.is_verified && (
            <VerifiedBadge verifiedAt={coach.verified_at} size="sm" />
          )}
          {(coach.verified_qualification_count ?? 0) >= 1 && (
            <QualifiedCoachBadge count={coach.verified_qualification_count!} size="sm" />
          )}
        </div>
        {coach.coach_types && coach.coach_types.length > 0 && (
          <p className="text-primary text-sm font-medium mb-2">{getCoachTypeDisplayLabel(coach.coach_types[0])}</p>
        )}

        {(coach.location || coach.location_city || coach.gym_affiliation) && (
          <div className="flex flex-col gap-1 text-muted-foreground text-sm mb-4">
            {(coach.location || coach.location_city) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{getDisplayLocation(coach)}
              </div>
            )}
            {coach.gym_affiliation && (
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />{coach.gym_affiliation}
              </div>
            )}
          </div>
        )}

        {coach.bio && <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{coach.bio}</p>}

        {coach.coach_types && coach.coach_types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {coach.coach_types.slice(0, 3).map((type) => (
              <Badge key={type} variant="secondary" className="bg-secondary/80 text-xs">{getCoachTypeDisplayLabel(type)}</Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t border-border sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {convertedRate ? (
              <>
                <span className="font-display font-bold text-xl text-foreground">
                  {formatCurrency(convertedRate.amount, convertedRate.currency)}
                </span>
                <span className="text-muted-foreground text-sm">/{t('card.perSession')}</span>
                {convertedRate.wasConverted && (
                  <span className="text-muted-foreground text-xs block">
                    ({formatCurrency(convertedRate.originalAmount, convertedRate.originalCurrency)})
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">{t('detail.contactForPricing')}</span>
            )}
          </div>
          
          {/* Action Buttons - Hide booking/connection on iOS native */}
          {isClient ? (
            <TooltipProvider>
              <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto justify-end">
                {/* Message button - always show */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('card.message')}</TooltipContent>
                </Tooltip>

                {/* Book and Connect buttons - hide on iOS native */}
                {!isIOSNative && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={handleBook}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('card.bookSession')}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9"
                          onClick={handleRequestConnection}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('connection.title')}</TooltipContent>
                    </Tooltip>
                  </>
                )}

                <Button asChild variant="lime-outline" size="sm">
                  <Link to={`${effectiveLinkPrefix}/${coach.username || coach.id}`}>{t('card.viewProfile')}</Link>
                </Button>
              </div>
            </TooltipProvider>
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              <Button asChild variant="lime-outline" size="sm">
                <Link to={`${effectiveLinkPrefix}/${coach.username || coach.id}`}>{t('card.viewProfile')}</Link>
              </Button>
              <Button variant="lime" size="sm" onClick={handleSignUp}>
                {t('card.connect')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              <Button asChild variant="lime-outline" size="sm">
                <Link to={`${effectiveLinkPrefix}/${coach.username || coach.id}`}>{t('card.viewProfile')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CoachCard.displayName = 'CoachCard';

export default CoachCard;
