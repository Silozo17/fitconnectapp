import { useNavigate } from "react-router-dom";
import { useClientProfileData, calculateBMI } from "@/hooks/useClientProfileData";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { BMICircle } from "@/components/stats/BMICircle";

const NotchBMIWidget = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/client/stats");
  };
  const { data: profileData, isLoading } = useClientProfileData();

  const bmi = calculateBMI(profileData?.weight_kg, profileData?.height_cm);

  if (isLoading) {
    return (
      <div className="w-14 h-14 rounded-full glass-subtle animate-pulse" />
    );
  }

  return (
    <button onClick={handleClick} className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all">
      <BMICircle 
        bmi={bmi} 
        size="sm" 
        showCategory={false}
        className="shrink-0"
      />
    </button>
  );
};

export default NotchBMIWidget;
