import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin, Link, Check, MessageCircle, Mail } from 'lucide-react';
import { share, type ShareOptions } from '@/lib/share';

export interface ShareableAchievement {
  type: 'badge' | 'level' | 'challenge' | 'rank';
  title: string;
  description: string;
  value?: string | number;
  icon?: string;
}

interface ShareAchievementButtonProps {
  achievement: ShareableAchievement;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareAchievementButton({ 
  achievement, 
  variant = 'outline',
  size = 'sm' 
}: ShareAchievementButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    switch (achievement.type) {
      case 'badge':
        return `🏆 I just earned the "${achievement.title}" badge on FitConnect! ${achievement.description}`;
      case 'level':
        return `⬆️ Level Up! I just reached Level ${achievement.value} on FitConnect!\n💪 ${achievement.description}`;
      case 'challenge':
        return `🎯 Challenge Complete! I finished "${achievement.title}" on FitConnect!\n${achievement.description}`;
      case 'rank':
        return `📊 I'm ranked #${achievement.value} ${achievement.title} on FitConnect!\n${achievement.description}`;
      default:
        return `🎉 ${achievement.title} - ${achievement.description}`;
    }
  };

  const shareOptions: ShareOptions = {
    title: `FitConnect Achievement: ${achievement.title}`,
    text: getShareText(),
    url: window.location.origin,
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy') => {
    const success = await share(platform, shareOptions);
    if (platform === 'copy' && success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="h-4 w-4 mr-2" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
