import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGym, useIsOwnerOrAreaManager } from "@/contexts/GymContext";
import { 
  useGymRefundRequests, 
  useUpdateRefundRequest, 
  useCreateRefundRequest 
} from "@/hooks/gym/useGymRefundRequests";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  ExternalLink,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const REASON_CATEGORIES = [
  { value: "relocation", label: "Relocation (>25 miles)", requiresProof: true },
  { value: "injury", label: "Medical/Injury (>3 months)", requiresProof: true },
  { value: "financial", label: "Financial Hardship", requiresProof: false },
  { value: "other", label: "Other", requiresProof: false },
];

export default function GymAdminRefundRequests() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym, staffRecord } = useGym();
  const isOwnerOrAreaManager = useIsOwnerOrAreaManager();
  const { data: requests, isLoading } = useGymRefundRequests();
  const updateRequest = useUpdateRefundRequest();
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredRequests = requests?.filter(r => 
    filterStatus === "all" || r.status === filterStatus
  ) || [];

  const handleApprove = async (requestId: string) => {
    try {
      await updateRequest.mutateAsync({
        requestId,
        status: "approved",
      });
      toast.success("Refund request approved");
      setReviewDialogOpen(false);
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await updateRequest.mutateAsync({
        requestId,
        status: "rejected",
        rejectionReason,
      });
      toast.success("Refund request rejected");
      setReviewDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "approved":
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refund Requests</h1>
          <p className="text-muted-foreground">
            {isOwnerOrAreaManager 
              ? "Review and approve refund requests from managers."
              : "Submit and track your refund requests."}
          </p>
        </div>
        {!isOwnerOrAreaManager && (
          <Button asChild>
            <Link to={`/gym-admin/${gymId}/refund-requests/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      {/* Pending Approval Alert - for owners */}
      {isOwnerOrAreaManager && pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                {pendingCount} request{pendingCount > 1 ? 's' : ''} awaiting review
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Manager refund requests need your approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            {isOwnerOrAreaManager ? "All Requests" : "My Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No refund requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {request.member?.first_name} {request.member?.last_name}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="capitalize">{request.request_type?.replace("_", " ")}</span>
                      {" • "}
                      <span className="capitalize">{request.reason_category?.replace("_", " ")}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {format(new Date(request.created_at), "PPp")}
                    </p>
                    {request.amount && (
                      <p className="text-sm font-medium">
                        Amount: {gym?.currency || "GBP"} {(request.amount / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.proof_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.proof_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-1 h-3 w-3" />
                          Proof
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {isOwnerOrAreaManager && request.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewDialogOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                    {!isOwnerOrAreaManager && request.status === "rejected" && (
                      <div className="text-sm text-destructive max-w-[200px]">
                        Reason: {request.rejection_reason || "No reason provided"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog - for owners */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Refund Request</DialogTitle>
            <DialogDescription>
              Approve or reject this refund request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Member</Label>
                  <p className="font-medium">
                    {selectedRequest.member?.first_name} {selectedRequest.member?.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Request Type</Label>
                  <p className="font-medium capitalize">
                    {selectedRequest.request_type?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reason Category</Label>
                  <p className="font-medium capitalize">
                    {selectedRequest.reason_category?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Manager's Explanation</Label>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <Label className="text-muted-foreground">Refund Amount</Label>
                    <p className="font-medium">
                      {gym?.currency || "GBP"} {(selectedRequest.amount / 100).toFixed(2)}
                    </p>
                  </div>
                )}
                {selectedRequest.proof_url && (
                  <div>
                    <Label className="text-muted-foreground">Proof Document</Label>
                    <Button variant="outline" size="sm" className="mt-1" asChild>
                      <a href={selectedRequest.proof_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1 h-3 w-3" />
                        View Proof
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rejection Reason (required if rejecting)</Label>
                <Textarea
                  placeholder="Explain why the request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleReject(selectedRequest.id)}
              disabled={updateRequest.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
              disabled={updateRequest.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
