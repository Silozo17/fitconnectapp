import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldCheck, ShieldX, Camera, Utensils, Dumbbell } from "lucide-react";
import { useClientDataPrivacy, ClientDataType, CoachWithDataPreferences } from "@/hooks/useClientDataPrivacy";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const DATA_TYPE_ICONS: Record<ClientDataType, React.ReactNode> = {
  progress_photos: <Camera className="w-4 h-4" />,
  meal_logs: <Utensils className="w-4 h-4" />,
  training_logs: <Dumbbell className="w-4 h-4" />,
};

const DATA_TYPE_LABELS: Record<ClientDataType, { label: string; description: string }> = {
  progress_photos: {
    label: "Progress Photos",
    description: "Allow your coach to view your progress photos",
  },
  meal_logs: {
    label: "Meal Logs",
    description: "Allow your coach to view your food diary entries",
  },
  training_logs: {
    label: "Training Logs",
    description: "Allow your coach to view your workout logs",
  },
};

interface CoachDataSharingCardProps {
  coach: CoachWithDataPreferences;
  onUpdatePreference: (coachId: string, dataType: ClientDataType, isAllowed: boolean) => void;
  onSetAll: (coachId: string, isAllowed: boolean) => void;
  isUpdating: boolean;
  isDataTypeAllowed: (coachId: string, dataType: ClientDataType) => boolean;
  dataTypes: ClientDataType[];
}

const CoachDataSharingCard = ({
  coach,
  onUpdatePreference,
  onSetAll,
  isUpdating,
  isDataTypeAllowed,
  dataTypes,
}: CoachDataSharingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
                    Full Access
                  </Badge>
                )}
                {noneAllowed && (
                  <Badge variant="outline" className="text-red-600 border-red-600/30 bg-red-50 dark:bg-red-900/20">
                    <ShieldX className="w-3 h-3 mr-1" />
                    No Access
                  </Badge>
                )}
                {someAllowed && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-50 dark:bg-amber-900/20">
                    <Shield className="w-3 h-3 mr-1" />
                    Limited Access
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
              Share All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetAll(coach.coach_id, false)}
              disabled={isUpdating || noneAllowed}
              className="text-xs text-destructive hover:text-destructive"
            >
              Revoke All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full rounded-none border-t py-2 h-auto">
            <span className="text-sm text-muted-foreground">
              {isExpanded ? "Hide settings" : "Show settings"}
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
                const { label, description } = DATA_TYPE_LABELS[dataType];
                
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

export const ClientDataPrivacySettings = () => {
  const {
    coachesWithPreferences,
    isLoading,
    updatePreference,
    setAllPreferences,
    isDataTypeAllowed,
    dataTypes,
  } = useClientDataPrivacy();

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
            Data Privacy
          </CardTitle>
          <CardDescription>
            Control what data your coaches can see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No coaches connected</p>
            <p className="text-sm mt-1">
              Connect with a coach to manage data sharing settings
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
            Data Privacy
          </CardTitle>
          <CardDescription>
            Control which coaches can view your progress photos, meal logs, and training logs. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
      </Card>

      {coachesWithPreferences.map((coach) => (
        <CoachDataSharingCard
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
