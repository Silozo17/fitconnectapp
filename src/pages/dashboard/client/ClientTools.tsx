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
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

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
      <PageHelpBanner
        pageKey="client_tools"
        title="Fitness Calculators"
        description="Use tools to calculate calories, macros, BMI, and more"
      />
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
                className="p-5 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card hover:shadow-float transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:shadow-glow-sm transition-all">
                    <tool.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{tool.name}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
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
