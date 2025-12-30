import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { XIcon } from "@/components/icons/XIcon";
import { ThreadsIcon } from "@/components/icons/ThreadsIcon";

interface SocialLinksData {
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
  threads_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
}

interface CoachSocialLinksProps {
  socialLinks: SocialLinksData;
}

const socialPlatforms = [
  { 
    key: "instagram_url" as const, 
    label: "Instagram", 
    icon: Instagram, 
    bgClass: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    hoverClass: "hover:shadow-pink-500/25"
  },
  { 
    key: "facebook_url" as const, 
    label: "Facebook", 
    icon: Facebook, 
    bgClass: "bg-[#1877F2]",
    hoverClass: "hover:shadow-blue-500/25"
  },
  { 
    key: "youtube_url" as const, 
    label: "YouTube", 
    icon: Youtube, 
    bgClass: "bg-[#FF0000]",
    hoverClass: "hover:shadow-red-500/25"
  },
  { 
    key: "tiktok_url" as const, 
    label: "TikTok", 
    icon: TikTokIcon, 
    bgClass: "bg-black dark:bg-white dark:text-black",
    hoverClass: "hover:shadow-foreground/25"
  },
  { 
    key: "x_url" as const, 
    label: "X", 
    icon: XIcon, 
    bgClass: "bg-black dark:bg-white dark:text-black",
    hoverClass: "hover:shadow-foreground/25"
  },
  { 
    key: "threads_url" as const, 
    label: "Threads", 
    icon: ThreadsIcon, 
    bgClass: "bg-black dark:bg-white dark:text-black",
    hoverClass: "hover:shadow-foreground/25"
  },
  { 
    key: "linkedin_url" as const, 
    label: "LinkedIn", 
    icon: Linkedin, 
    bgClass: "bg-[#0A66C2]",
    hoverClass: "hover:shadow-blue-600/25"
  },
];

export function CoachSocialLinks({ socialLinks }: CoachSocialLinksProps) {
  const activeSocialLinks = socialPlatforms.filter(
    (platform) => socialLinks[platform.key]
  );

  // Don't render if no social links
  if (activeSocialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {activeSocialLinks.map((platform) => {
        const Icon = platform.icon;
        const url = socialLinks[platform.key];
        
        return (
          <a
            key={platform.key}
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            title={platform.label}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full text-white",
              "transition-all duration-200 hover:scale-110 hover:shadow-lg",
              platform.bgClass,
              platform.hoverClass
            )}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}