import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGym } from "@/contexts/GymContext";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MemberReport {
  total_members: number;
  active_members: number;
  inactive_members: number;
  new_members: number;
  churned_members: number;
  retention_rate: number;
  members_by_plan: { plan_name: string; count: number }[];
  members_by_status: { status: string; count: number }[];
}

export interface FinancialReport {
  total_revenue: number;
  membership_revenue: number;
  product_sales: number;
  session_revenue: number;
  refunds: number;
  net_revenue: number;
  revenue_by_plan: { plan_name: string; amount: number }[];
  revenue_by_day: { date: string; amount: number }[];
}

export interface AttendanceReport {
  total_classes: number;
  total_bookings: number;
  total_check_ins: number;
  avg_attendance_rate: number;
  classes_by_type: { class_name: string; count: number; attendance: number }[];
  attendance_by_day: { day: string; count: number }[];
  peak_hours: { hour: number; count: number }[];
}

export interface OverviewReport {
  members: MemberReport;
  financials: FinancialReport;
  attendance: AttendanceReport;
}

export function useGymMemberReport(dateRange: DateRange) {
  const { gym } = useGym();
  
  return useQuery({
    queryKey: ["gym-member-report", gym?.id, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<MemberReport> => {
      if (!gym?.id) throw new Error("No gym selected");
      
      // Get all members
      const { data: members, error: membersError } = await (supabase as any)
        .from("gym_members")
        .select("id, status, created_at")
        .eq("gym_id", gym.id);
      
      if (membersError) throw membersError;
      
      // Get memberships for plan breakdown
      const { data: memberships, error: membershipError } = await (supabase as any)
        .from("gym_member_memberships")
        .select(`id, status, gym_membership_plans(name)`)
        .eq("gym_id", gym.id)
        .eq("status", "active");
      
      if (membershipError) throw membershipError;
      
      // Calculate stats
      const totalMembers = members?.length || 0;
      const activeMembers = members?.filter((m: any) => m.status === "active").length || 0;
      const inactiveMembers = totalMembers - activeMembers;
      
      // New members in date range
      const newMembers = members?.filter((m: any) => {
        const createdAt = new Date(m.created_at);
        return createdAt >= dateRange.start && createdAt <= dateRange.end;
      }).length || 0;
      
      // Group by status
      const statusCounts = members?.reduce((acc: Record<string, number>, m: any) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const membersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }));
      
      // Group by plan
      const planCounts: Record<string, number> = {};
      memberships?.forEach((m: any) => {
        const planName = m.gym_membership_plans?.name || "Unknown";
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });
      
      const membersByPlan = Object.entries(planCounts).map(([plan_name, count]) => ({
        plan_name,
        count,
      }));
      
      // Calculate retention
      const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
      
      return {
        total_members: totalMembers,
        active_members: activeMembers,
        inactive_members: inactiveMembers,
        new_members: newMembers,
        churned_members: 0,
        retention_rate: Math.round(retentionRate * 10) / 10,
        members_by_plan: membersByPlan,
        members_by_status: membersByStatus,
      };
    },
    enabled: !!gym?.id,
  });
}

export function useGymFinancialReport(dateRange: DateRange) {
  const { gym } = useGym();
  
  return useQuery({
    queryKey: ["gym-financial-report", gym?.id, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<FinancialReport> => {
      if (!gym?.id) throw new Error("No gym selected");
      
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();
      
      // Get membership payments
      const { data: payments, error: paymentsError } = await (supabase as any)
        .from("gym_membership_payments")
        .select(`id, amount, status, payment_date, gym_member_memberships(gym_membership_plans(name))`)
        .eq("gym_id", gym.id)
        .eq("status", "paid")
        .gte("payment_date", startDate)
        .lte("payment_date", endDate);
      
      if (paymentsError) throw paymentsError;
      
      // Get product sales
      const { data: sales, error: salesError } = await (supabase as any)
        .from("gym_product_sales")
        .select("id, total_amount, created_at")
        .eq("gym_id", gym.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      
      if (salesError) throw salesError;
      
      // Get invoices
      const { data: invoices, error: invoicesError } = await (supabase as any)
        .from("gym_invoices")
        .select("id, total_amount, status, created_at")
        .eq("gym_id", gym.id)
        .eq("status", "paid")
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      
      if (invoicesError) throw invoicesError;
      
      // Calculate totals
      const membershipRevenue = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
      const productSales = sales?.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0) || 0;
      const invoiceRevenue = invoices?.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0) || 0;
      
      const totalRevenue = membershipRevenue + productSales + invoiceRevenue;
      
      // Revenue by plan
      const planRevenue: Record<string, number> = {};
      payments?.forEach((p: any) => {
        const planName = p.gym_member_memberships?.gym_membership_plans?.name || "Unknown";
        planRevenue[planName] = (planRevenue[planName] || 0) + (p.amount || 0);
      });
      
      const revenueByPlan = Object.entries(planRevenue).map(([plan_name, amount]) => ({
        plan_name,
        amount,
      }));
      
      // Revenue by day
      const dailyRevenue: Record<string, number> = {};
      payments?.forEach((p: any) => {
        const day = format(new Date(p.payment_date), "yyyy-MM-dd");
        dailyRevenue[day] = (dailyRevenue[day] || 0) + (p.amount || 0);
      });
      
      const revenueByDay = Object.entries(dailyRevenue)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return {
        total_revenue: totalRevenue,
        membership_revenue: membershipRevenue,
        product_sales: productSales,
        session_revenue: 0,
        refunds: 0,
        net_revenue: totalRevenue,
        revenue_by_plan: revenueByPlan,
        revenue_by_day: revenueByDay,
      };
    },
    enabled: !!gym?.id,
  });
}

export function useGymAttendanceReport(dateRange: DateRange) {
  const { gym } = useGym();
  
  return useQuery({
    queryKey: ["gym-attendance-report", gym?.id, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<AttendanceReport> => {
      if (!gym?.id) throw new Error("No gym selected");
      
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();
      
      // Get scheduled classes
      const { data: classes, error: classesError } = await (supabase as any)
        .from("gym_scheduled_classes")
        .select(`id, start_time, capacity, gym_class_types(name)`)
        .eq("gym_id", gym.id)
        .gte("start_time", startDate)
        .lte("start_time", endDate);
      
      if (classesError) throw classesError;
      
      // Get bookings
      const { data: bookings, error: bookingsError } = await (supabase as any)
        .from("gym_class_bookings")
        .select(`id, status, checked_in_at, gym_scheduled_classes!inner(id, start_time, gym_id, gym_class_types(name))`)
        .eq("gym_scheduled_classes.gym_id", gym.id)
        .gte("gym_scheduled_classes.start_time", startDate)
        .lte("gym_scheduled_classes.start_time", endDate);
      
      if (bookingsError) throw bookingsError;
      
      // Calculate stats
      const totalClasses = classes?.length || 0;
      const totalBookings = bookings?.length || 0;
      const totalCheckIns = bookings?.filter((b: any) => b.checked_in_at).length || 0;
      
      // Attendance by class type
      const classTypeCounts: Record<string, { count: number; attendance: number }> = {};
      classes?.forEach((c: any) => {
        const typeName = c.gym_class_types?.name || "Unknown";
        if (!classTypeCounts[typeName]) {
          classTypeCounts[typeName] = { count: 0, attendance: 0 };
        }
        classTypeCounts[typeName].count += 1;
      });
      
      bookings?.forEach((b: any) => {
        const typeName = b.gym_scheduled_classes?.gym_class_types?.name || "Unknown";
        if (b.checked_in_at && classTypeCounts[typeName]) {
          classTypeCounts[typeName].attendance += 1;
        }
      });
      
      const classesByType = Object.entries(classTypeCounts).map(([class_name, data]) => ({
        class_name,
        count: data.count,
        attendance: data.attendance,
      }));
      
      // Attendance by day of week
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayAttendance: Record<string, number> = {};
      bookings?.filter((b: any) => b.checked_in_at).forEach((b: any) => {
        const dayOfWeek = new Date(b.gym_scheduled_classes?.start_time).getDay();
        const dayName = dayNames[dayOfWeek];
        dayAttendance[dayName] = (dayAttendance[dayName] || 0) + 1;
      });
      
      const attendanceByDay = dayNames.map(day => ({
        day,
        count: dayAttendance[day] || 0,
      }));
      
      // Peak hours
      const hourCounts: Record<number, number> = {};
      bookings?.filter((b: any) => b.checked_in_at).forEach((b: any) => {
        const hour = new Date(b.gym_scheduled_classes?.start_time).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      const avgAttendanceRate = totalBookings > 0 
        ? Math.round((totalCheckIns / totalBookings) * 100 * 10) / 10 
        : 0;
      
      return {
        total_classes: totalClasses,
        total_bookings: totalBookings,
        total_check_ins: totalCheckIns,
        avg_attendance_rate: avgAttendanceRate,
        classes_by_type: classesByType,
        attendance_by_day: attendanceByDay,
        peak_hours: peakHours,
      };
    },
    enabled: !!gym?.id,
  });
}

export function useGymOverviewReport(dateRange: DateRange) {
  const memberReport = useGymMemberReport(dateRange);
  const financialReport = useGymFinancialReport(dateRange);
  const attendanceReport = useGymAttendanceReport(dateRange);
  
  return {
    data: memberReport.data && financialReport.data && attendanceReport.data
      ? {
          members: memberReport.data,
          financials: financialReport.data,
          attendance: attendanceReport.data,
        }
      : undefined,
    isLoading: memberReport.isLoading || financialReport.isLoading || attendanceReport.isLoading,
    error: memberReport.error || financialReport.error || attendanceReport.error,
    refetch: () => {
      memberReport.refetch();
      financialReport.refetch();
      attendanceReport.refetch();
    },
  };
}
