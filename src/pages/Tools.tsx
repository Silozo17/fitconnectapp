import PageLayout from "@/components/layout/PageLayout";
import BMICalculator from "@/components/tools/BMICalculator";
import BMRCalculator from "@/components/tools/BMRCalculator";
import TDEECalculator from "@/components/tools/TDEECalculator";
import IdealWeightCalculator from "@/components/tools/IdealWeightCalculator";
import BodyFatCalculator from "@/components/tools/BodyFatCalculator";
import OneRepMaxCalculator from "@/components/tools/OneRepMaxCalculator";
import WaterIntakeCalculator from "@/components/tools/WaterIntakeCalculator";
import HeartRateZoneCalculator from "@/components/tools/HeartRateZoneCalculator";
import { Calculator, Scale, Flame, Utensils, Target, Percent, Dumbbell, Droplets, Heart } from "lucide-react";
import { Link } from "react-router-dom";

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

const Tools = () => {
  return (
    <PageLayout 
      title="Free Fitness Calculators - BMI, BMR, Calorie Calculator"
      description="Free fitness calculators including BMI, BMR, TDEE, body fat percentage, one rep max, water intake, and heart rate zone calculators. No signup required."
    >
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Free Fitness <span className="text-gradient">Calculators</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our free calculators to track your fitness metrics, plan your nutrition, and optimize your training. No signup required.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
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
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <BMICalculator />
          <BMRCalculator />
          <TDEECalculator />
          <IdealWeightCalculator />
          <BodyFatCalculator />
          <OneRepMaxCalculator />
          <WaterIntakeCalculator />
          <HeartRateZoneCalculator />
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <h2 className="text-2xl font-display font-bold mb-2">Want Personalized Guidance?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              These calculators give you a starting point. For customized plans tailored to your goals, connect with a certified coach.
            </p>
            <Link
              to="/coaches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Find a Coach
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Tools;
