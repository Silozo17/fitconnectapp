import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Shield, 
  Eye, 
  Camera, 
  User,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientConsentWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  coachName: string;
  onConsent: (consentData: ConsentData) => void;
}

interface ConsentData {
  shareStats: boolean;
  sharePhotos: boolean;
  blurFace: boolean;
  shareName: boolean;
  shareFullDetails: boolean;
}

export function ClientConsentWorkflow({
  open,
  onOpenChange,
  clientName,
  coachName,
  onConsent,
}: ClientConsentWorkflowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [consent, setConsent] = useState<ConsentData>({
    shareStats: true,
    sharePhotos: false,
    blurFace: true,
    shareName: false,
    shareFullDetails: false,
  });
  const [legalAgreed, setLegalAgreed] = useState(false);

  const handleComplete = () => {
    onConsent(consent);
    onOpenChange(false);
    // Reset state
    setStep(1);
    setLegalAgreed(false);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            step >= s ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t('consent.title', 'Share Your Transformation')}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && t('consent.step1Desc', 'Learn what will be shared')}
            {step === 2 && t('consent.step2Desc', 'Choose what to include')}
            {step === 3 && t('consent.step3Desc', 'Preview your showcase')}
            {step === 4 && t('consent.step4Desc', 'Confirm your consent')}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator />

        {/* Step 1: Explanation */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('consent.explanation', '{{coach}} would like to showcase your fitness journey to inspire others. Here\'s what this means:', { coach: coachName })}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Eye className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('consent.visibility', 'Public Visibility')}</p>
                  <p className="text-xs text-muted-foreground">{t('consent.visibilityDesc', 'Your transformation may be visible on the coach\'s profile')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Lock className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('consent.control', 'You\'re in Control')}</p>
                  <p className="text-xs text-muted-foreground">{t('consent.controlDesc', 'Choose exactly what to share and revoke anytime')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('consent.privacy', 'Privacy Protected')}</p>
                  <p className="text-xs text-muted-foreground">{t('consent.privacyDesc', 'Face blurring and anonymous options available')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Granular Consent */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('consent.statsOnly', 'Progress Stats')}</Label>
                    <p className="text-xs text-muted-foreground">{t('consent.statsDesc', 'Weight, measurements, duration')}</p>
                  </div>
                </div>
                <Checkbox 
                  checked={consent.shareStats} 
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, shareStats: !!checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('consent.photos', 'Progress Photos')}</Label>
                    <p className="text-xs text-muted-foreground">{t('consent.photosDesc', 'Before and after images')}</p>
                  </div>
                </div>
                <Checkbox 
                  checked={consent.sharePhotos} 
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, sharePhotos: !!checked }))}
                />
              </div>

              {consent.sharePhotos && (
                <div className="ml-8 flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <Label className="text-sm">{t('consent.blurFace', 'Blur My Face')}</Label>
                    <p className="text-xs text-muted-foreground">{t('consent.blurDesc', 'Automatically blur face in photos')}</p>
                  </div>
                  <Checkbox 
                    checked={consent.blurFace} 
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, blurFace: !!checked }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm">{t('consent.name', 'Display Name')}</Label>
                    <p className="text-xs text-muted-foreground">{t('consent.nameDesc', 'Show your first name')}</p>
                  </div>
                </div>
                <Checkbox 
                  checked={consent.shareName} 
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, shareName: !!checked }))}
                />
              </div>
            </div>

            {!consent.shareStats && !consent.sharePhotos && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-warning">{t('consent.selectSomething', 'Please select at least one option to continue')}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('consent.previewTitle', 'Here\'s how your showcase will appear:')}
            </p>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              {/* Preview Card */}
              <div className="space-y-3">
                {consent.sharePhotos && (
                  <div className="flex gap-2">
                    <div className="flex-1 aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
                    <div className="flex-1 aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {consent.shareName ? clientName.split(' ')[0] : t('consent.anonymous', 'Anonymous')}
                  </span>
                  {consent.sharePhotos && consent.blurFace && (
                    <Badge variant="secondary" className="text-xs">
                      {t('consent.faceBlurred', 'Face Blurred')}
                    </Badge>
                  )}
                </div>

                {consent.shareStats && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>-12 kg</span>
                    <span>16 weeks</span>
                    <span>-8% body fat</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Legal Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <h4 className="font-medium text-sm">{t('consent.legalTitle', 'Consent Agreement')}</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• {t('consent.legal1', 'I confirm these are my genuine progress results')}</li>
                <li>• {t('consent.legal2', 'I grant permission for public display')}</li>
                <li>• {t('consent.legal3', 'I can revoke consent at any time from my settings')}</li>
                <li>• {t('consent.legal4', 'My data will be handled per the Privacy Policy')}</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Checkbox 
                id="legal-agree"
                checked={legalAgreed} 
                onCheckedChange={(checked) => setLegalAgreed(!!checked)}
              />
              <Label htmlFor="legal-agree" className="text-sm leading-relaxed cursor-pointer">
                {t('consent.agree', 'I understand and agree to the terms above')}
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as any)} className="flex-1 sm:flex-none">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('common.back', 'Back')}
            </Button>
          )}
          {step < 4 && (
            <Button 
              onClick={() => setStep((s) => (s + 1) as any)} 
              disabled={step === 2 && !consent.shareStats && !consent.sharePhotos}
              className="flex-1 sm:flex-none"
            >
              {t('common.next', 'Next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleComplete} disabled={!legalAgreed} className="flex-1 sm:flex-none">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t('consent.confirm', 'Confirm Consent')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}