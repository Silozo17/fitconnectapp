import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react';
import { toast } from 'sonner';

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
    const baseUrl = window.location.origin;
    
    switch (achievement.type) {
      case 'badge':
        return `🏆 I just earned the "${achievement.title}" badge on FitConnect! ${achievement.description}\n\nJoin me: ${baseUrl}`;
      case 'level':
        return `⬆️ Level Up! I just reached Level ${achievement.value} on FitConnect!\n💪 ${achievement.description}\n\nJoin me: ${baseUrl}`;
      case 'challenge':
        return `🎯 Challenge Complete! I finished "${achievement.title}" on FitConnect!\n${achievement.description}\n\nJoin me: ${baseUrl}`;
      case 'rank':
        return `📊 I'm ranked #${achievement.value} ${achievement.title} on FitConnect!\n${achievement.description}\n\nJoin me: ${baseUrl}`;
      default:
        return `🎉 ${achievement.title} - ${achievement.description}\n\nJoin me on FitConnect: ${baseUrl}`;
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.origin);
    const quote = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
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
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn}>
          <Linkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
