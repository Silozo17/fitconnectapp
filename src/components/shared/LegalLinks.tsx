import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, Shield } from "lucide-react";

interface LegalLinksProps {
  variant?: "compact" | "full" | "inline";
  showIcons?: boolean;
  className?: string;
}

/**
 * Reusable component for displaying legal links (Terms, Privacy Policy, EULA)
 * Required for iOS App Store compliance - links must be visible before any purchase
 */
export const LegalLinks = ({ 
  variant = "compact", 
  showIcons = false,
  className = "" 
}: LegalLinksProps) => {
  const { t } = useTranslation();

  if (variant === "inline") {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        <Link 
          to="/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {t("legal.termsOfUse", "Terms of Use")}
        </Link>
        {" and "}
        <Link 
          to="/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {t("legal.privacyPolicy", "Privacy Policy")}
        </Link>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="font-medium text-sm">{t("legal.title", "Legal")}</h4>
        <div className="space-y-2">
          <Link 
            to="/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <FileText className="h-4 w-4" />}
            <span>{t("legal.termsOfUse", "Terms of Use")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Link>
          <Link 
            to="/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <Shield className="h-4 w-4" />}
            <span>{t("legal.privacyPolicy", "Privacy Policy")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Link>
          <Link 
            to="/terms#eula" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <FileText className="h-4 w-4" />}
            <span>{t("legal.eula", "End User License Agreement")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Link>
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      <Link 
        to="/terms" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {t("legal.termsOfUse", "Terms of Use")}
      </Link>
      <span className="text-muted-foreground">•</span>
      <Link 
        to="/privacy" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {t("legal.privacyPolicy", "Privacy Policy")}
      </Link>
    </div>
  );
};

/**
 * Legal disclosure text for subscription/purchase screens
 * Required by iOS App Store before any purchase action
 */
export const LegalDisclosure = ({ className = "" }: { className?: string }) => {
  const { t } = useTranslation();
  
  return (
    <p className={`text-xs text-muted-foreground text-center ${className}`}>
      {t("legal.agreementDisclosure", "By continuing, you agree to our")}{" "}
      <LegalLinks variant="inline" />
    </p>
  );
};

export default LegalLinks;
