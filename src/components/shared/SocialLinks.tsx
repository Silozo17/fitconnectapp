import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { usePlatformContact } from "@/hooks/usePlatformContact";

// X (Twitter) icon - custom since lucide has the old Twitter bird
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Threads icon - custom since lucide doesn't have it
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.733 2.072-1.166 3.547-1.29.878-.073 1.77-.06 2.663.043-.078-.733-.318-1.307-.722-1.715-.494-.5-1.258-.76-2.265-.773l-.037-.001c-.775.007-1.775.218-2.39.87l-1.478-1.405c.975-1.027 2.389-1.547 3.86-1.582h.055c1.54.021 2.783.477 3.695 1.357.866.834 1.378 1.99 1.527 3.437.387.107.752.238 1.092.396 1.27.592 2.246 1.49 2.82 2.6.825 1.598.9 4.357-1.258 6.468-1.852 1.814-4.133 2.607-7.394 2.632z"/>
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
