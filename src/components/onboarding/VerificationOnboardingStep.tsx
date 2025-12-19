import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  BadgeCheck, 
  TrendingUp, 
  Users, 
  Shield, 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { 
  useVerificationDocuments, 
  useUploadVerificationDocument, 
  useDeleteVerificationDocument,
  useSubmitForVerification,
  DocumentType,
  VerificationDocument
} from "@/hooks/useVerification";
import { cn } from "@/lib/utils";

interface VerificationOnboardingStepProps {
  coachId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const DOCUMENT_TYPES: { 
  type: DocumentType; 
  label: string; 
  description: string; 
  required: boolean;
}[] = [
  { 
    type: 'identity', 
    label: 'Government ID', 
    description: 'Passport, driving licence, or national ID', 
    required: true 
  },
  { 
    type: 'certification', 
    label: 'Professional Certifications', 
    description: 'PT certs, coaching qualifications', 
    required: true 
  },
  { 
    type: 'insurance', 
    label: 'Insurance Certificate', 
    description: 'Professional liability insurance', 
    required: false 
  },
  { 
    type: 'qualification', 
    label: 'Other Qualifications', 
    description: 'Degrees, additional training', 
    required: false 
  },
];

const BENEFITS = [
  { icon: BadgeCheck, title: "Verified Badge", description: "Stand out with trust signals" },
  { icon: TrendingUp, title: "Higher Ranking", description: "Appear higher in search" },
  { icon: Users, title: "More Clients", description: "Build trust faster" },
  { icon: Shield, title: "Premium Trust", description: "Show professionalism" },
];

export default function VerificationOnboardingStep({
  coachId,
  onComplete,
  onSkip,
}: VerificationOnboardingStepProps) {
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const { data: documents = [], isLoading } = useVerificationDocuments();
  const uploadMutation = useUploadVerificationDocument();
  const deleteMutation = useDeleteVerificationDocument();
  const submitMutation = useSubmitForVerification();

  const hasIdentity = documents.some(d => d.document_type === 'identity');
  const hasCertification = documents.some(d => d.document_type === 'certification');
  const hasRequiredDocs = hasIdentity && hasCertification;
  const hasAnyDocs = documents.length > 0;

  const handleFileSelect = async (type: DocumentType, file: File) => {
    setUploadingType(type);
    try {
      await uploadMutation.mutateAsync({ file, documentType: type });
    } finally {
      setUploadingType(null);
    }
  };

  const handleUploadClick = (type: DocumentType) => {
    fileInputRefs.current[type]?.click();
  };

  const handleFileChange = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(type, file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = (documentId: string) => {
    deleteMutation.mutate(documentId);
  };

  const handleSubmitAndContinue = async () => {
    if (hasAnyDocs) {
      await submitMutation.mutateAsync();
    }
    onComplete();
  };

  const getDocsForType = (type: DocumentType): VerificationDocument[] => {
    return documents.filter(d => d.document_type === type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Get Verified
        </h2>
        <p className="text-muted-foreground">
          Stand out with a verified badge and rank higher in search results.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Notice */}
      <Alert className="bg-muted/50 border-border">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Verification is <strong>optional</strong>. You can skip this and complete it later 
          from your dashboard settings. Unverified profiles appear lower in search results.
        </AlertDescription>
      </Alert>

      {/* Document Upload Cards */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Upload your documents</p>
        
        {DOCUMENT_TYPES.map((docType) => {
          const uploadedDocs = getDocsForType(docType.type);
          const isUploading = uploadingType === docType.type;
          const hasUpload = uploadedDocs.length > 0;
          
          return (
            <div
              key={docType.type}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                hasUpload 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border bg-secondary/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{docType.label}</p>
                    {docType.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                    {hasUpload && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {docType.description}
                  </p>
                  
                  {/* Show uploaded files */}
                  {uploadedDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">
                        {doc.file_name}
                      </span>
                      {doc.ai_analyzed_at ? (
                        <Badge 
                          variant={doc.ai_flagged ? "destructive" : "secondary"} 
                          className="text-xs shrink-0"
                        >
                          {doc.ai_flagged ? "Flagged" : `${doc.ai_confidence_score}%`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Analyzing
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Upload button */}
                <div>
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[docType.type] = el)}
                    onChange={(e) => handleFileChange(docType.type, e)}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadClick(docType.type)}
                    disabled={isUploading}
                    className="shrink-0"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-1.5" />
                        {hasUpload ? "Add More" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      {hasAnyDocs && !hasRequiredDocs && (
        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Upload both a Government ID and Professional Certification to submit for verification.
          </AlertDescription>
        </Alert>
      )}

      {hasRequiredDocs && (
        <Alert className="bg-primary/10 border-primary/30">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            You have uploaded the required documents. Click "Submit & Continue" to send for review.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          onClick={onSkip}
          className="flex-1"
        >
          Skip for now
        </Button>
        <Button 
          onClick={handleSubmitAndContinue}
          disabled={submitMutation.isPending}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {hasAnyDocs ? "Submit & Continue" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
