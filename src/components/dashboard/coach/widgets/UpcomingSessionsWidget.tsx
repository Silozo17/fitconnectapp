import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/shared/ContentSection";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingSession {
  id: string;
  client: string;
  type: string;
  time: string;
  avatar: string;
}

interface UpcomingSessionsWidgetProps {
  sessions: UpcomingSession[];
  isLoading?: boolean;
}

export function UpcomingSessionsWidget({ sessions, isLoading }: UpcomingSessionsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <ContentSection colorTheme="blue" padding="none" className="overflow-hidden h-full rounded-3xl">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-display font-bold text-foreground">{t("clients.upcomingSessions")}</h2>
        <Link to="/dashboard/coach/schedule">
          <Button variant="ghost" size="sm" className="text-primary rounded-xl">
            {t("common:viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                {session.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{session.client}</p>
                <p className="text-sm text-muted-foreground">{session.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground">{session.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
      {!isLoading && sessions.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t("dashboard.noUpcomingSessions")}</p>
        </div>
      )}
    </ContentSection>
  );
}
