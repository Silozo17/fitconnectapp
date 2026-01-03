import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export const TermsCheckbox = ({ checked, onCheckedChange, error }: TermsCheckboxProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className="mt-0.5"
          aria-describedby={error ? "terms-error" : undefined}
        />
        <Label 
          htmlFor="terms" 
          className="text-sm text-muted-foreground leading-tight cursor-pointer"
        >
          {t("auth.agreeToTerms", "I agree to the")}{" "}
          <Link 
            to="/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {t("auth.termsAndConditions", "Terms & Conditions")}
          </Link>
          {" "}{t("auth.and", "and")}{" "}
          <Link 
            to="/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {t("auth.privacyPolicy", "Privacy Policy")}
          </Link>
        </Label>
      </div>
      {error && (
        <p id="terms-error" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
};
