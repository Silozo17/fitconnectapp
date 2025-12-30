import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { XIcon, ThreadsIcon } from "@/components/icons/SocialIcons";
import { usePlatformContact } from "@/hooks/usePlatformContact";

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

  // Order: Facebook, Instagram, TikTok, X, Threads, LinkedIn, YouTube
  const socialLinks = [
    { name: "Facebook", href: socials.facebook, icon: Facebook },
    { name: "Instagram", href: socials.instagram, icon: Instagram },
    { name: "TikTok", href: socials.tiktok, icon: TikTokIcon },
    { name: "X", href: socials.x, icon: XIcon },
    { name: "Threads", href: socials.threads, icon: ThreadsIcon },
    { name: "LinkedIn", href: socials.linkedin, icon: Linkedin },
    { name: "YouTube", href: socials.youtube, icon: Youtube },
  ];

  const linkClasses = variant === "light" 
    ? "text-foreground/70 hover:text-foreground transition-colors"
    : "text-muted-foreground hover:text-primary transition-colors";

  // Filter out social links without valid URLs
  const activeSocialLinks = socialLinks.filter(
    (social) => social.href && social.href !== "#" && social.href.trim() !== ""
  );

  if (activeSocialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {activeSocialLinks.map((social) => (
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
