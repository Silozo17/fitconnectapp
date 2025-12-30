import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { XIcon } from "@/components/icons/XIcon";
import { ThreadsIcon } from "@/components/icons/ThreadsIcon";

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