import { ReactNode } from "react";

interface BenefitCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const BenefitCard = ({ icon, title, description }: BenefitCardProps) => (
  <div className="p-6 rounded-xl bg-card border border-border/50 text-center hover:border-primary/30 transition-colors">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
      {icon}
    </div>
    <h4 className="font-display font-semibold text-foreground mb-2">{title}</h4>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);
