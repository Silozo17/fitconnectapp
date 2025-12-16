import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Loader2,
  User,
  Download
} from "lucide-react";
import {
  usePendingVerifications,
  useCoachVerificationDocuments,
  useReviewVerification,
  useReviewDocument,
  VerificationStatus,
} from "@/hooks/useVerification";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: "Approved", color: "bg-primary/10 text-primary", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const AdminVerification = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: coaches = [], isLoading } = usePendingVerifications(activeTab);
  const { data: documents = [] } = useCoachVerificationDocuments(selectedCoach?.id);
  const reviewMutation = useReviewVerification();
  const reviewDocMutation = useReviewDocument();

  const pendingCount = coaches.filter(c => c.verification_status === "pending").length;

  const handleReview = async (approved: boolean) => {
    if (!selectedCoach || !user) return;

    await reviewMutation.mutateAsync({
      coachId: selectedCoach.id,
      approved,
      notes: reviewNotes,
      adminId: user.id,
    });

    setSelectedCoach(null);
    setReviewNotes("");
  };

  const handleDocumentReview = async (docId: string, status: "approved" | "rejected") => {
    if (!user) return;

    await reviewDocMutation.mutateAsync({
      documentId: docId,
      status,
      adminId: user.id,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Coach Verification</h1>
          <p className="text-muted-foreground">Review and verify coach credentials</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved This Month</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {coaches.filter(c => c.verification_status === "approved").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected This Month</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {coaches.filter(c => c.verification_status === "rejected").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as VerificationStatus)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : coaches.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No {activeTab} verifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {coaches.map((coach) => (
                  <Card 
                    key={coach.id} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedCoach(coach)}
                  >
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={coach.profile_image_url || ""} />
                          <AvatarFallback>
                            {coach.display_name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{coach.display_name || "Unnamed Coach"}</p>
                          <p className="text-sm text-muted-foreground">
                            {coach.coach_types?.join(", ") || "No types specified"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {format(new Date(coach.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusConfig[coach.verification_status as keyof typeof statusConfig]?.color}>
                        {statusConfig[coach.verification_status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Sheet */}
        <Sheet open={!!selectedCoach} onOpenChange={(open) => !open && setSelectedCoach(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Review Verification</SheetTitle>
              <SheetDescription>
                Review uploaded documents and approve or reject verification
              </SheetDescription>
            </SheetHeader>

            {selectedCoach && (
              <div className="mt-6 space-y-6">
                {/* Coach Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCoach.profile_image_url || ""} />
                    <AvatarFallback>
                      {selectedCoach.display_name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{selectedCoach.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCoach.coach_types?.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3">
                  <h3 className="font-medium">Uploaded Documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-lg border bg-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium capitalize">
                              {doc.document_type.replace("_", " ")}
                            </span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              doc.status === "approved" 
                                ? "text-primary border-primary" 
                                : doc.status === "rejected"
                                ? "text-destructive border-destructive"
                                : ""
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentReview(doc.id, "approved")}
                                disabled={reviewDocMutation.isPending}
                              >
                                <CheckCircle className="w-3 h-3 mr-1 text-primary" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentReview(doc.id, "rejected")}
                                disabled={reviewDocMutation.isPending}
                              >
                                <XCircle className="w-3 h-3 mr-1 text-destructive" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Review Notes */}
                {selectedCoach.verification_status === "pending" && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Review Notes</h3>
                    <Textarea
                      placeholder="Add notes about this verification (optional)"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Previous Notes */}
                {selectedCoach.verification_notes && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-1">Previous Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCoach.verification_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedCoach.verification_status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleReview(false)}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleReview(true)}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve & Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
};

export default AdminVerification;
