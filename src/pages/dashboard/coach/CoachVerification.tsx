import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  useVerificationStatus,
  useVerificationDocuments,
  useUploadVerificationDocument,
  useDeleteVerificationDocument,
  useSubmitForVerification,
  DocumentType,
} from "@/hooks/useVerification";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { format } from "date-fns";

const documentTypes: { type: DocumentType; label: string; description: string }[] = [
  { type: "identity", label: "Government ID", description: "Passport, driver's license, or national ID" },
  { type: "certification", label: "Professional Certification", description: "Personal training, nutrition, or coaching certification" },
  { type: "insurance", label: "Liability Insurance", description: "Professional indemnity or liability insurance" },
  { type: "qualification", label: "Qualifications", description: "Relevant degrees, diplomas, or qualifications" },
];

const statusConfig = {
  not_submitted: { label: "Not Submitted", color: "bg-muted text-muted-foreground", icon: AlertCircle },
  pending: { label: "Under Review", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: "Verified", color: "bg-primary/10 text-primary", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const CoachVerification = () => {
  const { data: status, isLoading: statusLoading } = useVerificationStatus();
  const { data: documents = [], isLoading: docsLoading } = useVerificationDocuments();
  const uploadMutation = useUploadVerificationDocument();
  const deleteMutation = useDeleteVerificationDocument();
  const submitMutation = useSubmitForVerification();
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    try {
      await uploadMutation.mutateAsync({ file, documentType: type });
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  const getDocumentsByType = (type: DocumentType) => {
    return documents.filter(doc => doc.document_type === type);
  };

  const canSubmit = documents.length > 0 && status?.verification_status === "not_submitted";
  const isVerified = status?.is_verified;
  const currentStatus = status?.verification_status || "not_submitted";
  const StatusIcon = statusConfig[currentStatus as keyof typeof statusConfig]?.icon || AlertCircle;

  if (statusLoading || docsLoading) {
    return (
      <DashboardLayout title="Verification" description="Get verified as a coach">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Verification" description="Get verified as a coach">
      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {isVerified ? (
                    <VerifiedBadge size="lg" showTooltip={false} />
                  ) : (
                    <Shield className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle>Verification Status</CardTitle>
                  <CardDescription>
                    {isVerified 
                      ? "Your profile is verified" 
                      : "Upload documents to get verified"}
                  </CardDescription>
                </div>
              </div>
              <Badge className={statusConfig[currentStatus as keyof typeof statusConfig]?.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[currentStatus as keyof typeof statusConfig]?.label}
              </Badge>
            </div>
          </CardHeader>
          {status?.verification_notes && (
            <CardContent>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-1">Admin Notes:</p>
                <p className="text-sm text-muted-foreground">{status.verification_notes}</p>
              </div>
            </CardContent>
          )}
          {isVerified && status?.verified_at && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified on {format(new Date(status.verified_at), "MMMM d, yyyy")}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Document Upload Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {documentTypes.map(({ type, label, description }) => {
            const typeDocs = getDocumentsByType(type);
            const isUploading = uploadingType === type;

            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-xs">{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Uploaded documents */}
                  {typeDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{doc.file_name}</span>
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
                      {doc.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Upload button */}
                  {currentStatus !== "approved" && (
                    <div>
                      <Label htmlFor={`upload-${type}`} className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {isUploading ? "Uploading..." : "Upload document"}
                          </span>
                        </div>
                      </Label>
                      <Input
                        id={`upload-${type}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, type)}
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        {currentStatus === "not_submitted" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ready to submit?</p>
                  <p className="text-sm text-muted-foreground">
                    {documents.length === 0 
                      ? "Upload at least one document to submit for verification"
                      : `${documents.length} document(s) uploaded`}
                  </p>
                </div>
                <Button 
                  onClick={() => submitMutation.mutate()}
                  disabled={!canSubmit || submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Submit for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStatus === "rejected" && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Verification Rejected</p>
                  <p className="text-sm text-muted-foreground">
                    Please review the admin notes and upload updated documents
                  </p>
                </div>
                <Button 
                  onClick={() => submitMutation.mutate()}
                  disabled={documents.length === 0 || submitMutation.isPending}
                >
                  Resubmit for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoachVerification;
