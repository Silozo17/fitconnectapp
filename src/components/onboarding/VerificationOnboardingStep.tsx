import { useState, useRef } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BadgeCheck, 
  TrendingUp, 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2,
  Clock,
  ChevronDown
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
import { OnboardingStatusBanner } from "./OnboardingStatusBanner";

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
  const [showOptional, setShowOptional] = useState(false);
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
  ];

  const requiredDocs = DOCUMENT_TYPES.filter(d => d.required);
  const optionalDocs = DOCUMENT_TYPES.filter(d => !d.required);

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
      e.target.value = '';
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

  const renderDocumentCard = (docType: typeof DOCUMENT_TYPES[0]) => {
    const uploadedDocs = getDocsForType(docType.type);
    const isUploading = uploadingType === docType.type;
    const hasUpload = uploadedDocs.length > 0;
    
    return (
      <div
        key={docType.type}
        className={cn(
          "p-3 rounded-lg border transition-all",
          hasUpload 
            ? "border-primary/50 bg-primary/5" 
            : "border-border bg-secondary/30"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-foreground text-sm truncate">{docType.label}</p>
              {docType.required && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t('onboarding.required')}</Badge>
              )}
              {hasUpload && (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>
            
            {/* Show uploaded files compactly */}
            {uploadedDocs.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center gap-1.5 mt-1.5 text-xs"
              >
                <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-foreground truncate flex-1">{doc.file_name}</span>
                {doc.ai_analyzed_at ? (
                  <Badge 
                    variant={doc.ai_flagged ? "destructive" : "secondary"} 
                    className="text-[10px] px-1 py-0 shrink-0"
                  >
                    {doc.ai_flagged ? t('onboarding.flagged') : `${doc.ai_confidence_score}%`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    {t('onboarding.analyzing')}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleteMutation.isPending}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Upload button */}
          <div className="shrink-0">
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
              className="h-8 px-2.5 text-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  {hasUpload ? '+' : t('onboarding.upload')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Header */}
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
            {t('onboarding.getVerified')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('onboarding.standOutWithBadge')}
          </p>
        </div>

        {/* Benefits - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="flex-shrink-0 p-3 rounded-lg bg-secondary/50 border border-border min-w-[140px] sm:min-w-0 sm:flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-xs">{benefit.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Required Documents */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Required</p>
          {requiredDocs.map(renderDocumentCard)}
        </div>

        {/* Optional Documents - Collapsible */}
        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground w-full py-2 hover:text-foreground transition-colors">
            <ChevronDown className={cn("w-4 h-4 transition-transform", showOptional && "rotate-180")} />
            Optional documents ({optionalDocs.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-1">
            {optionalDocs.map(renderDocumentCard)}
          </CollapsibleContent>
        </Collapsible>

        {/* Status indicator - fixed height to prevent layout shift */}
        <OnboardingStatusBanner
          show={hasRequiredDocs}
          variant="success"
          icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
          message={t('onboarding.requiredDocsUploaded')}
          height={48}
        />
      </div>

      {/* Sticky Actions */}
      <div className="shrink-0 pt-3 border-t border-border flex gap-3 bg-background mt-auto">
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
