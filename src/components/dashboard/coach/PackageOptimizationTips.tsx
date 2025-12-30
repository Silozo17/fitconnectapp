import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, Target, DollarSign } from "lucide-react";
import type { PackageMetrics, PackageAnalyticsSummary } from "@/hooks/usePackageAnalytics";

type SummaryType = PackageAnalyticsSummary;

interface PackageOptimizationTipsProps {
  packages: PackageMetrics[];
  summary?: PackageAnalyticsSummary;
}

interface Tip {
  id: string;
  icon: typeof Lightbulb;
  iconColor: string;
  title: string;
  description: string;
  category: 'pricing' | 'completion' | 'retention';
  affectedPackage?: string;
  priority: 'high' | 'medium' | 'low';
}

export function PackageOptimizationTips({ packages, summary }: PackageOptimizationTipsProps) {
  const { t } = useTranslation();

  const tips = useMemo(() => {
    const generatedTips: Tip[] = [];

    // Analyze low completion rates
    packages.forEach(pkg => {
      if (pkg.completionRate < 50 && pkg.totalPurchases >= 3) {
        generatedTips.push({
          id: `low-completion-${pkg.packageId}`,
          icon: AlertTriangle,
          iconColor: 'text-warning',
          title: t('analytics.tips.lowCompletion', 'Low Session Completion'),
          description: t('analytics.tips.lowCompletionDesc', 
            '{{package}} has only {{rate}}% completion rate. Consider reducing session count or adding expiration reminders.',
            { package: pkg.packageName, rate: Math.round(pkg.completionRate) }
          ),
          category: 'completion',
          affectedPackage: pkg.packageName,
          priority: 'high',
        });
      }
    });

    // Analyze pricing opportunities
    packages.forEach(pkg => {
      if (pkg.completionRate >= 90 && pkg.totalPurchases >= 5) {
        generatedTips.push({
          id: `price-increase-${pkg.packageId}`,
          icon: DollarSign,
          iconColor: 'text-success',
          title: t('analytics.tips.priceOpportunity', 'Price Increase Opportunity'),
          description: t('analytics.tips.priceOpportunityDesc', 
            '{{package}} has excellent completion ({{rate}}%). You may be able to increase pricing without affecting demand.',
            { package: pkg.packageName, rate: Math.round(pkg.completionRate) }
          ),
          category: 'pricing',
          affectedPackage: pkg.packageName,
          priority: 'medium',
        });
      }
    });

    // Analyze underperforming packages
    if (packages.length >= 2) {
      const avgRevenue = packages.reduce((sum, p) => sum + p.totalRevenue, 0) / packages.length;
      packages.forEach(pkg => {
        if (pkg.totalRevenue < avgRevenue * 0.3 && pkg.totalPurchases < 2) {
          generatedTips.push({
            id: `underperforming-${pkg.packageId}`,
            icon: Target,
            iconColor: 'text-accent',
            title: t('analytics.tips.underperforming', 'Underperforming Package'),
            description: t('analytics.tips.underperformingDesc', 
              '{{package}} has low sales. Consider promoting it more or adjusting the offering.',
              { package: pkg.packageName }
            ),
            category: 'retention',
            affectedPackage: pkg.name,
            priority: 'low',
          });
        }
      });
    }

    // General tips if no specific issues
    if (generatedTips.length === 0 && packages.length > 0) {
      generatedTips.push({
        id: 'general-good',
        icon: TrendingUp,
        iconColor: 'text-success',
        title: t('analytics.tips.greatJob', 'Great Performance!'),
        description: t('analytics.tips.greatJobDesc', 
          'Your packages are performing well. Keep monitoring completion rates and consider seasonal promotions.'
        ),
        category: 'retention',
        priority: 'low',
      });
    }

    if (packages.length === 0) {
      generatedTips.push({
        id: 'no-packages',
        icon: Lightbulb,
        iconColor: 'text-muted-foreground',
        title: t('analytics.tips.createPackages', 'Create Session Packages'),
        description: t('analytics.tips.createPackagesDesc', 
          'Session packages help clients commit to their fitness journey and provide you with predictable income.'
        ),
        category: 'pricing',
        priority: 'high',
      });
    }

    return generatedTips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [packages, t]);

  const categoryLabels = {
    pricing: t('analytics.tips.pricing', 'Pricing'),
    completion: t('analytics.tips.completion', 'Completion'),
    retention: t('analytics.tips.retention', 'Retention'),
  };

  const priorityColors = {
    high: 'bg-destructive/20 text-destructive border-destructive/30',
    medium: 'bg-warning/20 text-warning border-warning/30',
    low: 'bg-success/20 text-success border-success/30',
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-warning" />
          {t('analytics.tips.title', 'Optimization Tips')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/50`}>
                  <tip.icon className={`w-4 h-4 ${tip.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {categoryLabels[tip.category]}
              </Badge>
              {tip.affectedPackage && (
                <Badge variant="secondary" className="text-xs">
                  {tip.affectedPackage}
                </Badge>
              )}
              <Badge className={`text-xs ${priorityColors[tip.priority]}`}>
                {tip.priority}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
