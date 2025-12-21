import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('profile.groupClasses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('profile.groupClasses')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groupClasses?.map((groupClass) => {
            const classCurrency = (groupClass.currency as CurrencyCode) || 'GBP';
            const convertedPrice = groupClass.price 
              ? convertForViewer(groupClass.price, classCurrency)
              : null;

            return (
              <div
                key={groupClass.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{groupClass.title}</h4>
                      {groupClass.is_waitlist_open && (
                        <Badge variant="secondary" className="text-xs">{t('profile.waitlistOpen')}</Badge>
                      )}
                    </div>
                    
                    {groupClass.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {groupClass.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {groupClass.schedule_info && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {groupClass.schedule_info}
                        </span>
                      )}
                      {groupClass.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {groupClass.location}
                        </span>
                      )}
                      {groupClass.target_audience && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          {groupClass.target_audience}
                        </span>
                      )}
                      {groupClass.max_participants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {t('profile.maxParticipants', { count: groupClass.max_participants })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {convertedPrice ? (
                      <div className="text-right">
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
      </CardContent>
    </Card>
  );
}