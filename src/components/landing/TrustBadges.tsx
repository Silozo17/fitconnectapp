import { Shield, Lock, Award, CheckCircle } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "Verified Coaches",
      description: "All credentials checked",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "SSL encrypted",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "Satisfaction promised",
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliant",
      description: "Your data protected",
    },
  ];

  return (
    <section className="py-12 px-4 border-t border-border/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
