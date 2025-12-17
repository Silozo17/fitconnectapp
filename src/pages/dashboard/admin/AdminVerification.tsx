import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  Loader2,
  User,
  AlertTriangle,
  Bot,
  ChevronDown,
  RefreshCw,
  Eye,
  Shield,
  Sparkles
} from "lucide-react";
import {
  usePendingVerifications,
  useVerificationStats,
  useCoachVerificationDocuments,
  useReviewVerification,
  useReviewDocument,
  useRerunAIAnalysis,
  VerificationStatus,
  VerificationDocument,
  AIDocumentAnalysis,
} from "@/hooks/useVerification";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  approved: { label: "Approved", color: "bg-primary/10 text-primary", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const AIConfidenceBadge = ({ score }: { score: number | null }) => {
  if (score === null) return null;
  
  const getColor = () => {
    if (score >= 80) return "bg-primary/10 text-primary border-primary/30";
    if (score >= 50) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

  return (
    <Badge variant="outline" className={`${getColor()} gap-1`}>
      <Bot className="w-3 h-3" />
      {score}%
    </Badge>
  );
};

const AIRecommendationBadge = ({ recommendation }: { recommendation?: 'approve' | 'review' | 'reject' }) => {
  if (!recommendation) return null;

  const config = {
    approve: { label: "Approve", color: "bg-primary/10 text-primary", icon: CheckCircle },
    review: { label: "Review", color: "bg-amber-500/10 text-amber-500", icon: Eye },
    reject: { label: "Reject", color: "bg-destructive/10 text-destructive", icon: XCircle },
  };

  const { label, color, icon: Icon } = config[recommendation];

  return (
    <Badge className={`${color} gap-1`}>
      <Icon className="w-3 h-3" />
      AI: {label}
    </Badge>
  );
};

const AIAnalysisCard = ({ 
  analysis, 
  onRerun,
  isRerunning 
}: { 
  analysis: AIDocumentAnalysis | null;
  onRerun?: () => void;
  isRerunning?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!analysis) {
    return (
      <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bot className="w-4 h-4" />
            <span className="text-sm">AI analysis pending...</span>
          </div>
          {onRerun && (
            <Button variant="ghost" size="sm" onClick={onRerun} disabled={isRerunning}>
              {isRerunning ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${analysis.shouldFlag ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-muted/30'}`}>
        <CollapsibleTrigger className="w-full">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                analysis.shouldFlag ? 'bg-amber-500/20' : 'bg-primary/20'
              }`}>
                {analysis.shouldFlag ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">AI Analysis</span>
                  <AIConfidenceBadge score={analysis.confidenceScore} />
                  <AIRecommendationBadge recommendation={analysis.recommendation} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {analysis.summary}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
            {/* Confidence Score Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Confidence</span>
                <span className={
                  analysis.confidenceScore >= 80 ? 'text-primary' :
                  analysis.confidenceScore >= 50 ? 'text-amber-500' : 'text-destructive'
                }>
                  {analysis.confidenceScore}%
                </span>
              </div>
              <Progress 
                value={analysis.confidenceScore} 
                className="h-2"
              />
            </div>

            {/* Flags */}
            {analysis.flagReasons.length > 0 && (
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs font-medium text-amber-500 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Flagged for Review
                </p>
                <ul className="text-xs text-amber-500/80 space-y-0.5">
                  {analysis.flagReasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quality Assessment */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded ${analysis.qualityAssessment.isReadable ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                <span className={analysis.qualityAssessment.isReadable ? 'text-primary' : 'text-destructive'}>
                  {analysis.qualityAssessment.isReadable ? '✓' : '✗'} Readable
                </span>
              </div>
              <div className={`p-2 rounded ${analysis.qualityAssessment.isComplete ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                <span className={analysis.qualityAssessment.isComplete ? 'text-primary' : 'text-destructive'}>
                  {analysis.qualityAssessment.isComplete ? '✓' : '✗'} Complete
                </span>
              </div>
              <div className={`p-2 rounded ${analysis.documentTypeMatch ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
                <span className={analysis.documentTypeMatch ? 'text-primary' : 'text-amber-500'}>
                  {analysis.documentTypeMatch ? '✓' : '?'} Type Match
                </span>
              </div>
            </div>

            {/* Extracted Info */}
            {Object.values(analysis.extractedInfo).some(v => v) && (
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground font-medium">Extracted Info:</p>
                {analysis.extractedInfo.holderName && (
                  <p>Name: <span className="text-foreground">{analysis.extractedInfo.holderName}</span></p>
                )}
                {analysis.extractedInfo.issuingAuthority && (
                  <p>Issuer: <span className="text-foreground">{analysis.extractedInfo.issuingAuthority}</span></p>
                )}
                {analysis.extractedInfo.expiryDate && (
                  <p>Expires: <span className="text-foreground">{analysis.extractedInfo.expiryDate}</span></p>
                )}
              </div>
            )}

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div className="text-xs">
                <p className="text-muted-foreground font-medium mb-1">Issues Found:</p>
                <ul className="text-destructive/80 space-y-0.5">
                  {analysis.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rerun Button */}
            {onRerun && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={onRerun}
                disabled={isRerunning}
              >
                {isRerunning ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Re-run AI Analysis
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

const DocumentCard = ({ 
  doc, 
  onApprove, 
  onReject,
  onRerunAI,
  isReviewing,
  isRerunning,
}: {
  doc: VerificationDocument;
  onApprove: () => void;
  onReject: () => void;
  onRerunAI: () => void;
  isReviewing: boolean;
  isRerunning: boolean;
}) => {
  const aiAnalysis = doc.ai_analysis as AIDocumentAnalysis | null;

  return (
    <div className={`p-3 rounded-lg border bg-card space-y-3 ${
      doc.ai_flagged ? 'border-amber-500/50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">
            {doc.document_type.replace("_", " ")}
          </span>
          {doc.ai_flagged && (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <AIConfidenceBadge score={doc.ai_confidence_score} />
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
      </div>

      {/* File name */}
      <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>

      {/* AI Analysis */}
      <AIAnalysisCard 
        analysis={aiAnalysis}
        onRerun={onRerunAI}
        isRerunning={isRerunning}
      />

      {/* Actions */}
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
              onClick={onApprove}
              disabled={isReviewing}
            >
              <CheckCircle className="w-3 h-3 mr-1 text-primary" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={isReviewing}
            >
              <XCircle className="w-3 h-3 mr-1 text-destructive" />
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminVerification = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: coaches = [], isLoading } = usePendingVerifications(activeTab);
  const { data: stats } = useVerificationStats();
  const { data: documents = [] } = useCoachVerificationDocuments(selectedCoach?.id);
  const reviewMutation = useReviewVerification();
  const reviewDocMutation = useReviewDocument();
  const rerunAIMutation = useRerunAIAnalysis();

  // Calculate AI summary for selected coach
  const getAISummary = () => {
    if (documents.length === 0) return null;
    
    const flaggedCount = documents.filter(d => d.ai_flagged).length;
    const analyzedCount = documents.filter(d => d.ai_analyzed_at).length;
    const avgConfidence = documents.reduce((sum, d) => sum + (d.ai_confidence_score || 0), 0) / (analyzedCount || 1);

    return { flaggedCount, analyzedCount, avgConfidence, totalDocs: documents.length };
  };

  const aiSummary = getAISummary();

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

  const handleRerunAI = async (doc: VerificationDocument) => {
    await rerunAIMutation.mutateAsync(doc);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Coach Verification</h1>
            <p className="text-muted-foreground">Review and verify coach credentials with AI-assisted analysis</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-amber-500">{stats?.pendingCount ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved This Month</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {stats?.approvedThisMonth ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected This Month</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {stats?.rejectedThisMonth ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Bot className="w-4 h-4" />
                AI Assisted
              </CardDescription>
              <CardTitle className="text-3xl text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Active
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
              {(stats?.pendingCount ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-1">{stats?.pendingCount}</Badge>
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
                Review uploaded documents and AI analysis
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

                {/* AI Summary */}
                {aiSummary && aiSummary.analyzedCount > 0 && (
                  <Card className={`${aiSummary.flaggedCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-primary/30 bg-primary/5'}`}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">AI Summary</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Analyzed</p>
                          <p className="text-lg font-semibold">{aiSummary.analyzedCount}/{aiSummary.totalDocs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Confidence</p>
                          <p className={`text-lg font-semibold ${
                            aiSummary.avgConfidence >= 80 ? 'text-primary' :
                            aiSummary.avgConfidence >= 50 ? 'text-amber-500' : 'text-destructive'
                          }`}>
                            {Math.round(aiSummary.avgConfidence)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Flagged</p>
                          <p className={`text-lg font-semibold ${aiSummary.flaggedCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
                            {aiSummary.flaggedCount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Uploaded Documents
                  </h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  ) : (
                    documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        onApprove={() => handleDocumentReview(doc.id, "approved")}
                        onReject={() => handleDocumentReview(doc.id, "rejected")}
                        onRerunAI={() => handleRerunAI(doc)}
                        isReviewing={reviewDocMutation.isPending}
                        isRerunning={rerunAIMutation.isPending}
                      />
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
                      Approve All
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
