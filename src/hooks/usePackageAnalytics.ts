import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfileId } from "./useCoachProfileId";
import { startOfMonth, subMonths, format, differenceInDays } from "date-fns";

export interface PackageMetrics {
  packageId: string;
  packageName: string;
  sessionCount: number;
  price: number;
  currency: string;
  // Purchase Metrics
  totalPurchases: number;
  activePurchases: number;
  totalRevenue: number;
  avgRevenuePerPurchase: number;
  // Usage Metrics
  completionRate: number;
  avgSessionsUsed: number;
  avgDaysToComplete: number | null;
  // Retention Metrics
  renewalRate: number;
  churnAfterPackage: number;
}

export interface MonthlyPurchaseData {
  month: string;
  purchases: number;
  revenue: number;
}

export interface PackageAnalyticsSummary {
  totalRevenue: number;
  avgCompletionRate: number;
  topPackage: PackageMetrics | null;
  totalActivePurchases: number;
  packages: PackageMetrics[];
  monthlyData: MonthlyPurchaseData[];
}

export function usePackageAnalytics() {
  const { data: coachId } = useCoachProfileId();

  return useQuery({
    queryKey: ["package-analytics", coachId],
    queryFn: async (): Promise<PackageAnalyticsSummary> => {
      if (!coachId) throw new Error("No coach ID");

      // Fetch all packages for this coach
      const { data: packages, error: packagesError } = await supabase
        .from("coach_packages")
        .select("id, name, session_count, price, currency, is_active")
        .eq("coach_id", coachId);

      if (packagesError) throw packagesError;

      // Fetch all purchases for this coach
      const { data: purchases, error: purchasesError } = await supabase
        .from("client_package_purchases")
        .select("*")
        .eq("coach_id", coachId);

      if (purchasesError) throw purchasesError;

      // Build analytics per package
      const packageMetrics: PackageMetrics[] = (packages || []).map((pkg) => {
        const pkgPurchases = (purchases || []).filter(
          (p) => p.package_id === pkg.id
        );
        const activePurchases = pkgPurchases.filter(
          (p) => p.status === "active"
        );
        const completedPurchases = pkgPurchases.filter(
          (p) => p.sessions_used >= p.sessions_total
        );

        const totalRevenue = pkgPurchases.reduce(
          (sum, p) => sum + (p.amount_paid || 0),
          0
        );
        const avgRevenue =
          pkgPurchases.length > 0 ? totalRevenue / pkgPurchases.length : 0;

        // Completion rate: purchases where all sessions used
        const completionRate =
          pkgPurchases.length > 0
            ? (completedPurchases.length / pkgPurchases.length) * 100
            : 0;

        // Average sessions used
        const avgSessionsUsed =
          pkgPurchases.length > 0
            ? pkgPurchases.reduce((sum, p) => sum + (p.sessions_used || 0), 0) /
              pkgPurchases.length
            : 0;

        // Average days to complete (for completed purchases)
        let avgDaysToComplete: number | null = null;
        if (completedPurchases.length > 0) {
          const totalDays = completedPurchases.reduce((sum, p) => {
            const start = new Date(p.purchased_at);
            const end = p.expires_at ? new Date(p.expires_at) : new Date();
            return sum + differenceInDays(end, start);
          }, 0);
          avgDaysToComplete = totalDays / completedPurchases.length;
        }

        // Renewal rate: clients who purchased this package more than once
        const clientPurchaseCounts = pkgPurchases.reduce((acc, p) => {
          acc[p.client_id] = (acc[p.client_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const uniqueClients = Object.keys(clientPurchaseCounts).length;
        const repeatClients = Object.values(clientPurchaseCounts).filter(
          (c) => c > 1
        ).length;
        const renewalRate =
          uniqueClients > 0 ? (repeatClients / uniqueClients) * 100 : 0;

        return {
          packageId: pkg.id,
          packageName: pkg.name,
          sessionCount: pkg.session_count || 0,
          price: pkg.price || 0,
          currency: pkg.currency || "GBP",
          totalPurchases: pkgPurchases.length,
          activePurchases: activePurchases.length,
          totalRevenue,
          avgRevenuePerPurchase: avgRevenue,
          completionRate,
          avgSessionsUsed,
          avgDaysToComplete,
          renewalRate,
          churnAfterPackage: 0, // Would need coach_clients data to calculate
        };
      });

      // Calculate monthly data (last 6 months)
      const monthlyData: MonthlyPurchaseData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = startOfMonth(subMonths(new Date(), i - 1));
        const monthLabel = format(monthStart, "MMM yyyy");

        const monthPurchases = (purchases || []).filter((p) => {
          const purchaseDate = new Date(p.purchased_at);
          return purchaseDate >= monthStart && purchaseDate < monthEnd;
        });

        monthlyData.push({
          month: monthLabel,
          purchases: monthPurchases.length,
          revenue: monthPurchases.reduce(
            (sum, p) => sum + (p.amount_paid || 0),
            0
          ),
        });
      }

      // Summary calculations
      const totalRevenue = packageMetrics.reduce(
        (sum, p) => sum + p.totalRevenue,
        0
      );
      const avgCompletionRate =
        packageMetrics.length > 0
          ? packageMetrics.reduce((sum, p) => sum + p.completionRate, 0) /
            packageMetrics.length
          : 0;
      const totalActivePurchases = packageMetrics.reduce(
        (sum, p) => sum + p.activePurchases,
        0
      );

      // Top package by revenue
      const topPackage =
        packageMetrics.length > 0
          ? packageMetrics.reduce((top, p) =>
              p.totalRevenue > top.totalRevenue ? p : top
            )
          : null;

      return {
        totalRevenue,
        avgCompletionRate,
        topPackage,
        totalActivePurchases,
        packages: packageMetrics,
        monthlyData,
      };
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePackageComparison(packageIds: string[]) {
  const { data: analytics } = usePackageAnalytics();

  if (!analytics || packageIds.length === 0) {
    return { packages: [] };
  }

  const packages = analytics.packages.filter((p) =>
    packageIds.includes(p.packageId)
  );

  return { packages };
}
