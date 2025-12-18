import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, MessageCircle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachPipeline } from "@/hooks/useCoachPipeline";

const STAGES = [
  { key: 'new_lead', label: 'New Leads', icon: UserPlus, color: 'bg-blue-500' },
  { key: 'conversation_started', label: 'In Conversation', icon: MessageCircle, color: 'bg-amber-500' },
  { key: 'offer_sent', label: 'Offer Sent', icon: Send, color: 'bg-purple-500' },
  { key: 'deal_closed', label: 'Deal Closed', icon: CheckCircle, color: 'bg-emerald-500' },
] as const;

export function PipelineOverviewCard() {
  const { leadsByStage, leads, isLoading } = useCoachPipeline();

  const totalLeads = leads.length;
  const closedDeals = leadsByStage.deal_closed.length;
  const conversionRate = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;

  // Calculate max count for proportional bar widths
  const maxCount = Math.max(
    ...STAGES.map(s => leadsByStage[s.key]?.length || 0),
    1
  );

  if (isLoading) {
    return (
      <div className="card-elevated p-6 mb-6">
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
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-foreground">Sales Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {totalLeads} total leads • {conversionRate}% conversion rate
          </p>
        </div>
        <Link to="/dashboard/coach/pipeline">
          <Button variant="ghost" size="sm" className="text-primary">
            View Pipeline <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Funnel Visualization */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAGES.map((stage, index) => {
          const count = leadsByStage[stage.key]?.length || 0;
          const Icon = stage.icon;
          const barWidth = maxCount > 0 ? Math.max((count / maxCount) * 100, 8) : 8;

          return (
            <div key={stage.key} className="text-center space-y-2">
              {/* Stage Icon & Count */}
              <div className="flex items-center justify-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${stage.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Label */}
              <p className="text-xs text-muted-foreground line-clamp-1">{stage.label}</p>

              {/* Arrow connector (hidden on mobile, shown between items) */}
              {index < STAGES.length - 1 && (
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-muted-foreground/30">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {totalLeads === 0 && (
        <div className="text-center pt-4 border-t border-border mt-4">
          <p className="text-sm text-muted-foreground">
            No leads yet. When clients message you or send booking requests, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
}
