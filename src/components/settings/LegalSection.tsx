import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, Shield, ScrollText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { openExternalUrl, shouldOpenExternally } from "@/lib/external-links";

/**
 * Legal section for Settings pages
 * Displays Terms of Use, Privacy Policy, and EULA links
 * Required for iOS App Store compliance
 * 
 * On native apps, links open in external browser (Safari/Chrome)
 * On web, links use internal SPA navigation
 */
export const LegalSection = () => {
  const { t } = useTranslation('settings');
  const isNative = shouldOpenExternally();

  const legalItems = [
    {
      icon: FileText,
      title: t('legal.termsOfUse', 'Terms of Use'),
      description: t('legal.termsDesc', 'Our terms and conditions for using FitConnect'),
      href: '/terms',
    },
    {
      icon: Shield,
      title: t('legal.privacyPolicy', 'Privacy Policy'),
      description: t('legal.privacyDesc', 'How we collect, use, and protect your data'),
      href: '/privacy',
    },
    {
      icon: ScrollText,
      title: t('legal.eula', 'End User License Agreement'),
      description: t('legal.eulaDesc', 'License terms for using the FitConnect mobile app'),
      href: '/eula',
    },
  ];

  const handleLegalLinkClick = (href: string) => {
    const fullUrl = `${window.location.origin}${href}`;
    openExternalUrl(fullUrl);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('legal.title', 'Legal')}
          </CardTitle>
          <CardDescription>
            {t('legal.description', 'Review our terms, privacy policy, and license agreements')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {legalItems.map((item) => 
            isNative ? (
              // Native: Use button to open in external browser
              <button
                key={item.href}
                onClick={() => handleLegalLinkClick(item.href)}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ) : (
              // Web: Use React Router Link for SPA navigation
              <Link
                key={item.href}
                to={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalSection;
