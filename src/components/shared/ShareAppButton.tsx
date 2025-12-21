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
import { share, canUseNativeShare } from '@/lib/share';
import { getAppShareOptions } from '@/lib/shareHelpers';
import { isDespia } from '@/lib/despia';

interface ShareAppButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareAppButton({ 
  variant = 'outline',
  size = 'default',
  className
}: ShareAppButtonProps) {
  const { t } = useTranslation('gamification');
  const [copied, setCopied] = useState(false);

  const shareOptions = getAppShareOptions();

  const handleNativeShare = async () => {
    await share('native', shareOptions);
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy') => {
    const success = await share(platform, shareOptions);
    if (platform === 'copy' && success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // For Despia or mobile with native share, show simple button
  if ((isDespia() || (size === 'icon' && canUseNativeShare()))) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4" />
        {size !== 'icon' && <span className="ml-2">{t('share.shareApp', 'Share App')}</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">{t('share.shareApp', 'Share App')}</span>}
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
