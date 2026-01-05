import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldCheck, ShieldX, Heart, Footprints, Moon, Flame, MapPin, Timer, Scale } from "lucide-react";
import { useHealthDataSharing, HealthDataType, CoachWithPreferences } from "@/hooks/useHealthDataSharing";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const DATA_TYPE_ICONS: Record<HealthDataType, React.ReactNode> = {
  all: <Shield className="w-4 h-4" />,
  steps: <Footprints className="w-4 h-4" />,
  heart_rate: <Heart className="w-4 h-4" />,
  sleep: <Moon className="w-4 h-4" />,
  calories: <Flame className="w-4 h-4" />,
  distance: <MapPin className="w-4 h-4" />,
  distance_walking: <Footprints className="w-4 h-4" />,
  distance_cycling: <MapPin className="w-4 h-4" />,
  distance_swimming: <MapPin className="w-4 h-4" />,
  active_minutes: <Timer className="w-4 h-4" />,
  weight: <Scale className="w-4 h-4" />,
};

interface CoachSharingCardProps {
  coach: CoachWithPreferences;
  onUpdatePreference: (coachId: string, dataType: HealthDataType, isAllowed: boolean) => void;
  onSetAll: (coachId: string, isAllowed: boolean) => void;
  isUpdating: boolean;
  isDataTypeAllowed: (coachId: string, dataType: HealthDataType) => boolean;
  dataTypes: HealthDataType[];
}

const CoachSharingCard = ({
  coach,
  onUpdatePreference,
  onSetAll,
  isUpdating,
  isDataTypeAllowed,
  dataTypes,
}: CoachSharingCardProps) => {
  const { t } = useTranslation('settings');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if all data types are allowed
  const allAllowed = dataTypes.every((dt) => isDataTypeAllowed(coach.coach_id, dt));
  const noneAllowed = dataTypes.every((dt) => !isDataTypeAllowed(coach.coach_id, dt));
  const someAllowed = !allAllowed && !noneAllowed;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={coach.coach_avatar || undefined} />
              <AvatarFallback>{coach.coach_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{coach.coach_name}</CardTitle>
              <CardDescription className="text-sm">
                {allAllowed && (
                  <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-900/20">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {t('privacy.fullAccess')}
                  </Badge>
                )}
                {noneAllowed && (
                  <Badge variant="outline" className="text-red-600 border-red-600/30 bg-red-50 dark:bg-red-900/20">
                    <ShieldX className="w-3 h-3 mr-1" />
                    {t('privacy.noAccess')}
                  </Badge>
                )}
                {someAllowed && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-50 dark:bg-amber-900/20">
                    <Shield className="w-3 h-3 mr-1" />
                    {t('privacy.limitedAccess')}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAll(coach.coach_id, true)}
              disabled={isUpdating || allAllowed}
              className="text-xs"
            >
              {t('privacy.shareAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAll(coach.coach_id, false)}
              disabled={isUpdating || noneAllowed}
              className="text-xs text-destructive hover:text-destructive"
            >
              {t('privacy.revokeAll')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full rounded-none border-t py-2 h-auto">
            <span className="text-sm text-muted-foreground">
              {isExpanded ? t('privacy.hideSettings') : t('privacy.showSettings')}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 pb-4">
            <div className="space-y-3">
              {dataTypes.map((dataType) => {
                const icon = DATA_TYPE_ICONS[dataType];
                const isAllowed = isDataTypeAllowed(coach.coach_id, dataType);
                const label = t(`privacy.dataTypes.${dataType}.label`);
                const description = t(`privacy.dataTypes.${dataType}.description`);
                
                return (
                  <div
                    key={dataType}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isAllowed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isAllowed}
                      onCheckedChange={(checked) =>
                        onUpdatePreference(coach.coach_id, dataType, checked)
                      }
                      disabled={isUpdating}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const HealthDataPrivacySettings = () => {
  const { t } = useTranslation('settings');
  const {
    coachesWithPreferences,
    isLoading,
    updatePreference,
    setAllPreferences,
    isDataTypeAllowed,
    dataTypes,
  } = useHealthDataSharing();

  const isUpdating = updatePreference.isPending || setAllPreferences.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (coachesWithPreferences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('privacy.title')}
          </CardTitle>
          <CardDescription>
            {t('privacy.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('privacy.noCoaches')}</p>
            <p className="text-sm mt-1">
              {t('privacy.noCoachesHint')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('privacy.title')}
          </CardTitle>
          <CardDescription>
            {t('privacy.description')} {t('privacy.changesImmediate')}
          </CardDescription>
        </CardHeader>
      </Card>

      {coachesWithPreferences.map((coach) => (
        <CoachSharingCard
          key={coach.coach_id}
          coach={coach}
          onUpdatePreference={(coachId, dataType, isAllowed) =>
            updatePreference.mutate({ coachId, dataType, isAllowed })
          }
          onSetAll={(coachId, isAllowed) =>
            setAllPreferences.mutate({ coachId, isAllowed })
          }
          isUpdating={isUpdating}
          isDataTypeAllowed={isDataTypeAllowed}
          dataTypes={dataTypes}
        />
      ))}
    </div>
  );
};
