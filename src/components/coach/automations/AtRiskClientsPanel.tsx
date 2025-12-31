import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, VolumeX, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientAutomationStatus, ClientAutomationStatus } from "@/hooks/useClientAutomationStatus";
import { cn } from "@/lib/utils";

interface AtRiskClientsPanelProps {
  isEnabled: boolean;
}

export function AtRiskClientsPanel({ isEnabled }: AtRiskClientsPanelProps) {
  const { t } = useTranslation("coach");
  const { atRiskClients, isLoading, muteClient, dismissRisk } = useClientAutomationStatus();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isEnabled) return null;

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (atRiskClients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {t("automations.dropoff.noAtRisk", "No clients at risk")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("automations.dropoff.noAtRiskHint", "All your clients are actively engaged!")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStageBadgeVariant = (stage: number) => {
    switch (stage) {
      case 1: return "default";
      case 2: return "secondary";
      case 3: return "destructive";
      default: return "outline";
    }
  };

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 1: return t("automations.dropoff.stage1Label", "Stage 1");
      case 2: return t("automations.dropoff.stage2Label", "Stage 2");
      case 3: return t("automations.dropoff.stage3Label", "Stage 3");
      default: return t("automations.dropoff.monitoring", "Monitoring");
    }
  };

  return (
    <div className="rounded-lg border">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">
              {t("automations.dropoff.atRiskClients", "Clients at risk")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("automations.dropoff.atRiskCount", "{{count}} client(s) need attention", { count: atRiskClients.length })}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Client list */}
      {isExpanded && (
        <div className="border-t divide-y">
          {atRiskClients.map((client) => (
            <AtRiskClientRow
              key={client.id}
              client={client}
              getStageBadgeVariant={getStageBadgeVariant}
              getStageLabel={getStageLabel}
              onMute={muteClient}
              onDismiss={dismissRisk}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AtRiskClientRowProps {
  client: ClientAutomationStatus;
  getStageBadgeVariant: (stage: number) => "default" | "secondary" | "destructive" | "outline";
  getStageLabel: (stage: number) => string;
  onMute: (clientId: string, days: number) => void;
  onDismiss: (clientId: string) => void;
}

function AtRiskClientRow({ client, getStageBadgeVariant, getStageLabel, onMute, onDismiss }: AtRiskClientRowProps) {
  const { t } = useTranslation("coach");
  const clientName = [client.client?.first_name, client.client?.last_name].filter(Boolean).join(" ") || t("common:common.anonymous", "Anonymous");
  const initials = clientName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={client.client?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{clientName}</p>
          <div className="flex items-center gap-2">
            <Badge variant={getStageBadgeVariant(client.risk_stage)} className="text-xs h-5">
              {getStageLabel(client.risk_stage)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <VolumeX className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMute(client.client_id, 7)}>
              <Clock className="h-4 w-4 mr-2" />
              {t("automations.dropoff.mute7days", "Mute for 7 days")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMute(client.client_id, 14)}>
              <Clock className="h-4 w-4 mr-2" />
              {t("automations.dropoff.mute14days", "Mute for 14 days")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMute(client.client_id, 30)}>
              <Clock className="h-4 w-4 mr-2" />
              {t("automations.dropoff.mute30days", "Mute for 30 days")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onDismiss(client.client_id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
