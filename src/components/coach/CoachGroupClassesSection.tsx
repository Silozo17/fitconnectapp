import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoachGroupClasses, useJoinWaitlist, useMyWaitlistEntries } from "@/hooks/useCoachGroupClasses";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Clock, Target, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { toast } from "sonner";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useTranslation } from "@/hooks/useTranslation";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";

interface CoachGroupClassesSectionProps {
  coachId: string;
}

export function CoachGroupClassesSection({ coachId }: CoachGroupClassesSectionProps) {
  const { t } = useTranslation('coaches');
  const { data: groupClasses, isLoading } = useCoachGroupClasses(coachId);
  const { data: myWaitlistEntries = [] } = useMyWaitlistEntries();
  const joinWaitlist = useJoinWaitlist();
  const { user, role } = useAuth();
  const { convertForViewer } = useExchangeRates();

  // Don't render if no active classes
  if (!isLoading && (!groupClasses || groupClasses.length === 0)) {
    return null;
  }

  const handleJoinWaitlist = async (classId: string) => {
    if (!user) {
      toast.error("Please sign in to join waitlist");
      return;
    }
    if (role !== "client") {
      toast.error("Only clients can join waitlists");
      return;
    }
    joinWaitlist.mutate(classId);
  };

  const isOnWaitlist = (classId: string) => {
    return myWaitlistEntries.some(entry => entry.group_class_id === classId);
  };

  if (isLoading) {
    return (
      <ContentSection colorTheme="blue">
        <ContentSectionHeader
          icon={Users}
          title={t('profile.groupClasses')}
        />
        <div className="space-y-4 pt-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </ContentSection>
    );
  }

  return (
    <ContentSection colorTheme="blue">
      <ContentSectionHeader
        icon={Users}
        title={t('profile.groupClasses')}
      />
      <div className="space-y-4 pt-4">
        {groupClasses?.map((groupClass) => {
          const classCurrency = (groupClass.currency as CurrencyCode) || 'GBP';
          const convertedPrice = groupClass.price 
            ? convertForViewer(groupClass.price, classCurrency)
            : null;

          return (
            <div
              key={groupClass.id}
              className="p-4 rounded-xl bg-muted/30 space-y-3"
            >
              <div className="flex flex-col gap-3">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground break-words">{groupClass.title}</h4>
                    {groupClass.is_waitlist_open && (
                      <Badge variant="secondary" className="text-xs shrink-0">{t('profile.waitlistOpen')}</Badge>
                    )}
                  </div>
                  
                  {groupClass.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {groupClass.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {groupClass.schedule_info && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">{groupClass.schedule_info}</span>
                      </span>
                    )}
                    {groupClass.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">{groupClass.location}</span>
                      </span>
                    )}
                    {groupClass.target_audience && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-words">{groupClass.target_audience}</span>
                      </span>
                    )}
                    {groupClass.max_participants && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {t('profile.maxParticipants', { count: groupClass.max_participants })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                  {convertedPrice ? (
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(convertedPrice.amount, convertedPrice.currency)}
                      </p>
                      {convertedPrice.wasConverted && (
                        <p className="text-xs text-muted-foreground">
                          ({formatCurrency(convertedPrice.originalAmount, convertedPrice.originalCurrency)})
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('profile.contactForPricing')}</p>
                  )}
                  
                  {groupClass.is_waitlist_open && user && role === "client" && (
                    <Button
                      size="sm"
                      variant={isOnWaitlist(groupClass.id) ? "secondary" : "default"}
                      disabled={isOnWaitlist(groupClass.id) || joinWaitlist.isPending}
                      onClick={() => handleJoinWaitlist(groupClass.id)}
                      className="shrink-0"
                    >
                      {joinWaitlist.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isOnWaitlist(groupClass.id) ? (
                        t('profile.onWaitlist')
                      ) : (
                        t('profile.joinWaitlist')
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ContentSection>
  );
}
