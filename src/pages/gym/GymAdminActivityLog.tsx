import { useState } from "react";
import { useGym } from "@/contexts/GymContext";
import { useGymActionLogs, ActionCategory } from "@/hooks/gym/useGymActionLog";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Search,
} from "lucide-react";
import { format, subDays } from "date-fns";

const CATEGORY_OPTIONS: { value: ActionCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "membership", label: "Membership" },
  { value: "member", label: "Members" },
  { value: "payment", label: "Payments" },
  { value: "class", label: "Classes" },
  { value: "staff", label: "Staff" },
  { value: "settings", label: "Settings" },
  { value: "marketing", label: "Marketing" },
  { value: "inventory", label: "Inventory" },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "membership":
      return "bg-blue-500/10 text-blue-500";
    case "member":
      return "bg-green-500/10 text-green-500";
    case "payment":
      return "bg-yellow-500/10 text-yellow-500";
    case "class":
      return "bg-purple-500/10 text-purple-500";
    case "staff":
      return "bg-orange-500/10 text-orange-500";
    case "settings":
      return "bg-gray-500/10 text-gray-500";
    case "marketing":
      return "bg-pink-500/10 text-pink-500";
    case "inventory":
      return "bg-teal-500/10 text-teal-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getActionIcon = (actionType: string) => {
  if (actionType.includes("cancel") || actionType.includes("delete")) {
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  }
  return <CheckCircle className="h-4 w-4 text-primary" />;
};

export default function GymAdminActivityLog() {
  const { gym, userRole } = useGym();
  const { data: staffList = [] } = useGymStaff();
  
  // Filters
  const [category, setCategory] = useState<ActionCategory | "all">("all");
  const [staffId, setStaffId] = useState<string>("all");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchQuery, setSearchQuery] = useState("");

  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs = [], isLoading } = useGymActionLogs({
    category: category === "all" ? undefined : category,
    staffId: staffId === "all" ? undefined : staffId,
    startDate: startDate ? `${startDate}T00:00:00` : undefined,
    endDate: endDate ? `${endDate}T23:59:59` : undefined,
    limit: 100,
  });

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(query) ||
      log.action_type.toLowerCase().includes(query) ||
      log.staff?.display_name?.toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    const csvContent = [
      ["Date", "Staff", "Category", "Action", "Description", "Reviewed"].join(","),
      ...filteredLogs.map((log) =>
        [
          format(new Date(log.created_at), "yyyy-MM-dd HH:mm"),
          log.staff?.display_name || "Unknown",
          log.action_category,
          log.action_type,
          `"${log.description.replace(/"/g, '""')}"`,
          log.reviewed_at ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!gym) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all staff actions and changes at {gym.name}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ActionCategory | "all")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffList.map((staff: any) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.display_name || staff.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} actions
            {userRole === "manager" && " (from staff you manage)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity found matching your filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="max-w-[300px]">Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {log.staff?.display_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {log.staff?.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(log.action_category)}
                      >
                        {log.action_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className="text-sm">
                          {log.action_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell>
                      {log.requires_owner_review && !log.reviewed_at ? (
                        <Badge variant="destructive">Needs Review</Badge>
                      ) : log.reviewed_at ? (
                        <Badge variant="outline" className="text-green-600">
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Logged</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Action Details</DialogTitle>
                            <DialogDescription>
                              {format(
                                new Date(log.created_at),
                                "MMMM d, yyyy 'at' HH:mm:ss"
                              )}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">
                                  Staff Member
                                </Label>
                                <p className="font-medium">
                                  {log.staff?.display_name || "Unknown"} (
                                  {log.staff?.role})
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">
                                  Category
                                </Label>
                                <Badge
                                  variant="outline"
                                  className={getCategoryColor(log.action_category)}
                                >
                                  {log.action_category}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">
                                  Action Type
                                </Label>
                                <p className="font-medium">
                                  {log.action_type.replace(/_/g, " ")}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">
                                  Target Entity
                                </Label>
                                <p className="font-medium">
                                  {log.target_entity_type || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-muted-foreground">
                                Description
                              </Label>
                              <p className="mt-1">{log.description}</p>
                            </div>

                            {log.old_values && (
                              <div>
                                <Label className="text-muted-foreground">
                                  Previous Values
                                </Label>
                                <ScrollArea className="h-24 mt-1 rounded border p-2">
                                  <pre className="text-xs">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </ScrollArea>
                              </div>
                            )}

                            {log.new_values && (
                              <div>
                                <Label className="text-muted-foreground">
                                  New Values
                                </Label>
                                <ScrollArea className="h-24 mt-1 rounded border p-2">
                                  <pre className="text-xs">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </ScrollArea>
                              </div>
                            )}

                            {log.user_agent && (
                              <div>
                                <Label className="text-muted-foreground">
                                  User Agent
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1 break-all">
                                  {log.user_agent}
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
