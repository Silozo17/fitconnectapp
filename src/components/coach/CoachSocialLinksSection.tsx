import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { XIcon, ThreadsIcon } from "@/components/icons/SocialIcons";

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
