import { useState, useRef } from "react";
import DOMPurify from "dompurify";
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
import { useTranslation } from "react-i18next";

interface VerificationOnboardingStepProps {
  coachId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function VerificationOnboardingStep({
  coachId,
  onComplete,
  onSkip,
}: VerificationOnboardingStepProps) {
  const { t } = useTranslation('common');
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const { data: documents = [], isLoading } = useVerificationDocuments();
  const uploadMutation = useUploadVerificationDocument();
  const deleteMutation = useDeleteVerificationDocument();
  const submitMutation = useSubmitForVerification();

  const DOCUMENT_TYPES: { 
    type: DocumentType; 
    label: string; 
    description: string; 
    required: boolean;
  }[] = [
    { 
      type: 'identity', 
      label: t('onboarding.governmentId'), 
      description: t('onboarding.governmentIdDesc'), 
      required: true 
    },
    { 
      type: 'certification', 
      label: t('onboarding.professionalCerts'), 
      description: t('onboarding.professionalCertsDesc'), 
      required: true 
    },
    { 
      type: 'insurance', 
      label: t('onboarding.insuranceCert'), 
      description: t('onboarding.insuranceCertDesc'), 
      required: false 
    },
    { 
      type: 'qualification', 
      label: t('onboarding.otherQualifications'), 
      description: t('onboarding.otherQualificationsDesc'), 
      required: false 
    },
  ];

  const BENEFITS = [
    { icon: BadgeCheck, title: t('onboarding.verifiedBadge'), description: t('onboarding.standOutTrust') },
    { icon: TrendingUp, title: t('onboarding.higherRanking'), description: t('onboarding.appearHigher') },
    { icon: Users, title: t('onboarding.moreClients'), description: t('onboarding.buildTrustFaster') },
    { icon: Shield, title: t('onboarding.premiumTrust'), description: t('onboarding.showProfessionalism') },
  ];

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
          {t('onboarding.getVerified')}
        </h2>
        <p className="text-muted-foreground">
          {t('onboarding.standOutWithBadge')}
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
        <AlertDescription 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t('onboarding.verificationOptional')) }}
        />
      </Alert>

      {/* Document Upload Cards */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{t('onboarding.uploadDocuments')}</p>
        
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
                      <Badge variant="outline" className="text-xs">{t('onboarding.required')}</Badge>
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
                          {doc.ai_flagged ? t('onboarding.flagged') : `${doc.ai_confidence_score}%`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('onboarding.analyzing')}
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
                        {hasUpload ? t('onboarding.addMore') : t('onboarding.upload')}
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
            {t('onboarding.uploadBothRequired')}
          </AlertDescription>
        </Alert>
      )}

      {hasRequiredDocs && (
        <Alert className="bg-primary/10 border-primary/30">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            {t('onboarding.requiredDocsUploaded')}
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
          {t('onboarding.skipForNow')}
        </Button>
        <Button 
          onClick={handleSubmitAndContinue}
          disabled={submitMutation.isPending}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {hasAnyDocs ? t('onboarding.submitAndContinue') : t('actions.continue')}
        </Button>
      </div>
    </div>
  );
}
