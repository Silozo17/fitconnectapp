import { useNavigate } from "react-router-dom";
import { useClientProfileData, calculateBMI } from "@/hooks/useClientProfileData";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { BMICircle } from "@/components/stats/BMICircle";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getMetricExplanation } from "@/lib/metric-explanations";

const NotchBMIWidget = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/client/progress");
  };
  const { data: profileData, isLoading } = useClientProfileData();

  const bmi = calculateBMI(profileData?.weight_kg, profileData?.height_cm);

  if (isLoading) {
    return (
      <div className="w-14 h-14 rounded-full glass-subtle animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button onClick={handleClick} className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all">
        <BMICircle 
          bmi={bmi} 
          size="sm" 
          showCategory={false}
          className="shrink-0"
        />
      </button>
      <div className="absolute -top-1 -right-1">
        <InfoTooltip 
          explanation={getMetricExplanation('bmi')} 
          side="top"
          iconClassName="h-3 w-3"
        />
      </div>
    </div>
  );
};

export default NotchBMIWidget;
