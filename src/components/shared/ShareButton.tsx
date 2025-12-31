import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin, Link, Check, MessageCircle, Mail } from 'lucide-react';
import { useShareManager, type ShareOptions } from '@/hooks/useShareManager';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ShareButton = forwardRef<HTMLButtonElement, ShareButtonProps>(({ 
  title,
  text,
  url,
  variant = 'outline',
  size = 'sm',
  className = ''
}, ref) => {
  const [copied, setCopied] = useState(false);
  const { share, triggerNativeShare, shouldShowNativeButton, isDespia } = useShareManager();

  const shareOptions: ShareOptions = { title, text, url };

  // Synchronous handler - preserves user gesture for Safari iOS
  const handleNativeShare = () => {
    triggerNativeShare(shareOptions);
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy') => {
    const success = await share(platform, shareOptions);
    if (platform === 'copy' && success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // For Despia or mobile with native share and icon size, show simple button
  if (isDespia || (size === 'icon' && shouldShowNativeButton())) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={handleNativeShare}
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} aria-label="Share options">
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Share</span>}
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
});

ShareButton.displayName = "ShareButton";
