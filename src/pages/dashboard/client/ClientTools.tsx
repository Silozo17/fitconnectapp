import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import BMICalculator from "@/components/tools/BMICalculator";
import BMRCalculator from "@/components/tools/BMRCalculator";
import TDEECalculator from "@/components/tools/TDEECalculator";
import IdealWeightCalculator from "@/components/tools/IdealWeightCalculator";
import BodyFatCalculator from "@/components/tools/BodyFatCalculator";
import OneRepMaxCalculator from "@/components/tools/OneRepMaxCalculator";
import WaterIntakeCalculator from "@/components/tools/WaterIntakeCalculator";
import HeartRateZoneCalculator from "@/components/tools/HeartRateZoneCalculator";
import { Calculator, Scale, Flame, Utensils, Target, Percent, Dumbbell, Droplets, Heart } from "lucide-react";

const toolsList = [
  { id: "bmi", name: "BMI Calculator", icon: Scale, description: "Body Mass Index" },
  { id: "bmr", name: "BMR Calculator", icon: Flame, description: "Basal Metabolic Rate" },
  { id: "tdee", name: "Calorie Calculator", icon: Utensils, description: "Daily Energy Needs" },
  { id: "ideal-weight", name: "Ideal Weight", icon: Target, description: "Target Weight Range" },
  { id: "body-fat", name: "Body Fat %", icon: Percent, description: "Fat Percentage" },
  { id: "1rm", name: "One Rep Max", icon: Dumbbell, description: "Max Lift Estimate" },
  { id: "water", name: "Water Intake", icon: Droplets, description: "Daily Hydration" },
  { id: "heart-rate", name: "Heart Rate Zones", icon: Heart, description: "Training Zones" },
];

const ClientTools = () => {
  return (
    <ClientDashboardLayout
      title="Fitness Tools"
      description="Free fitness calculators to track your metrics and optimize your training"
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Fitness Tools</h1>
          </div>
          <p className="text-muted-foreground">
            Use these calculators to track your fitness metrics and optimize your training.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {toolsList.map((tool) => (
            <a
              key={tool.id}
              href={`#${tool.id}`}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Calculators Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div id="bmi"><BMICalculator /></div>
          <div id="bmr"><BMRCalculator /></div>
          <div id="tdee"><TDEECalculator /></div>
          <div id="ideal-weight"><IdealWeightCalculator /></div>
          <div id="body-fat"><BodyFatCalculator /></div>
          <div id="1rm"><OneRepMaxCalculator /></div>
          <div id="water"><WaterIntakeCalculator /></div>
          <div id="heart-rate"><HeartRateZoneCalculator /></div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientTools;
