import { useState } from "react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import BMICalculator from "@/components/tools/BMICalculator";
import BMRCalculator from "@/components/tools/BMRCalculator";
import TDEECalculator from "@/components/tools/TDEECalculator";
import IdealWeightCalculator from "@/components/tools/IdealWeightCalculator";
import BodyFatCalculator from "@/components/tools/BodyFatCalculator";
import OneRepMaxCalculator from "@/components/tools/OneRepMaxCalculator";
import WaterIntakeCalculator from "@/components/tools/WaterIntakeCalculator";
import HeartRateZoneCalculator from "@/components/tools/HeartRateZoneCalculator";
import { Calculator, Scale, Flame, Utensils, Target, Percent, Dumbbell, Droplets, Heart, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const toolsList = [
  { id: "bmi", name: "BMI Calculator", icon: Scale, description: "Calculate your Body Mass Index to assess weight status", component: BMICalculator },
  { id: "bmr", name: "BMR Calculator", icon: Flame, description: "Find your Basal Metabolic Rate - calories burned at rest", component: BMRCalculator },
  { id: "tdee", name: "Calorie Calculator", icon: Utensils, description: "Calculate Total Daily Energy Expenditure for your goals", component: TDEECalculator },
  { id: "ideal-weight", name: "Ideal Weight", icon: Target, description: "Find your target weight range using multiple formulas", component: IdealWeightCalculator },
  { id: "body-fat", name: "Body Fat %", icon: Percent, description: "Estimate body fat percentage using the US Navy method", component: BodyFatCalculator },
  { id: "1rm", name: "One Rep Max", icon: Dumbbell, description: "Calculate your estimated max lift and training percentages", component: OneRepMaxCalculator },
  { id: "water", name: "Water Intake", icon: Droplets, description: "Get personalized daily hydration recommendations", component: WaterIntakeCalculator },
  { id: "heart-rate", name: "Heart Rate Zones", icon: Heart, description: "Calculate your optimal heart rate training zones", component: HeartRateZoneCalculator },
];

const ClientTools = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const activeTool = toolsList.find(t => t.id === selectedTool);

  return (
    <ClientDashboardLayout
      title="Fitness Tools"
      description="Free fitness calculators to track your metrics and optimize your training"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {selectedTool ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTool(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tools
            </Button>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fitness Tools</h1>
                <p className="text-muted-foreground text-sm">Select a calculator to get started</p>
              </div>
            </>
          )}
        </div>

        {/* Tool Selection Grid or Active Calculator */}
        {selectedTool && activeTool ? (
          <div className="animate-fade-in">
            <activeTool.component />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {toolsList.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{tool.name}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientTools;
