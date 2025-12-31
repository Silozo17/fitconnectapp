import { forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Activity, Heart, Moon, Flame, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  client: any;
  hasAlert: boolean;
  alertType?: string;
}

export const ClientWearableRow = forwardRef<HTMLDivElement, Props>(
  ({ client, hasAlert, alertType }, ref) => {
  const { t } = useTranslation("coach");
  
  const getLatestValue = (type: string) => {
    const data = client.healthData?.filter((h: any) => h.data_type === type);
    if (!data?.length) return null;
    return data[data.length - 1]?.value;
  };

  const steps = getLatestValue("steps");
  const heartRate = getLatestValue("heart_rate");
  const sleep = getLatestValue("sleep");
  const calories = getLatestValue("calories");

  return (
    <Card ref={ref} variant="glass" className={`glass-card ${hasAlert ? "border-warning/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={client.avatar_url}
            name={`${client.first_name || ""} ${client.last_name || ""}`}
            className="w-10 h-10"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {client.first_name} {client.last_name}
              </p>
              {hasAlert && (
                <Badge variant="outline" className="text-warning border-warning/50">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {alertType === "low_activity" ? t("wearableDashboard.lowActivity") : t("wearableDashboard.alert")}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" />
              <span>{steps ? Number(steps).toLocaleString() : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{heartRate || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>{sleep ? `${sleep}h` : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{calories ? Number(calories).toLocaleString() : "—"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ClientWearableRow.displayName = "ClientWearableRow";
