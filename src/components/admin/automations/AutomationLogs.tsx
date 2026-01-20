import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  History,
  RefreshCw,
} from "lucide-react";
import {
  AdminAutomationRule,
  AdminAutomationLog,
  useAdminAutomationLogs,
  useAutomationStats,
} from "@/hooks/useAdminAutomations";

interface AutomationLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: AdminAutomationRule | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "sent":
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case "skipped":
      return (
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Skipped
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function AutomationLogs({ open, onOpenChange, automation }: AutomationLogsProps) {
  const [activeTab, setActiveTab] = useState("logs");
  
  const { data: logs = [], isLoading, refetch } = useAdminAutomationLogs({
    ruleId: automation?.id,
    limit: 100,
  });

  const { data: stats } = useAutomationStats(automation?.id || "");

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{automation.name} - Activity</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs" className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mb-4 opacity-50" />
                  <p>No logs yet</p>
                  <p className="text-sm">Activity will appear here once the automation runs</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <StatusBadge status={log.status} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.user_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {log.message_type.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.error_message || log.message_content?.substring(0, 50) || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Successful
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-500">{stats?.sent || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-destructive">{stats?.failed || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Skipped
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">{stats?.skipped || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats.total > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">
                        {((stats.sent / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
