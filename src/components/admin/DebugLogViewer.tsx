import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, Download, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DebugLog {
  id: string;
  user_id: string | null;
  session_id: string;
  event_type: string;
  event_name: string;
  event_data: unknown;
  component: string | null;
  route: string | null;
  timestamp: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  navigation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  auth: "bg-green-500/20 text-green-400 border-green-500/30",
  render: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  state: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  query: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  lifecycle: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  click: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  fetch: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  interaction: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  performance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  mutation: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  // NEW event types
  toast: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  modal: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  storage: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  subscription: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  payment: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  ai: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  media: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  booking: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  onboarding: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  cache: "bg-stone-500/20 text-stone-400 border-stone-500/30",
};

export function DebugLogViewer() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_debug_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500);

      if (filterType !== "all") {
        query = query.eq("event_type", filterType);
      }
      if (filterSession) {
        query = query.eq("session_id", filterSession);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Failed to fetch debug logs:", error);
      toast({ title: "Error", description: "Failed to fetch debug logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to delete all debug logs?")) return;
    
    try {
      const { error } = await supabase.from("user_debug_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
      setLogs([]);
      toast({ title: "Success", description: "Debug logs cleared" });
    } catch (error) {
      console.error("Failed to clear logs:", error);
      toast({ title: "Error", description: "Failed to clear logs", variant: "destructive" });
    }
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "Session", "Type", "Name", "Component", "Route", "Data"].join(","),
      ...logs.map(log => [
        log.timestamp,
        log.session_id,
        log.event_type,
        log.event_name,
        log.component || "",
        log.route || "",
        JSON.stringify(log.event_data).replace(/,/g, ";"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchLogs();

    if (isPaused) return;

    const channel = supabase
      .channel("debug-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_debug_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as DebugLog, ...prev.slice(0, 499)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPaused, filterType, filterSession]);

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.event_name.toLowerCase().includes(searchLower) ||
      log.component?.toLowerCase().includes(searchLower) ||
      log.route?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.event_data).toLowerCase().includes(searchLower)
    );
  });

  const uniqueSessions = [...new Set(logs.map(l => l.session_id))];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Debug Logs</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="error">🔴 Error</SelectItem>
              <SelectItem value="performance">⚠️ Performance</SelectItem>
              <SelectItem value="navigation">Navigation</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="render">Render</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="query">Query</SelectItem>
              <SelectItem value="lifecycle">Lifecycle</SelectItem>
              <SelectItem value="click">Click</SelectItem>
              <SelectItem value="fetch">Fetch</SelectItem>
              <SelectItem value="interaction">Interaction</SelectItem>
              <SelectItem value="mutation">Mutation</SelectItem>
              <SelectItem value="toast">Toast</SelectItem>
              <SelectItem value="modal">Modal</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="cache">Cache</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSession} onValueChange={setFilterSession}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sessions</SelectItem>
              {uniqueSessions.map(session => (
                <SelectItem key={session} value={session}>
                  {session.slice(0, 20)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No debug logs found. Make sure debug logging is enabled.
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-xs font-mono"
                >
                  <span className="text-muted-foreground shrink-0 w-20">
                    {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`shrink-0 text-[10px] ${EVENT_TYPE_COLORS[log.event_type] || ""}`}
                  >
                    {log.event_type}
                  </Badge>
                  <span className="text-foreground font-medium">{log.event_name}</span>
                  {log.component && (
                    <span className="text-purple-400">[{log.component}]</span>
                  )}
                  {log.route && (
                    <span className="text-blue-400">{log.route}</span>
                  )}
                  {Object.keys(log.event_data || {}).length > 0 && (
                    <span className="text-muted-foreground truncate max-w-[300px]">
                      {JSON.stringify(log.event_data)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t mt-3">
          <span>Showing {filteredLogs.length} of {logs.length} logs</span>
          <span>{isPaused ? "⏸ Paused" : "🔴 Live"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default DebugLogViewer;
