import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bug, RefreshCw, Download, Trash2, Pause, Play, 
  Activity, Users, Clock, AlertTriangle, Search,
  Filter, Calendar, Eye, ChevronDown, ChevronUp,
  Globe, MousePointer, Database, Zap, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, subHours, subDays } from "date-fns";
import { toast } from "sonner";
import { arrayToCSV, downloadCSV, generateExportFilename } from "@/lib/csv-export";
import AdminLayout from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DebugLog {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  component: string | null;
  route: string | null;
  timestamp: string;
  created_at: string;
}

interface UserInfo {
  id: string;
  displayName?: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  navigation: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  auth: "bg-green-500/20 text-green-500 border-green-500/30",
  render: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  click: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  error: "bg-red-500/20 text-red-500 border-red-500/30",
  state: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  query: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
  lifecycle: "bg-pink-500/20 text-pink-500 border-pink-500/30",
  fetch: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
  interaction: "bg-teal-500/20 text-teal-500 border-teal-500/30",
  performance: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  mutation: "bg-rose-500/20 text-rose-500 border-rose-500/30",
};

const EVENT_TYPE_ICONS: Record<string, typeof Activity> = {
  navigation: Globe,
  auth: Shield,
  render: Activity,
  click: MousePointer,
  error: AlertTriangle,
  state: Zap,
  query: Database,
  lifecycle: Clock,
  fetch: Globe,
  interaction: MousePointer,
  performance: Zap,
  mutation: Database,
};

const TIME_RANGES = [
  { value: "1h", label: "Last 1 hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "all", label: "All time" },
];

const AdminDebugConsole = () => {
  const { t } = useTranslation("admin");
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [userMap, setUserMap] = useState<Map<string, UserInfo>>(new Map());

  // Fetch logs based on time range
  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_debug_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      // Apply time filter
      if (timeRange !== "all") {
        const now = new Date();
        let startDate: Date;
        switch (timeRange) {
          case "1h": startDate = subHours(now, 1); break;
          case "6h": startDate = subHours(now, 6); break;
          case "24h": startDate = subHours(now, 24); break;
          case "7d": startDate = subDays(now, 7); break;
          default: startDate = subHours(now, 24);
        }
        query = query.gte("timestamp", startDate.toISOString());
      }

      if (filterType !== "all") {
        query = query.eq("event_type", filterType);
      }

      if (filterSession !== "all") {
        query = query.eq("session_id", filterSession);
      }

      if (filterUser !== "all") {
        query = query.eq("user_id", filterUser);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast the data properly
      const typedData = (data || []) as DebugLog[];
      setLogs(typedData);

      // Fetch user info for unique user IDs
      const uniqueUserIds = [...new Set(typedData.map(l => l.user_id).filter(Boolean))] as string[];
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", uniqueUserIds);
        
        const newUserMap = new Map<string, UserInfo>();
        profiles?.forEach(p => {
          const displayName = [p.first_name, p.last_name].filter(Boolean).join(' ') || undefined;
          newUserMap.set(p.user_id, { id: p.user_id, displayName });
        });
        setUserMap(newUserMap);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to fetch debug logs");
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchLogs();

    if (isPaused) return;

    const channel = supabase
      .channel("debug-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_debug_logs" },
        (payload) => {
          const newLog = payload.new as DebugLog;
          setLogs((prev) => [newLog, ...prev].slice(0, 1000));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPaused, timeRange, filterType, filterSession, filterUser]);

  // Clear all logs
  const clearLogs = async () => {
    if (!confirm("Are you sure you want to delete ALL debug logs? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase.from("user_debug_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      setLogs([]);
      toast.success("All debug logs cleared");
    } catch (error) {
      console.error("Failed to clear logs:", error);
      toast.error("Failed to clear logs");
    }
  };

  // Export logs
  const exportLogs = () => {
    const columns = [
      { key: "timestamp", header: "Timestamp" },
      { key: "event_type", header: "Event Type" },
      { key: "event_name", header: "Event Name" },
      { key: "component", header: "Component" },
      { key: "route", header: "Route" },
      { key: "session_id", header: "Session ID" },
      { key: "user_id", header: "User ID" },
      { key: "event_data", header: "Event Data" },
    ];

    const exportData = filteredLogs.map(log => ({
      ...log,
      event_data: JSON.stringify(log.event_data),
    }));

    const csv = arrayToCSV(exportData, columns);
    downloadCSV(csv, generateExportFilename("debug-logs"));
    toast.success("Debug logs exported");
  };

  // Filter logs by search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        log.event_name.toLowerCase().includes(term) ||
        log.event_type.toLowerCase().includes(term) ||
        log.component?.toLowerCase().includes(term) ||
        log.route?.toLowerCase().includes(term) ||
        JSON.stringify(log.event_data).toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  // Get unique sessions and users
  const uniqueSessions = useMemo(() => [...new Set(logs.map((l) => l.session_id))], [logs]);
  const uniqueUsers = useMemo(() => [...new Set(logs.map((l) => l.user_id).filter(Boolean))], [logs]);
  const uniqueEventTypes = useMemo(() => [...new Set(logs.map((l) => l.event_type))], [logs]);

  // Statistics
  const stats = useMemo(() => {
    const errorCount = logs.filter(l => l.event_type === "error").length;
    const clickCount = logs.filter(l => l.event_type === "click").length;
    const fetchCount = logs.filter(l => l.event_type === "fetch" || l.event_type === "query").length;
    return { errorCount, clickCount, fetchCount };
  }, [logs]);

  const toggleLogExpanded = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bug className="w-6 h-6 text-primary" />
              Debug Console
            </h1>
            <p className="text-muted-foreground">
              Comprehensive activity logs for all users across the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{logs.length.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueUsers.length}</p>
                  <p className="text-xs text-muted-foreground">Unique Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.errorCount}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((userId) => (
                <SelectItem key={userId} value={userId as string}>
                  {userMap.get(userId as string)?.displayName || (userId as string).slice(0, 8) + "..."}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSession} onValueChange={setFilterSession}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {uniqueSessions.slice(0, 50).map((session) => (
                    <SelectItem key={session} value={session}>
                      {session.slice(0, 16)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log List */}
        <Card>
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Activity Feed ({filteredLogs.length} events)
              </CardTitle>
              <Badge variant={isPaused ? "secondary" : "default"} className="text-xs">
                {isPaused ? "Paused" : "● Live"}
              </Badge>
            </div>
          </CardHeader>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => {
                const Icon = EVENT_TYPE_ICONS[log.event_type] || Activity;
                const isExpanded = expandedLogs.has(log.id);
                const hasData = log.event_data && Object.keys(log.event_data).length > 0;

                return (
                  <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleLogExpanded(log.id)}>
                    <CollapsibleTrigger asChild>
                      <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          {/* Timestamp */}
                          <div className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                          </div>

                          {/* Event Type Badge */}
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs w-24 justify-center flex-shrink-0",
                              EVENT_TYPE_COLORS[log.event_type]
                            )}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {log.event_type}
                          </Badge>

                          {/* Event Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate max-w-[300px]">
                                {log.event_name}
                              </span>
                              {log.component && (
                                <Badge variant="secondary" className="text-xs">
                                  {log.component}
                                </Badge>
                              )}
                            </div>
                            {log.route && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {log.route}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0 hidden md:block">
                            {log.user_id && (
                              <p className="text-xs text-muted-foreground">
                                {userMap.get(log.user_id)?.displayName || log.user_id.slice(0, 8)}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground/60">
                              {log.session_id.slice(0, 12)}
                            </p>
                          </div>

                          {/* Expand indicator */}
                          {hasData && (
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    {hasData && (
                      <CollapsibleContent>
                        <div className="px-4 pb-3 pl-[7.5rem]">
                          <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto text-muted-foreground">
                            {JSON.stringify(log.event_data, null, 2)}
                          </pre>
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })}

              {filteredLogs.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No logs found</p>
                  <p className="text-xs">Try adjusting your filters or time range</p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDebugConsole;
