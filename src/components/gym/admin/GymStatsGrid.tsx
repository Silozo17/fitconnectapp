import { useGymMemberStats } from "@/hooks/gym/useGymMembers";
import { useGymClassStats } from "@/hooks/gym/useGymClasses";
import { useMembershipStats } from "@/hooks/gym/useGymMemberships";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  TrendingUp,
  CreditCard,
  UserPlus,
  Percent,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon: Icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function GymStatsGrid() {
  const { gym } = useGym();
  const { data: memberStats, isLoading: isLoadingMembers } = useGymMemberStats();
  const { data: classStats, isLoading: isLoadingClasses } = useGymClassStats();
  const { data: membershipStats, isLoading: isLoadingMemberships } = useMembershipStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: gym?.currency || "GBP",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Members"
        value={memberStats?.active || 0}
        description={`${memberStats?.total || 0} total members`}
        icon={Users}
        isLoading={isLoadingMembers}
      />
      <StatCard
        title="New This Month"
        value={memberStats?.newThisMonth || 0}
        description="Members joined"
        icon={UserPlus}
        isLoading={isLoadingMembers}
      />
      <StatCard
        title="Today's Classes"
        value={classStats?.todayCount || 0}
        description={`${classStats?.thisWeekCount || 0} this week`}
        icon={Calendar}
        isLoading={isLoadingClasses}
      />
      <StatCard
        title="Avg Attendance"
        value={`${classStats?.avgAttendancePercent || 0}%`}
        description="Class capacity utilized"
        icon={Percent}
        isLoading={isLoadingClasses}
      />
      <StatCard
        title="Active Memberships"
        value={membershipStats?.active || 0}
        description={`${membershipStats?.paused || 0} paused`}
        icon={CreditCard}
        isLoading={isLoadingMemberships}
      />
      <StatCard
        title="Monthly Revenue"
        value={formatCurrency(membershipStats?.mrr || 0)}
        description="Recurring revenue"
        icon={TrendingUp}
        isLoading={isLoadingMemberships}
      />
    </div>
  );
}
