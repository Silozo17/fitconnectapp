import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DropoffRescueSettings } from "@/components/coach/automations/DropoffRescueSettings";
import { MilestoneSettings } from "@/components/coach/automations/MilestoneSettings";
import { ReminderSettings } from "@/components/coach/automations/ReminderSettings";
import { ScheduledCheckinsSettings } from "@/components/coach/automations/ScheduledCheckinsSettings";
import { AlertTriangle, Trophy, Clock, Zap, CalendarCheck } from "lucide-react";
import { FeatureGate } from "@/components/FeatureGate";

const VALID_TABS = ["dropoff", "milestones", "reminders", "scheduled_checkins"];

export default function CoachAutomations() {
  const { t } = useTranslation("coach");
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dropoff";
  const [activeTab, setActiveTab] = useState(VALID_TABS.includes(initialTab) ? initialTab : "dropoff");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>{t("automations.pageTitle", "Automations")} | Coach Dashboard</title>
      </Helmet>
      <DashboardLayout>
        <FeatureGate feature="automations">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                {t("automations.title", "Automations")}
              </h1>
              <p className="text-muted-foreground">
                {t("automations.subtitle", "Set up automated workflows to save time and keep clients engaged")}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="dropoff" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("automations.tabs.dropoff", "Drop-off Rescue")}</span>
                  <span className="sm:hidden">Rescue</span>
                </TabsTrigger>
                <TabsTrigger value="milestones" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("automations.tabs.milestones", "Milestones")}</span>
                  <span className="sm:hidden">Goals</span>
                </TabsTrigger>
                <TabsTrigger value="reminders" className="gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("automations.tabs.reminders", "Reminders")}</span>
                  <span className="sm:hidden">Remind</span>
                </TabsTrigger>
                <TabsTrigger value="scheduled_checkins" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("automations.tabs.scheduledCheckins", "Check-ins")}</span>
                  <span className="sm:hidden">Check-ins</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="dropoff" className="m-0">
                  <DropoffRescueSettings />
                </TabsContent>
                <TabsContent value="milestones" className="m-0">
                  <MilestoneSettings />
                </TabsContent>
                <TabsContent value="reminders" className="m-0">
                  <ReminderSettings />
                </TabsContent>
                <TabsContent value="scheduled_checkins" className="m-0">
                  <ScheduledCheckinsSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </FeatureGate>
      </DashboardLayout>
    </>
  );
}