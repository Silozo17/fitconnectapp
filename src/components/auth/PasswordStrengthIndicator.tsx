import { Check, X, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { validatePassword, getStrengthLabel, getStrengthColor } from '@/utils/passwordValidation';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthIndicatorProps {
  password: string;
  isBreached?: boolean;
  isCheckingBreach?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  isBreached,
  isCheckingBreach 
}: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation('common');
  const validation = validatePassword(password);
  
  if (!password) return null;

  const strengthLabels: Record<number, string> = {
    0: t('auth.passwordWeak'),
    1: t('auth.passwordFair'),
    2: t('auth.passwordGood'),
    3: t('auth.passwordStrong'),
    4: t('auth.passwordVeryStrong'),
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{t('auth.passwordStrength')}</span>
          <span className={cn(
            "font-medium",
            validation.score <= 1 && "text-red-500",
            validation.score === 2 && "text-yellow-500",
            validation.score >= 3 && "text-green-500"
          )}>
            {strengthLabels[validation.score] || getStrengthLabel(validation.score)}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300",
              getStrengthColor(validation.score)
            )}
            style={{ width: `${(validation.score + 1) * 20}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <RequirementItem met={validation.checks.minLength} text={t('auth.minCharacters')} />
        <RequirementItem met={validation.checks.hasUppercase} text={t('auth.uppercaseLetter')} />
        <RequirementItem met={validation.checks.hasLowercase} text={t('auth.lowercaseLetter')} />
        <RequirementItem met={validation.checks.hasNumber} text={t('auth.number')} />
        <RequirementItem met={validation.checks.hasSpecialChar} text={t('auth.specialCharacter')} />
        <RequirementItem met={validation.checks.notCommon} text={t('auth.notCommon')} />
      </div>

      {/* Breach Check Status */}
      {isCheckingBreach && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t('auth.checkingBreaches')}</span>
        </div>
      )}

      {isBreached && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{t('auth.passwordBreached')}</span>
        </div>
      )}

      {!isBreached && !isCheckingBreach && validation.isValid && (
        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 p-2 rounded border border-green-500/20">
          <Shield className="h-4 w-4 flex-shrink-0" />
          <span>{t('auth.passwordSecure')}</span>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5",
      met ? "text-green-500" : "text-muted-foreground"
    )}>
      {met ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      <span>{text}</span>
    </div>
  );
}
