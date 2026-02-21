import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CoachGroupClassesManager } from "@/components/coach/CoachGroupClassesManager";
import { useTranslation } from "@/hooks/useTranslation";
import { DashboardSectionHeader } from "@/components/shared";

const CoachGroupClasses = () => {
  const { t } = useTranslation('coach');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardSectionHeader
          title={t('groupClasses.pageTitle')}
          description={t('groupClasses.pageDescription')}
        />
        <CoachGroupClassesManager />
      </div>
    </DashboardLayout>
  );
};

export default CoachGroupClasses;
