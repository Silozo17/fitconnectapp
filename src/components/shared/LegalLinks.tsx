import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, Shield } from "lucide-react";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";

interface LegalLinksProps {
  variant?: "compact" | "full" | "inline";
  showIcons?: boolean;
  className?: string;
}

/**
 * Reusable component for displaying legal links (Terms, Privacy Policy, EULA)
 * Required for iOS App Store compliance - links must be visible before any purchase
 * 
 * On native apps, links open in external browser (Safari/Chrome)
 * On web, links use internal SPA navigation
 */
export const LegalLinks = ({ 
  variant = "compact", 
  showIcons = false,
  className = "" 
}: LegalLinksProps) => {
  const { t } = useTranslation();
  const isNative = shouldOpenExternally();

  const handleLegalClick = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    openExternalUrl(fullUrl);
  };

  // Helper to render link or button based on environment
  const LegalLink = ({ to, children, linkClassName }: { to: string; children: React.ReactNode; linkClassName?: string }) => {
    if (isNative) {
      return (
        <button
          onClick={() => handleLegalClick(to)}
          className={linkClassName}
        >
          {children}
        </button>
      );
    }
    return (
      <Link 
        to={to} 
        target="_blank" 
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {children}
      </Link>
    );
  };

  if (variant === "inline") {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        <LegalLink to="/terms" linkClassName="text-primary hover:underline">
          {t("legal.termsOfUse", "Terms of Use")}
        </LegalLink>
        {" and "}
        <LegalLink to="/privacy" linkClassName="text-primary hover:underline">
          {t("legal.privacyPolicy", "Privacy Policy")}
        </LegalLink>
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="font-medium text-sm">{t("legal.title", "Legal")}</h4>
        <div className="space-y-2">
          <LegalLink 
            to="/terms" 
            linkClassName="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <FileText className="h-4 w-4" />}
            <span>{t("legal.termsOfUse", "Terms of Use")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </LegalLink>
          <LegalLink 
            to="/privacy" 
            linkClassName="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <Shield className="h-4 w-4" />}
            <span>{t("legal.privacyPolicy", "Privacy Policy")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </LegalLink>
          <LegalLink 
            to="/eula" 
            linkClassName="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showIcons && <FileText className="h-4 w-4" />}
            <span>{t("legal.eula", "End User License Agreement")}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </LegalLink>
        </div>
      </div>
    );
  }

  // Default compact variant
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      <LegalLink to="/terms" linkClassName="text-primary hover:underline">
        {t("legal.termsOfUse", "Terms of Use")}
      </LegalLink>
      <span className="text-muted-foreground">•</span>
      <LegalLink to="/privacy" linkClassName="text-primary hover:underline">
        {t("legal.privacyPolicy", "Privacy Policy")}
      </LegalLink>
    </div>
  );
};

/**
 * Legal disclosure text for subscription/purchase screens
 * Required by iOS App Store before any purchase action
 * Must include explicit reference to Terms of Use (EULA) per Apple guidelines
 */
export const LegalDisclosure = ({ className = "" }: { className?: string }) => {
  const { t } = useTranslation();
  const isNative = shouldOpenExternally();

  const handleLegalClick = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    openExternalUrl(fullUrl);
  };
  
  return (
    <p className={`text-xs text-muted-foreground text-center ${className}`}>
      {t("legal.agreementDisclosure", "By continuing, you agree to our")}{" "}
      {isNative ? (
        <>
          <button onClick={() => handleLegalClick('/eula')} className="text-primary hover:underline">
            {t("legal.termsEula", "Terms of Use (EULA)")}
          </button>
          {" "}{t("common.and", "and")}{" "}
          <button onClick={() => handleLegalClick('/privacy')} className="text-primary hover:underline">
            {t("legal.privacyPolicy", "Privacy Policy")}
          </button>
        </>
      ) : (
        <>
          <Link to="/eula" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t("legal.termsEula", "Terms of Use (EULA)")}
          </Link>
          {" "}{t("common.and", "and")}{" "}
          <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {t("legal.privacyPolicy", "Privacy Policy")}
          </Link>
        </>
      )}
    </p>
  );
};

export default LegalLinks;
