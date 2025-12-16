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
  Loader2,
  AlertTriangle,
  Brain,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  useVerificationStatus,
  useVerificationDocuments,
  useUploadVerificationDocument,
  useDeleteVerificationDocument,
  useSubmitForVerification,
  useDocumentSignedUrl,
  useRerunAIAnalysis,
  DocumentType,
  AIDocumentAnalysis,
} from "@/hooks/useVerification";
import { VerifiedBadge } from "@/components/verification/VerifiedBadge";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

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

const AIAnalysisDisplay = ({ 
  document 
}: { 
  document: { 
    ai_analysis: unknown; 
    ai_confidence_score: number | null; 
    ai_flagged: boolean | null;
    ai_flagged_reasons: string[] | null;
    ai_analyzed_at: string | null;
  } 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const analysis = document.ai_analysis as AIDocumentAnalysis | null;

  if (!document.ai_analyzed_at) {
    return null;
  }

  const confidenceScore = document.ai_confidence_score ?? 0;
  const confidenceColor = confidenceScore >= 80 
    ? "text-primary" 
    : confidenceScore >= 50 
    ? "text-amber-500" 
    : "text-destructive";

  return (
    <div className="mt-2 space-y-2">
      {/* Quick status badges */}
      <div className="flex flex-wrap gap-1.5">
        {document.ai_flagged && (
          <Badge variant="destructive" className="text-xs gap-1">
            <AlertTriangle className="w-3 h-3" />
            Flagged
          </Badge>
        )}
        <Badge 
          variant="outline" 
          className={`text-xs gap-1 ${confidenceColor}`}
        >
          <Brain className="w-3 h-3" />
          {confidenceScore}% confidence
        </Badge>
        {analysis?.recommendation && (
          <Badge 
            variant="outline" 
            className={`text-xs ${
              analysis.recommendation === 'approve' 
                ? 'text-primary border-primary' 
                : analysis.recommendation === 'reject'
                ? 'text-destructive border-destructive'
                : 'text-amber-500 border-amber-500'
            }`}
          >
            AI: {analysis.recommendation}
          </Badge>
        )}
      </div>

      {/* Expandable details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs w-full justify-between">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              View AI Assessment
            </span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="rounded-lg bg-muted/50 p-3 space-y-3 text-sm">
            {/* Confidence bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className={confidenceColor}>{confidenceScore}%</span>
              </div>
              <Progress value={confidenceScore} className="h-2" />
            </div>

            {/* Summary */}
            {analysis?.summary && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
                <p className="text-xs">{analysis.summary}</p>
              </div>
            )}

            {/* Extracted info */}
            {analysis?.extractedInfo && Object.values(analysis.extractedInfo).some(v => v) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Extracted Information</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {analysis.extractedInfo.holderName && (
                    <div><span className="text-muted-foreground">Name:</span> {analysis.extractedInfo.holderName}</div>
                  )}
                  {analysis.extractedInfo.issuingAuthority && (
                    <div><span className="text-muted-foreground">Issuer:</span> {analysis.extractedInfo.issuingAuthority}</div>
                  )}
                  {analysis.extractedInfo.issueDate && (
                    <div><span className="text-muted-foreground">Issued:</span> {analysis.extractedInfo.issueDate}</div>
                  )}
                  {analysis.extractedInfo.expiryDate && (
                    <div><span className="text-muted-foreground">Expires:</span> {analysis.extractedInfo.expiryDate}</div>
                  )}
                  {analysis.extractedInfo.documentNumber && (
                    <div><span className="text-muted-foreground">Number:</span> {analysis.extractedInfo.documentNumber}</div>
                  )}
                </div>
              </div>
            )}

            {/* Flag reasons */}
            {document.ai_flagged && document.ai_flagged_reasons && document.ai_flagged_reasons.length > 0 && (
              <div>
                <p className="text-xs font-medium text-destructive mb-1">Flag Reasons</p>
                <ul className="text-xs list-disc pl-4 space-y-0.5">
                  {document.ai_flagged_reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues */}
            {analysis?.issues && analysis.issues.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-500 mb-1">Issues Found</p>
                <ul className="text-xs list-disc pl-4 space-y-0.5">
                  {analysis.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quality assessment */}
            {analysis?.qualityAssessment && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Quality Check</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant={analysis.qualityAssessment.isReadable ? "outline" : "destructive"} className="text-xs">
                    {analysis.qualityAssessment.isReadable ? "✓" : "✗"} Readable
                  </Badge>
                  <Badge variant={analysis.qualityAssessment.isComplete ? "outline" : "destructive"} className="text-xs">
                    {analysis.qualityAssessment.isComplete ? "✓" : "✗"} Complete
                  </Badge>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Analyzed {document.ai_analyzed_at ? format(new Date(document.ai_analyzed_at), "MMM d, yyyy 'at' HH:mm") : 'recently'}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const CoachVerification = () => {
  const { data: status, isLoading: statusLoading } = useVerificationStatus();
  const { data: documents = [], isLoading: docsLoading } = useVerificationDocuments();
  const uploadMutation = useUploadVerificationDocument();
  const deleteMutation = useDeleteVerificationDocument();
  const submitMutation = useSubmitForVerification();
  const signedUrlMutation = useDocumentSignedUrl();
  const rerunAIMutation = useRerunAIAnalysis();
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

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

  const handleViewDocument = async (doc: typeof documents[0]) => {
    setViewingDocId(doc.id);
    try {
      const signedUrl = await signedUrlMutation.mutateAsync(doc.file_url);
      window.open(signedUrl, '_blank');
    } finally {
      setViewingDocId(null);
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
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{doc.file_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              doc.status === "approved" 
                                ? "text-primary border-primary" 
                                : doc.status === "rejected"
                                ? "text-destructive border-destructive"
                                : ""
                            }`}
                          >
                            {doc.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleViewDocument(doc)}
                            disabled={viewingDocId === doc.id}
                          >
                            {viewingDocId === doc.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                          {doc.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteMutation.mutate(doc.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis display */}
                      <AIAnalysisDisplay document={doc} />

                      {/* Re-run AI button if needed */}
                      {doc.ai_analyzed_at && doc.ai_flagged && doc.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => rerunAIMutation.mutate(doc)}
                          disabled={rerunAIMutation.isPending}
                        >
                          {rerunAIMutation.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3 mr-1" />
                          )}
                          Re-run AI Check
                        </Button>
                      )}

                      {/* Analyzing indicator */}
                      {!doc.ai_analyzed_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          AI analysis in progress...
                        </div>
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
