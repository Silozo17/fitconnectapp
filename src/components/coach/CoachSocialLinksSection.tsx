import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

// Custom icons for platforms without Lucide icons
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.082-1.163 3.583-1.291.933-.08 1.866-.049 2.78.091v-.168c0-.935-.165-1.63-.49-2.066-.358-.478-.95-.72-1.758-.72h-.037c-.792.012-1.411.265-1.842.752-.245.277-.433.614-.561 1.004l-1.982-.593c.227-.69.584-1.298 1.062-1.808.925-.986 2.2-1.504 3.787-1.54h.055c1.676 0 2.995.524 3.92 1.558.847.946 1.286 2.282 1.303 3.973.395.189.768.417 1.114.686 1.108.859 1.86 2.05 2.17 3.442.319 1.433.13 3.396-1.452 4.95-1.815 1.784-4.041 2.548-7.408 2.575zm-1.609-7.168c-.077-.002-.153-.004-.23-.004-1.313 0-2.332.325-2.936.94-.42.426-.631.96-.593 1.502.034.483.29.902.736 1.215.6.422 1.433.618 2.346.551 1.13-.082 2.01-.487 2.617-1.204.535-.63.872-1.522.997-2.654-.906-.202-1.9-.32-2.937-.346z"/>
  </svg>
);

interface SocialLinks {
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  threads_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
}

interface CoachSocialLinksSectionProps {
  values: SocialLinks;
  onChange: (field: keyof SocialLinks, value: string) => void;
  showCard?: boolean;
}

const socialPlatforms = [
  { 
    key: "instagram_url" as const, 
    label: "Instagram", 
    icon: Instagram, 
    placeholder: "https://instagram.com/yourhandle",
    color: "text-pink-500"
  },
  { 
    key: "facebook_url" as const, 
    label: "Facebook", 
    icon: Facebook, 
    placeholder: "https://facebook.com/yourpage",
    color: "text-blue-600"
  },
  { 
    key: "youtube_url" as const, 
    label: "YouTube", 
    icon: Youtube, 
    placeholder: "https://youtube.com/@yourchannel",
    color: "text-red-600"
  },
  { 
    key: "tiktok_url" as const, 
    label: "TikTok", 
    icon: TikTokIcon, 
    placeholder: "https://tiktok.com/@yourhandle",
    color: "text-foreground"
  },
  { 
    key: "x_url" as const, 
    label: "X (Twitter)", 
    icon: XIcon, 
    placeholder: "https://x.com/yourhandle",
    color: "text-foreground"
  },
  { 
    key: "threads_url" as const, 
    label: "Threads", 
    icon: ThreadsIcon, 
    placeholder: "https://threads.net/@yourhandle",
    color: "text-foreground"
  },
  { 
    key: "linkedin_url" as const, 
    label: "LinkedIn", 
    icon: Linkedin, 
    placeholder: "https://linkedin.com/in/yourprofile",
    color: "text-blue-700"
  },
];

export function CoachSocialLinksSection({ values, onChange, showCard = true }: CoachSocialLinksSectionProps) {
  const content = (
    <div className="grid gap-4 sm:grid-cols-2">
      {socialPlatforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <div key={platform.key} className="space-y-2">
            <Label className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${platform.color}`} />
              {platform.label}
            </Label>
            <Input
              type="url"
              value={values[platform.key] || ""}
              onChange={(e) => onChange(platform.key, e.target.value)}
              placeholder={platform.placeholder}
            />
          </div>
        );
      })}
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Social Media Links</CardTitle>
        <CardDescription>
          Add your social media profiles to help clients connect with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}

export { socialPlatforms, type SocialLinks };
