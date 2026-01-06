import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, UserPlus, MessageCircle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentSection } from "@/components/shared/ContentSection";
import { useCoachPipeline } from "@/hooks/useCoachPipeline";

const STAGE_KEYS = ['new_lead', 'conversation_started', 'offer_sent', 'deal_closed'] as const;

const STAGE_CONFIG = {
  new_lead: { icon: UserPlus, color: 'bg-blue-500', labelKey: 'newLeads' },
  conversation_started: { icon: MessageCircle, color: 'bg-amber-500', labelKey: 'inConversation' },
  offer_sent: { icon: Send, color: 'bg-purple-500', labelKey: 'offerSent' },
  deal_closed: { icon: CheckCircle, color: 'bg-emerald-500', labelKey: 'dealClosed' },
} as const;

export function PipelineOverviewCard() {
  const { t } = useTranslation("coach");
  const { leadsByStage, leads, isLoading } = useCoachPipeline();

  const totalLeads = leads.length;
  const closedDeals = leadsByStage.deal_closed.length;
  const conversionRate = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;

  // Calculate max count for proportional bar widths
  const maxCount = Math.max(
    ...STAGE_KEYS.map(s => leadsByStage[s]?.length || 0),
    1
  );

  if (isLoading) {
    return (
      <ContentSection colorTheme="purple" className="p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </ContentSection>
    );
  }

  return (
    <ContentSection colorTheme="purple" className="p-5 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-foreground">{t("widgets.pipeline.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("widgets.pipeline.totalLeads", { count: totalLeads })} • {t("widgets.pipeline.conversionRate", { rate: conversionRate })}
          </p>
        </div>
        <Link to="/dashboard/coach/pipeline">
          <Button variant="ghost" size="sm" className="text-primary rounded-xl">
            {t("widgets.pipeline.viewPipeline")} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Funnel Visualization */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAGE_KEYS.map((stageKey) => {
          const config = STAGE_CONFIG[stageKey];
          const count = leadsByStage[stageKey]?.length || 0;
          const Icon = config.icon;
          const barWidth = maxCount > 0 ? Math.max((count / maxCount) * 100, 8) : 8;

          return (
            <div key={stageKey} className="text-center space-y-2">
              {/* Stage Icon & Count */}
              <div className="flex items-center justify-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Label */}
              <p className="text-xs text-muted-foreground line-clamp-1">
                {t(`widgets.pipeline.stages.${config.labelKey}`)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {totalLeads === 0 && (
        <div className="text-center pt-4 border-t border-border/50 mt-4">
          <p className="text-sm text-muted-foreground">
            {t("widgets.pipeline.noLeadsYet")}
          </p>
        </div>
      )}
    </ContentSection>
  );
}
