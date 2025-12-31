import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { AtRiskClientsBadge } from "@/components/coach/automations/AtRiskClientsBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoachClient } from "@/hooks/useCoachClients";

interface ClientCardMobileProps {
  client: CoachClient;
  onScheduleSession: (client: CoachClient) => void;
  onAssignPlan: (client: CoachClient) => void;
  onAddNote: (client: CoachClient) => void;
}

export function ClientCardMobile({ 
  client, 
  onScheduleSession, 
  onAssignPlan, 
  onAddNote 
}: ClientCardMobileProps) {
  const { t } = useTranslation("coach");

  const getInitials = () => {
    const first = client.client_profile?.first_name?.[0] || '';
    const last = client.client_profile?.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = () => {
    const first = client.client_profile?.first_name || '';
    const last = client.client_profile?.last_name || '';
    return `${first} ${last}`.trim() || 'Unknown Client';
  };

  return (
    <Card variant="glass" className="p-4 overflow-hidden">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link to={`/dashboard/coach/clients/${client.client_id}`} className="shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {getInitials()}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/dashboard/coach/clients/${client.client_id}`}>
            <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
              {getFullName()}
            </p>
          </Link>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant={client.status === 'active' ? 'default' : client.status === 'pending' ? 'secondary' : 'outline'}
              className={`text-xs ${
                client.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                client.status === 'pending' ? 'bg-warning/20 text-warning border-warning/30' :
                'bg-muted text-muted-foreground'
              }`}
            >
              {client.status}
            </Badge>
            {(client as any).automation_status?.is_at_risk && (
              <AtRiskClientsBadge 
                isAtRisk={(client as any).automation_status?.is_at_risk}
                riskStage={(client as any).automation_status?.risk_stage}
              />
            )}
            {client.plan_type && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {client.plan_type}
              </span>
            )}
          </div>
          {client.client_profile?.fitness_goals && client.client_profile.fitness_goals.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {client.client_profile.fitness_goals.slice(0, 2).map((goal, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {goal}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              window.location.href = `/dashboard/coach/messages/${client.client_id}`;
            }}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onScheduleSession(client)}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/coach/clients/${client.client_id}`}>{t("clients.viewProfile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignPlan(client)}>
                {t("clients.assignPlan")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNote(client)}>
                {t("clients.addNotes")}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">{t("clients.removeClient")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
