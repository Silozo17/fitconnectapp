import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Search,
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
} from "lucide-react";
import { useFeedbackList, useUpdateFeedbackStatus } from "@/hooks/useFeedback";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  improvement: Sparkles,
  general: HelpCircle,
};

const CATEGORY_LABELS = {
  bug: "Bug Report",
  feature: "Feature Request",
  improvement: "Improvement",
  general: "General",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
  planned: { label: "Planned", color: "bg-blue-500/20 text-blue-500", icon: Calendar },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-500", icon: XCircle },
};

const USER_TYPE_LABELS = {
  client: "Client",
  coach: "Coach",
  admin: "Admin",
};

const AdminFeedback = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: feedbackList, isLoading } = useFeedbackList({
    status: statusFilter,
    category: categoryFilter,
    userType: userTypeFilter,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateFeedbackStatus();
  const { toast } = useToast();

  const filteredFeedback = feedbackList?.filter(
    (f) =>
      f.subject.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase()) ||
      f.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDetail = (feedback: any) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.admin_notes || "");
    setNewStatus(feedback.status);
  };

  const handleUpdateStatus = () => {
    if (!selectedFeedback) return;

    updateStatus(
      {
        feedbackId: selectedFeedback.id,
        status: newStatus,
        adminNotes,
      },
      {
        onSuccess: () => {
          toast({
            title: "Feedback Updated",
            description: "The feedback status has been updated and the user has been notified.",
          });
          setSelectedFeedback(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update feedback status.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const pendingCount = feedbackList?.filter((f) => f.status === "pending").length || 0;

  return (
    <AdminLayout>
      <Helmet>
        <title>Feedback | Admin Dashboard</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Feedback</h1>
            <p className="text-muted-foreground">
              Review and manage user feedback submissions
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
              {pendingCount} pending
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading feedback...
              </CardContent>
            </Card>
          ) : filteredFeedback?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found</p>
              </CardContent>
            </Card>
          ) : (
            filteredFeedback?.map((feedback) => {
              const CategoryIcon = CATEGORY_ICONS[feedback.category as keyof typeof CATEGORY_ICONS] || HelpCircle;
              const statusConfig = STATUS_CONFIG[feedback.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={feedback.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleOpenDetail(feedback)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-muted">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{feedback.subject}</h3>
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABELS[feedback.category as keyof typeof CATEGORY_LABELS]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {feedback.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {feedback.user_name} ({USER_TYPE_LABELS[feedback.user_type as keyof typeof USER_TYPE_LABELS]})
                            </span>
                            <span>
                              {format(new Date(feedback.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("shrink-0", statusConfig.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail Modal */}
        <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedFeedback && (
                  <>
                    {(() => {
                      const Icon = CATEGORY_ICONS[selectedFeedback.category as keyof typeof CATEGORY_ICONS] || HelpCircle;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    {selectedFeedback?.subject}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Submitted by {selectedFeedback?.user_name} on{" "}
                {selectedFeedback && format(new Date(selectedFeedback.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </DialogDescription>
            </DialogHeader>

            {selectedFeedback && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[selectedFeedback.category as keyof typeof CATEGORY_LABELS]}
                  </Badge>
                  <Badge variant="outline">
                    {USER_TYPE_LABELS[selectedFeedback.user_type as keyof typeof USER_TYPE_LABELS]}
                  </Badge>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes (optional)</label>
                  <Textarea
                    placeholder="Add internal notes about this feedback..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;
