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
    <div className="relative group">
      <button 
        onClick={handleClick} 
        className="rounded-full hover:ring-2 hover:ring-primary/40 transition-all duration-200 hover:scale-105"
      >
        <div className="p-0.5 rounded-full bg-gradient-to-br from-primary/30 to-accent/20">
          <BMICircle 
            bmi={bmi} 
            size="sm" 
            showCategory={false}
            className="shrink-0"
          />
        </div>
      </button>
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
