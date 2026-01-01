import { Salad, Dumbbell, Moon, Flower2, Pill, Droplet, Check } from "lucide-react";
import React from "react";

export const getCategoryIcon = (iconName: string, className: string = "h-5 w-5"): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    'Salad': <Salad className={className} />,
    'Dumbbell': <Dumbbell className={className} />,
    'Moon': <Moon className={className} />,
    'Flower2': <Flower2 className={className} />,
    'Pill': <Pill className={className} />,
    'Droplet': <Droplet className={className} />,
    'Check': <Check className={className} />,
  };
  return icons[iconName] || <Check className={className} />;
};
