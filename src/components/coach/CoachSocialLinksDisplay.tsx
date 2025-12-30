import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Custom X (Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom Threads icon
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.874-.726 2.132-1.14 3.54-1.166 1.014-.018 1.972.09 2.856.32-.075-.873-.335-1.529-.78-1.963-.52-.507-1.327-.77-2.4-.782h-.104c-.857.012-1.845.168-2.477.533l-.996-1.748c.948-.542 2.263-.844 3.503-.857h.13c1.634.025 2.921.488 3.822 1.378.816.807 1.306 1.958 1.457 3.42.69.168 1.319.396 1.878.684 1.29.664 2.266 1.647 2.823 2.842.752 1.614.823 4.326-1.312 6.418-1.768 1.732-4.012 2.505-7.263 2.528zm-1.235-6.49c-.047-.845.264-1.329.678-1.673.538-.446 1.399-.692 2.427-.71.727-.013 1.397.063 2.003.228-.138 1.109-.498 1.974-1.072 2.574-.613.64-1.538.99-2.747 1.04-.613.025-1.206-.09-1.672-.327-.365-.185-.59-.44-.617-.767v-.365z" />
  </svg>
);

interface SocialLinksData {
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
  threads_url?: string | null;
}

interface CoachSocialLinksDisplayProps {
  socialLinks: SocialLinksData;
  showCard?: boolean;
}

const socialPlatforms = [
  { key: "instagram_url", label: "Instagram", icon: Instagram },
  { key: "facebook_url", label: "Facebook", icon: Facebook },
  { key: "youtube_url", label: "YouTube", icon: Youtube },
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin },
  { key: "tiktok_url", label: "TikTok", icon: TikTokIcon },
  { key: "x_url", label: "X", icon: XIcon },
  { key: "threads_url", label: "Threads", icon: ThreadsIcon },
];

export function CoachSocialLinksDisplay({ socialLinks }: CoachSocialLinksDisplayProps) {
  const activeSocialLinks = socialPlatforms.filter(
    (platform) => socialLinks[platform.key as keyof SocialLinksData]
  );

  if (activeSocialLinks.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {activeSocialLinks.map((platform) => {
          const url = socialLinks[platform.key as keyof SocialLinksData];
          const Icon = platform.icon;

          return (
            <Tooltip key={platform.key}>
              <TooltipTrigger asChild>
                <a
                  href={url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={platform.label}
                >
                  <Icon className="h-6 w-6" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{platform.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
