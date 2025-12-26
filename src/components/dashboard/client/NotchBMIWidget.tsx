import { useClientProfileData, calculateBMI } from "@/hooks/useClientProfileData";
import { BMICircle } from "@/components/stats/BMICircle";

const NotchBMIWidget = () => {
  const { data: profileData, isLoading } = useClientProfileData();

  const bmi = calculateBMI(profileData?.weight_kg, profileData?.height_cm);

  if (isLoading) {
    return (
      <div className="w-14 h-14 rounded-full glass-subtle animate-pulse" />
    );
  }

  return (
    <BMICircle 
      bmi={bmi} 
      size="sm" 
      showCategory={false}
      className="shrink-0"
    />
  );
};

export default NotchBMIWidget;
