import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('gamification');
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    switch (achievement.type) {
      case 'badge':
        return t('share.achievement.badge', { title: achievement.title, description: achievement.description });
      case 'level':
        return t('share.achievement.level', { value: achievement.value, description: achievement.description });
      case 'challenge':
        return t('share.achievement.challenge', { title: achievement.title, description: achievement.description });
      case 'rank':
        return t('share.achievement.rank', { value: achievement.value, title: achievement.title, description: achievement.description });
      default:
        return t('share.achievement.default', { title: achievement.title, description: achievement.description });
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
          {t('share.button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          {t('share.shareOnX')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          {t('share.shareOnFacebook')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2" />
          {t('share.shareOnLinkedin')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          {t('share.shareOnWhatsapp')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="h-4 w-4 mr-2" />
          {t('share.shareViaEmail')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Link className="h-4 w-4 mr-2" />}
          {copied ? t('share.copied') : t('share.copyLink')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
