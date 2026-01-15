// Shared email template utilities for FitConnect
// Brand colors and configuration

// Default FitConnect mascot avatar for emails
export const DEFAULT_EMAIL_AVATAR = 'Elite_Personal_Trainer_Human';

// Email type to avatar mapping - different mascots for different contexts
export const EMAIL_AVATARS = {
  welcome_coach: 'Elite_Personal_Trainer_Human',
  welcome_client: 'Sprinter_Cheetah',
  password_reset: 'Meditative_Android_Monk',
  booking: 'HIIT_Fox',
  booking_reminder: 'Boxer_Dog',
  booking_accepted: 'Strongman_Bear',
  booking_cancelled: 'Yoga_Wolf',
  message: 'Parkour_Monkey',
  payment: 'Streetwear_Gorilla_Trainer',
  payout: 'Powerlifter_Gorilla',
  newsletter: 'Yoga_Deer_Female',
  connection_request: 'CrossFit_Wolf',
  review_request: 'Weightlifting_Lion',
  new_client: 'Kickboxer_Panther',
  platform_invite: 'Elite_Personal_Trainer_Human',
  session_confirmation: 'HIIT_Fox',
} as const;

export type EmailType = keyof typeof EMAIL_AVATARS;

export function getEmailAvatarUrl(emailType: EmailType, supabaseUrl: string): string {
  const avatarName = EMAIL_AVATARS[emailType] || DEFAULT_EMAIL_AVATAR;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${avatarName}.webp`;
}

export const EMAIL_CONFIG = {
  colors: {
    primary: '#BEFF00',        // Electric lime
    primaryDark: '#9acc00',    // Darker lime
    accent: '#8B5CF6',         // Purple accent
    background: '#0D0D14',     // Ultra-dark background
    cardBg: '#1a1a24',         // Card background
    text: '#ffffff',           // Primary text
    textMuted: '#a0a0a0',      // Muted text
    textDark: '#666666',       // Dark text
    border: 'rgba(190, 255, 0, 0.2)',
  },
  company: {
    name: 'FitConnect',
    supportEmail: 'support@getfitconnect.co.uk',
    website: 'https://getfitconnect.co.uk',
  },
  social: {
    facebook: 'https://facebook.com/FitConnectUK',
    instagram: 'https://instagram.com/get_fit_connect',
    tiktok: 'https://tiktok.com/@getfitconnect',
    x: 'https://x.com/FitConnectUK',
    threads: 'https://www.threads.net/@get_fit_connect',
    linkedin: 'https://www.linkedin.com/company/getfitconnect',
    youtube: 'https://www.youtube.com/@GetFitConnect',
  },
};

// Get avatar URL from storage
export function getAvatarUrl(avatarName: string | null, supabaseUrl: string): string | null {
  if (!avatarName) return null;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${encodeURIComponent(avatarName)}.webp`;
}

// Get the default FitConnect mascot avatar URL
export function getDefaultAvatarUrl(supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/avatars/${DEFAULT_EMAIL_AVATAR}.webp`;
}

// Free-floating avatar component - no frames, larger, natural positioning
// Inspired by modern mascot-style email designs
export function freeFloatingAvatarComponent(
  avatarUrl: string, 
  altText: string, 
  width: number = 180,
  position: 'center' | 'right' | 'left' = 'center'
): string {
  const alignment = position === 'center' ? 'center' : position;
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="${alignment}">
          <img 
            src="${avatarUrl}" 
            alt="${altText}" 
            style="
              width: ${width}px; 
              height: auto;
              display: block;
              max-width: 100%;
            "
          >
        </td>
      </tr>
    </table>
  `;
}

// Base email wrapper with FitConnect branding
export function baseEmailTemplate(content: string, previewText?: string): string {
  const { colors, company, social } = EMAIL_CONFIG;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  ${previewText ? `<meta name="x-apple-disable-message-reformatting">` : ''}
  <title>${company.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${colors.background};
      color: ${colors.text};
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    
    .headline {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    a {
      color: ${colors.primary};
      text-decoration: none;
    }
    
    .email-button {
      display: inline-block;
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
      color: ${colors.background} !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-sizing: border-box;
    }
    
    .email-button-secondary {
      background: transparent !important;
      border: 2px solid ${colors.primary};
      color: ${colors.primary} !important;
    }
    
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      body {
        padding: 16px 12px !important;
      }
      
      .email-container {
        width: 100% !important;
        padding: 24px 16px !important;
        border-radius: 12px !important;
      }
      
      .email-headline {
        font-size: 24px !important;
      }
      
      .email-subheadline {
        font-size: 18px !important;
      }
      
      .email-button {
        display: block !important;
        width: 100% !important;
        padding: 14px 20px !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
      
      .email-button-secondary {
        display: block !important;
        width: 100% !important;
        padding: 12px 20px !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
      
      .info-card {
        padding: 16px !important;
      }
      
      .info-card-label {
        font-size: 13px !important;
      }
      
      .info-card-value {
        font-size: 14px !important;
      }
      
      .social-link {
        display: block !important;
        margin: 8px 0 !important;
      }
      
      .social-separator {
        display: none !important;
      }
      
      .stats-cell {
        display: block !important;
        width: 100% !important;
        padding: 12px 16px !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
      }
      
      .stats-cell:last-child {
        border-bottom: none !important;
      }
      
      .stats-value {
        font-size: 20px !important;
      }
      
      .stats-label {
        font-size: 11px !important;
      }
      
      .avatar-container {
        width: 70px !important;
        height: 70px !important;
      }
      
      .squircle-container {
        width: 80px !important;
        height: 80px !important;
      }
      
      .message-box {
        padding: 14px 16px !important;
        margin: 16px 0 !important;
      }
      
      .footer-text {
        font-size: 11px !important;
      }
    }
  </style>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background}; color: ${colors.text}; padding: 40px 20px; margin: 0;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>` : ''}
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background: linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.background} 100%); border-radius: 16px; padding: 40px; border: 1px solid ${colors.border};">
          <tr>
            <td>
              <!-- Header with Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <h1 class="headline email-headline" style="color: ${colors.primary}; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      FitConnect
                    </h1>
                  </td>
                </tr>
              </table>
              
              <!-- Main Content -->
              ${content}
              
              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td>
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="${social.facebook}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">Facebook</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.instagram}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">Instagram</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.tiktok}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">TikTok</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.x}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">X</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.threads}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">Threads</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.linkedin}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">LinkedIn</a>
                          <span class="social-separator" style="color: ${colors.textDark};">•</span>
                          <a href="${social.youtube}" class="social-link" style="display: inline-block; margin: 0 6px; color: ${colors.textMuted}; font-size: 13px;">YouTube</a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Company Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <p class="footer-text" style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin: 0;">
                            © ${new Date().getFullYear()} ${company.name}. All rights reserved.
                          </p>
                          <p class="footer-text" style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin: 8px 0 0 0;">
                            Need help? <a href="mailto:${company.supportEmail}" style="color: ${colors.textMuted};">Contact Support</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Avatar display component for emails
export function avatarComponent(avatarUrl: string | null, name: string, size: number = 80): string {
  const { colors } = EMAIL_CONFIG;
  
  if (!avatarUrl) {
    // Fallback with initials - use table for better email client support
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr>
          <td align="center" valign="middle" class="avatar-container" style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%); border: 3px solid ${colors.primary};">
            <span style="color: ${colors.background}; font-weight: 700; font-size: ${size / 3}px;">${initials}</span>
          </td>
        </tr>
      </table>
    `;
  }
  
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td align="center">
          <img src="${avatarUrl}" alt="${name}" class="avatar-container" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 3px solid ${colors.primary}; display: block;">
        </td>
      </tr>
    </table>
  `;
}

// Profile image with glow effect
export function profileImageWithGlow(imageUrl: string | null, name: string, size: number = 80): string {
  const { colors } = EMAIL_CONFIG;
  
  if (!imageUrl) {
    return avatarComponent(null, name, size);
  }
  
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius: 50%; box-shadow: 0 0 30px ${colors.primary}40; padding: 4px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);">
                <img src="${imageUrl}" alt="${name}" class="avatar-container" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; display: block;">
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// Squircle avatar component for emails (iOS-style rounded square)
export function squircleAvatarComponent(avatarUrl: string, name: string, size: number = 100): string {
  const { colors } = EMAIL_CONFIG;
  
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px auto;">
      <tr>
        <td align="center">
          <!-- Squircle container with gradient border -->
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="squircle-container" style="width: ${size}px; height: ${size}px; border-radius: 30%; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%); padding: 3px;">
                <img 
                  src="${avatarUrl}" 
                  alt="${name}" 
                  style="
                    width: 100%; 
                    height: 100%; 
                    border-radius: 30%; 
                    object-fit: cover;
                    object-position: top;
                    display: block;
                    background-color: ${colors.cardBg};
                  "
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// CTA Button
export function ctaButton(text: string, url: string, secondary: boolean = false): string {
  const { colors } = EMAIL_CONFIG;
  
  if (secondary) {
    return `
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center">
            <a href="${url}" class="email-button email-button-secondary" style="display: inline-block; background: transparent; border: 2px solid ${colors.primary}; color: ${colors.primary}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-sizing: border-box;">${text}</a>
          </td>
        </tr>
      </table>
    `;
  }
  
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center">
          <a href="${url}" class="email-button" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); color: ${colors.background}; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-sizing: border-box;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Info card component - using tables for better email client support
export function infoCard(title: string, items: { label: string; value: string }[]): string {
  const { colors } = EMAIL_CONFIG;
  
  const itemsHtml = items.map((item, index) => `
    <tr>
      <td class="info-card-label" style="color: ${colors.textMuted}; padding: 12px 0; ${index < items.length - 1 ? `border-bottom: 1px solid rgba(255,255,255,0.1);` : ''} font-size: 14px;">${item.label}</td>
      <td class="info-card-value" style="color: ${colors.text}; font-weight: 500; padding: 12px 0; ${index < items.length - 1 ? `border-bottom: 1px solid rgba(255,255,255,0.1);` : ''} text-align: right; font-size: 14px;">${item.value}</td>
    </tr>
  `).join('');
  
  return `
    <table class="info-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <tr>
        <td colspan="2">
          <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${title}</h3>
        </td>
      </tr>
      ${itemsHtml}
    </table>
  `;
}

// Quote/Message box
export function messageBox(message: string, author?: string): string {
  const { colors } = EMAIL_CONFIG;
  
  return `
    <table class="message-box" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(190, 255, 0, 0.1); border-left: 3px solid ${colors.primary}; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <tr>
        <td>
          <p style="color: ${colors.text}; margin: 0; font-style: italic; line-height: 1.6; font-size: 15px;">"${message}"</p>
          ${author ? `<p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 14px;">— ${author}</p>` : ''}
        </td>
      </tr>
    </table>
  `;
}

// Stats/metrics row - responsive table
export function statsRow(stats: { label: string; value: string; icon?: string }[]): string {
  const { colors } = EMAIL_CONFIG;
  
  const statsHtml = stats.map(stat => `
    <td class="stats-cell" style="text-align: center; padding: 16px; min-width: 80px;">
      <div class="stats-value" style="font-size: 24px; font-weight: 700; color: ${colors.primary};">${stat.value}</div>
      <div class="stats-label" style="font-size: 12px; color: ${colors.textMuted}; margin-top: 4px;">${stat.label}</div>
    </td>
  `).join('');
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; margin: 24px 0;">
      <tr>${statsHtml}</tr>
    </table>
  `;
}

// Decorative avatar mascot in corner - simplified for mobile
export function decorativeAvatar(avatarUrl: string, position: 'left' | 'right' = 'right'): string {
  const alignment = position === 'right' ? 'right' : 'left';
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="${alignment}">
          <img src="${avatarUrl}" alt="" style="width: 60px; height: 60px; opacity: 0.3; transform: rotate(${position === 'right' ? '15' : '-15'}deg);">
        </td>
      </tr>
    </table>
  `;
}
