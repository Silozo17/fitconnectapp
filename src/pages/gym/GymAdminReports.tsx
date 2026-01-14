import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";
import { 
  useGymMemberReport, 
  useGymFinancialReport, 
  useGymAttendanceReport,
  DateRange,
} from "@/hooks/gym/useGymReports";
import {
  arrayToCSV,
  downloadCSV,
  generateExportFilename,
  formatDateForCSV,
} from "@/lib/csv-export";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type DateRangePreset = "this_month" | "last_month" | "last_30_days" | "last_90_days" | "this_year";

export default function GymAdminReports() {
  const { gym } = useGym();
  const [datePreset, setDatePreset] = useState<DateRangePreset>("this_month");
  const [activeTab, setActiveTab] = useState("overview");
  
  const getDateRange = (preset: DateRangePreset): DateRange => {
    const now = new Date();
    switch (preset) {
      case "this_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last_month":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "last_30_days":
        return { start: subDays(now, 30), end: now };
      case "last_90_days":
        return { start: subDays(now, 90), end: now };
      case "this_year":
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };
  
  const dateRange = getDateRange(datePreset);
  
  const { data: memberReport, isLoading: loadingMembers, refetch: refetchMembers } = useGymMemberReport(dateRange);
  const { data: financialReport, isLoading: loadingFinancials, refetch: refetchFinancials } = useGymFinancialReport(dateRange);
  const { data: attendanceReport, isLoading: loadingAttendance, refetch: refetchAttendance } = useGymAttendanceReport(dateRange);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: gym?.currency || "GBP",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };
  
  const handleExportMembers = () => {
    if (!memberReport) return;
    
    const data = [
      { metric: "Total Members", value: memberReport.total_members },
      { metric: "Active Members", value: memberReport.active_members },
      { metric: "Inactive Members", value: memberReport.inactive_members },
      { metric: "New Members", value: memberReport.new_members },
      { metric: "Retention Rate", value: `${memberReport.retention_rate}%` },
    ];
    
    const csv = arrayToCSV(data, [
      { key: "metric", header: "Metric" },
      { key: "value", header: "Value" },
    ]);
    
    downloadCSV(csv, generateExportFilename("member-report"));
    toast.success("Member report exported");
  };
  
  const handleExportFinancials = () => {
    if (!financialReport) return;
    
    const data = [
      { metric: "Total Revenue", value: formatCurrency(financialReport.total_revenue) },
      { metric: "Membership Revenue", value: formatCurrency(financialReport.membership_revenue) },
      { metric: "Product Sales", value: formatCurrency(financialReport.product_sales) },
      { metric: "Net Revenue", value: formatCurrency(financialReport.net_revenue) },
    ];
    
    const csv = arrayToCSV(data, [
      { key: "metric", header: "Metric" },
      { key: "value", header: "Value" },
    ]);
    
    downloadCSV(csv, generateExportFilename("financial-report"));
    toast.success("Financial report exported");
  };
  
  const handleExportAttendance = () => {
    if (!attendanceReport) return;
    
    const data = attendanceReport.classes_by_type.map(c => ({
      class_name: c.class_name,
      classes_held: c.count,
      total_attendance: c.attendance,
      avg_attendance: c.count > 0 ? Math.round(c.attendance / c.count) : 0,
    }));
    
    const csv = arrayToCSV(data, [
      { key: "class_name", header: "Class Type" },
      { key: "classes_held", header: "Classes Held" },
      { key: "total_attendance", header: "Total Attendance" },
      { key: "avg_attendance", header: "Avg Attendance" },
    ]);
    
    downloadCSV(csv, generateExportFilename("attendance-report"));
    toast.success("Attendance report exported");
  };
  
  const handleRefreshAll = () => {
    refetchMembers();
    refetchFinancials();
    refetchAttendance();
    toast.success("Reports refreshed");
  };
  
  const isLoading = loadingMembers || loadingFinancials || loadingAttendance;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and export tools for your gym
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRangePreset)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefreshAll}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      
      {/* Date Range Display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {format(dateRange.start, "MMM d, yyyy")} - {format(dateRange.end, "MMM d, yyyy")}
        </span>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{memberReport?.active_members || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {memberReport?.new_members || 0} new this period
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialReport?.total_revenue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From memberships & sales
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{attendanceReport?.total_classes || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {attendanceReport?.total_bookings || 0} total bookings
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{memberReport?.retention_rate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      Active / Total members
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : financialReport?.revenue_by_day.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialReport.revenue_by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), "PPP")}
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No revenue data for this period
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Attendance by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Day</CardTitle>
                <CardDescription>Check-ins per day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : attendanceReport?.attendance_by_day.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceReport.attendance_by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No attendance data for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportMembers} disabled={loadingMembers}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Member Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Member Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingMembers ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Total Members</span>
                      <span className="font-bold">{memberReport?.total_members || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Active Members</span>
                      <Badge variant="default">{memberReport?.active_members || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Inactive Members</span>
                      <Badge variant="secondary">{memberReport?.inactive_members || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">New This Period</span>
                      <Badge variant="outline" className="text-green-600">
                        <ArrowUp className="mr-1 h-3 w-3" />
                        {memberReport?.new_members || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Retention Rate</span>
                      <span className="font-bold text-green-600">{memberReport?.retention_rate || 0}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Members by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Members by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : memberReport?.members_by_plan.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={memberReport.members_by_plan}
                        dataKey="count"
                        nameKey="plan_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ plan_name, count }) => `${plan_name}: ${count}`}
                      >
                        {memberReport.members_by_plan.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No plan data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportFinancials} disabled={loadingFinancials}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Financial Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingFinancials ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-bold text-xl">{formatCurrency(financialReport?.total_revenue || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Membership Revenue</span>
                      <span className="font-semibold">{formatCurrency(financialReport?.membership_revenue || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Product Sales</span>
                      <span className="font-semibold">{formatCurrency(financialReport?.product_sales || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <span className="text-muted-foreground">Net Revenue</span>
                      <span className="font-bold text-green-600">{formatCurrency(financialReport?.net_revenue || 0)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Revenue by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : financialReport?.revenue_by_plan.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialReport.revenue_by_plan} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="plan_name" width={120} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No revenue by plan data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportAttendance} disabled={loadingAttendance}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAttendance ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Total Classes</span>
                      <span className="font-bold">{attendanceReport?.total_classes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span className="font-semibold">{attendanceReport?.total_bookings || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Total Check-ins</span>
                      <Badge variant="default">{attendanceReport?.total_check_ins || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-muted-foreground">Attendance Rate</span>
                      <span className="font-bold text-green-600">{attendanceReport?.avg_attendance_rate || 0}%</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Classes by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Classes by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : attendanceReport?.classes_by_type.length ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {attendanceReport.classes_by_type.map((classType, index) => (
                      <div key={classType.class_name} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{classType.class_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {classType.count} classes · {classType.attendance} check-ins
                          </div>
                        </div>
                        <Badge variant="outline">
                          {classType.count > 0 ? Math.round(classType.attendance / classType.count) : 0} avg
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No class data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Most popular class times based on check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAttendance ? (
                <Skeleton className="h-20 w-full" />
              ) : attendanceReport?.peak_hours.length ? (
                <div className="flex flex-wrap gap-2">
                  {attendanceReport.peak_hours.map((peak, index) => (
                    <Badge 
                      key={peak.hour} 
                      variant={index === 0 ? "default" : "secondary"}
                      className="text-sm py-1 px-3"
                    >
                      {peak.hour}:00 - {peak.count} check-ins
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No peak hour data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
