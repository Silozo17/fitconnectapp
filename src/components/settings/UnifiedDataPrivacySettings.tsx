import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Share2,
  ShieldOff,
  Loader2,
  Camera,
  Utensils,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  Flame,
  MapPin,
  Timer,
  Scale,
  Bike,
  Waves,
  LucideIcon,
} from "lucide-react";
import {
  useUnifiedDataPrivacy,
  DataType,
  ClientDataType,
  HealthDataType,
  CoachWithAllPreferences,
  CLIENT_DATA_TYPES,
  HEALTH_DATA_TYPES,
} from "@/hooks/useUnifiedDataPrivacy";

// Icons for all data types
const DATA_TYPE_ICONS: Record<DataType, LucideIcon> = {
  // Client data
  progress_photos: Camera,
  meal_logs: Utensils,
  training_logs: Dumbbell,
  // Health data
  steps: Footprints,
  heart_rate: Heart,
  sleep: Moon,
  calories: Flame,
  distance: MapPin,
  distance_walking: Footprints,
  distance_cycling: Bike,
  distance_swimming: Waves,
  active_minutes: Timer,
  weight: Scale,
};

// Labels and descriptions for all data types
const DATA_TYPE_INFO: Record<DataType, { label: string; description: string }> = {
  // Client data
  progress_photos: {
    label: "Progress Photos",
    description: "Photos tracking your physical progress",
  },
  meal_logs: {
    label: "Meal Logs",
    description: "Your food diary and meal entries",
  },
  training_logs: {
    label: "Training Logs",
    description: "Your workout sessions and exercise data",
  },
  // Health data
  steps: {
    label: "Steps",
    description: "Daily step count from wearables",
  },
  heart_rate: {
    label: "Heart Rate",
    description: "Heart rate measurements",
  },
  sleep: {
    label: "Sleep",
    description: "Sleep duration and quality data",
  },
  calories: {
    label: "Calories Burned",
    description: "Active calories burned",
  },
  distance: {
    label: "Distance",
    description: "Total distance traveled",
  },
  distance_walking: {
    label: "Walking Distance",
    description: "Distance from walking/running",
  },
  distance_cycling: {
    label: "Cycling Distance",
    description: "Distance from cycling",
  },
  distance_swimming: {
    label: "Swimming Distance",
    description: "Distance from swimming",
  },
  active_minutes: {
    label: "Active Minutes",
    description: "Minutes of activity",
  },
  weight: {
    label: "Weight",
    description: "Body weight measurements",
  },
};

interface DataTypeSwitchProps {
  dataType: DataType;
  isAllowed: boolean;
  onToggle: (isAllowed: boolean) => void;
  isPending: boolean;
  getLabel: (dataType: DataType) => string;
  getDescription: (dataType: DataType) => string;
}

const DataTypeSwitch = ({ dataType, isAllowed, onToggle, isPending, getLabel, getDescription }: DataTypeSwitchProps) => {
  const Icon = DATA_TYPE_ICONS[dataType];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{getLabel(dataType)}</p>
          <p className="text-xs text-muted-foreground">{getDescription(dataType)}</p>
        </div>
      </div>
      <Switch
        checked={isAllowed}
        onCheckedChange={onToggle}
        disabled={isPending}
      />
    </div>
  );
};

interface CoachPrivacyCardProps {
  coach: CoachWithAllPreferences;
  isDataTypeAllowed: (coachId: string, dataType: DataType) => boolean;
  getAccessStatus: (coachId: string) => "full" | "none" | "limited";
  onUpdatePreference: (coachId: string, dataType: DataType, isAllowed: boolean) => void;
  onSetAll: (coachId: string, isAllowed: boolean) => void;
  isPending: boolean;
  getLabel: (dataType: DataType) => string;
  getDescription: (dataType: DataType) => string;
  translations: {
    fullAccess: string;
    noAccess: string;
    limitedAccess: string;
    shareAll: string;
    revokeAll: string;
    showSettings: string;
    hideSettings: string;
    clientData: string;
    healthData: string;
  };
}

const CoachPrivacyCard = ({
  coach,
  isDataTypeAllowed,
  getAccessStatus,
  onUpdatePreference,
  onSetAll,
  isPending,
  getLabel,
  getDescription,
  translations,
}: CoachPrivacyCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const accessStatus = getAccessStatus(coach.coach_id);

  const accessBadge = {
    full: { label: translations.fullAccess, variant: "default" as const, className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
    none: { label: translations.noAccess, variant: "secondary" as const, className: "bg-destructive/20 text-destructive border-destructive/30" },
    limited: { label: translations.limitedAccess, variant: "outline" as const, className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  };

  const badge = accessBadge[accessStatus];

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={coach.coach_avatar || undefined} />
                <AvatarFallback>{coach.coach_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{coach.coach_name}</CardTitle>
                <Badge variant={badge.variant} className={badge.className}>
                  {badge.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetAll(coach.coach_id, true)}
                disabled={isPending}
                className="text-xs flex-1 sm:flex-initial"
              >
                <Share2 className="h-3 w-3 mr-1" />
                {translations.shareAll}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetAll(coach.coach_id, false)}
                disabled={isPending}
                className="text-xs text-destructive hover:text-destructive flex-1 sm:flex-initial"
              >
                <ShieldOff className="h-3 w-3 mr-1" />
                {translations.revokeAll}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-center py-2 h-auto">
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {translations.hideSettings}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {translations.showSettings}
              </>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Client Data Section */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {translations.clientData}
              </h4>
              <div className="space-y-1">
                {CLIENT_DATA_TYPES.map((dataType) => (
                  <DataTypeSwitch
                    key={dataType}
                    dataType={dataType}
                    isAllowed={isDataTypeAllowed(coach.coach_id, dataType)}
                    onToggle={(allowed) => onUpdatePreference(coach.coach_id, dataType, allowed)}
                    isPending={isPending}
                    getLabel={getLabel}
                    getDescription={getDescription}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Health Data Section */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {translations.healthData}
              </h4>
              <div className="space-y-1">
                {HEALTH_DATA_TYPES.map((dataType) => (
                  <DataTypeSwitch
                    key={dataType}
                    dataType={dataType}
                    isAllowed={isDataTypeAllowed(coach.coach_id, dataType)}
                    onToggle={(allowed) => onUpdatePreference(coach.coach_id, dataType, allowed)}
                    isPending={isPending}
                    getLabel={getLabel}
                    getDescription={getDescription}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const UnifiedDataPrivacySettings = () => {
  const { t } = useTranslation('settings');
  const {
    coachesWithPreferences,
    isLoading,
    updatePreference,
    setAllPreferences,
    isDataTypeAllowed,
    getAccessStatus,
  } = useUnifiedDataPrivacy();

  const isPending = updatePreference.isPending || setAllPreferences.isPending;

  const handleUpdatePreference = (coachId: string, dataType: DataType, isAllowed: boolean) => {
    updatePreference.mutate({ coachId, dataType, isAllowed });
  };

  const handleSetAll = (coachId: string, isAllowed: boolean) => {
    setAllPreferences.mutate({ coachId, isAllowed });
  };

  // Helper functions for translations
  const getDataTypeLabel = (dataType: DataType): string => {
    return t(`dataPrivacy.dataTypes.${dataType}.label`, DATA_TYPE_INFO[dataType].label);
  };

  const getDataTypeDescription = (dataType: DataType): string => {
    return t(`dataPrivacy.dataTypes.${dataType}.description`, DATA_TYPE_INFO[dataType].description);
  };

  const translations = {
    fullAccess: t('dataPrivacy.fullAccess', 'Full Access'),
    noAccess: t('dataPrivacy.noAccess', 'No Access'),
    limitedAccess: t('dataPrivacy.limitedAccess', 'Limited Access'),
    shareAll: t('dataPrivacy.shareAll', 'Share All'),
    revokeAll: t('dataPrivacy.revokeAll', 'Revoke All'),
    showSettings: t('dataPrivacy.showSettings', 'Show settings'),
    hideSettings: t('dataPrivacy.hideSettings', 'Hide settings'),
    clientData: t('dataPrivacy.clientData', 'Client Data'),
    healthData: t('dataPrivacy.healthData', 'Health Data (from wearables)'),
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (coachesWithPreferences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('dataPrivacy.title', 'Data Privacy')}</CardTitle>
          </div>
          <CardDescription>
            {t('dataPrivacy.description', 'Control what data your coaches can see.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('dataPrivacy.noCoaches', "You don't have any active coaches yet.")} {t('dataPrivacy.noCoachesHint', 'Once you connect with a coach, you can manage your data sharing preferences here.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('dataPrivacy.title', 'Data Privacy')}</CardTitle>
          </div>
          <CardDescription>
            {t('dataPrivacy.descriptionWithChanges', 'Control what data your coaches can see. Changes take effect immediately.')}
          </CardDescription>
        </CardHeader>
      </Card>

      {coachesWithPreferences.map((coach) => (
        <CoachPrivacyCard
          key={coach.coach_id}
          coach={coach}
          isDataTypeAllowed={isDataTypeAllowed}
          getAccessStatus={getAccessStatus}
          onUpdatePreference={handleUpdatePreference}
          onSetAll={handleSetAll}
          isPending={isPending}
          getLabel={getDataTypeLabel}
          getDescription={getDataTypeDescription}
          translations={translations}
        />
      ))}
    </div>
  );
};
