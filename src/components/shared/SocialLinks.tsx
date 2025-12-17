import { Facebook, Instagram, Youtube } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { usePlatformContact } from "@/hooks/usePlatformContact";

// X (Twitter) icon - custom since lucide has the old Twitter bird
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialLinksProps {
  iconSize?: string;
  className?: string;
  variant?: "default" | "light";
}

export const SocialLinks = ({ 
  iconSize = "h-5 w-5", 
  className = "",
  variant = "default"
}: SocialLinksProps) => {
  const { socials } = usePlatformContact();

  // Order: Facebook, Instagram, TikTok, X, YouTube
  const socialLinks = [
    { name: "Facebook", href: socials.facebook, icon: Facebook },
    { name: "Instagram", href: socials.instagram, icon: Instagram },
    { name: "TikTok", href: socials.tiktok, icon: TikTokIcon },
    { name: "X", href: socials.x, icon: XIcon },
    { name: "YouTube", href: socials.youtube, icon: Youtube },
  ];

  const linkClasses = variant === "light" 
    ? "text-foreground/70 hover:text-foreground transition-colors"
    : "text-muted-foreground hover:text-primary transition-colors";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
          aria-label={social.name}
        >
          <social.icon className={iconSize} />
        </a>
      ))}
    </div>
  );
};
