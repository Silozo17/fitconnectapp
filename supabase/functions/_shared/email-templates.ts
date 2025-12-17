// Shared email template utilities for FitConnect
// Brand colors and configuration

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
    supportEmail: 'support@fitconnect.com',
    website: 'https://fitconnect.com',
  },
  social: {
    twitter: 'https://twitter.com/fitconnect',
    instagram: 'https://instagram.com/fitconnect',
    linkedin: 'https://linkedin.com/company/fitconnect',
  },
};

// Get avatar URL from storage
export function getAvatarUrl(avatarName: string | null, supabaseUrl: string): string | null {
  if (!avatarName) return null;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${encodeURIComponent(avatarName)}.png`;
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
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
      color: ${colors.background} !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .button-secondary {
      background: transparent;
      border: 2px solid ${colors.primary};
      color: ${colors.primary} !important;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .button {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${colors.background}; color: ${colors.text}; padding: 40px 20px; margin: 0;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>` : ''}
  
  <div class="container" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, ${colors.cardBg} 0%, ${colors.background} 100%); border-radius: 16px; padding: 40px; border: 1px solid ${colors.border};">
    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 class="headline" style="color: ${colors.primary}; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
        FitConnect
      </h1>
    </div>
    
    <!-- Main Content -->
    ${content}
    
    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <!-- Social Links -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${social.twitter}" style="display: inline-block; margin: 0 8px; color: ${colors.textMuted};">Twitter</a>
        <span style="color: ${colors.textDark};">•</span>
        <a href="${social.instagram}" style="display: inline-block; margin: 0 8px; color: ${colors.textMuted};">Instagram</a>
        <span style="color: ${colors.textDark};">•</span>
        <a href="${social.linkedin}" style="display: inline-block; margin: 0 8px; color: ${colors.textMuted};">LinkedIn</a>
      </div>
      
      <!-- Company Info -->
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} ${company.name}. All rights reserved.
      </p>
      <p style="color: ${colors.textDark}; font-size: 12px; text-align: center; margin: 8px 0 0 0;">
        Need help? <a href="mailto:${company.supportEmail}" style="color: ${colors.textMuted};">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Avatar display component for emails
export function avatarComponent(avatarUrl: string | null, name: string, size: number = 80): string {
  const { colors } = EMAIL_CONFIG;
  
  if (!avatarUrl) {
    // Fallback with initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return `
      <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 3px solid ${colors.primary};">
        <span style="color: ${colors.background}; font-weight: 700; font-size: ${size / 3}px;">${initials}</span>
      </div>
    `;
  }
  
  return `
    <img src="${avatarUrl}" alt="${name}" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 3px solid ${colors.primary}; display: block; margin: 0 auto;">
  `;
}

// Profile image with glow effect
export function profileImageWithGlow(imageUrl: string | null, name: string, size: number = 80): string {
  const { colors } = EMAIL_CONFIG;
  
  if (!imageUrl) {
    return avatarComponent(null, name, size);
  }
  
  return `
    <div style="text-align: center;">
      <div style="display: inline-block; border-radius: 50%; box-shadow: 0 0 30px ${colors.primary}40; padding: 4px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%);">
        <img src="${imageUrl}" alt="${name}" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; display: block;">
      </div>
    </div>
  `;
}

// CTA Button
export function ctaButton(text: string, url: string, secondary: boolean = false): string {
  const { colors } = EMAIL_CONFIG;
  
  if (secondary) {
    return `
      <a href="${url}" style="display: inline-block; background: transparent; border: 2px solid ${colors.primary}; color: ${colors.primary}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${text}</a>
    `;
  }
  
  return `
    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); color: ${colors.background}; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${text}</a>
  `;
}

// Info card component
export function infoCard(title: string, items: { label: string; value: string }[]): string {
  const { colors } = EMAIL_CONFIG;
  
  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span style="color: ${colors.textMuted};">${item.label}</span>
      <span style="color: ${colors.text}; font-weight: 500;">${item.value}</span>
    </div>
  `).join('');
  
  return `
    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="color: ${colors.primary}; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${title}</h3>
      ${itemsHtml}
    </div>
  `;
}

// Quote/Message box
export function messageBox(message: string, author?: string): string {
  const { colors } = EMAIL_CONFIG;
  
  return `
    <div style="background: rgba(190, 255, 0, 0.1); border-left: 3px solid ${colors.primary}; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="color: ${colors.text}; margin: 0; font-style: italic; line-height: 1.6;">"${message}"</p>
      ${author ? `<p style="color: ${colors.textMuted}; margin: 8px 0 0 0; font-size: 14px;">— ${author}</p>` : ''}
    </div>
  `;
}

// Stats/metrics row
export function statsRow(stats: { label: string; value: string; icon?: string }[]): string {
  const { colors } = EMAIL_CONFIG;
  
  const statsHtml = stats.map(stat => `
    <td style="text-align: center; padding: 16px;">
      <div style="font-size: 24px; font-weight: 700; color: ${colors.primary};">${stat.value}</div>
      <div style="font-size: 12px; color: ${colors.textMuted}; margin-top: 4px;">${stat.label}</div>
    </td>
  `).join('');
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border-radius: 12px; margin: 24px 0;">
      <tr>${statsHtml}</tr>
    </table>
  `;
}

// Decorative avatar mascot in corner
export function decorativeAvatar(avatarUrl: string, position: 'left' | 'right' = 'right'): string {
  const positionStyle = position === 'right' ? 'right: -20px;' : 'left: -20px;';
  
  return `
    <div style="position: relative;">
      <img src="${avatarUrl}" alt="" style="position: absolute; ${positionStyle} top: -30px; width: 60px; height: 60px; opacity: 0.3; transform: rotate(${position === 'right' ? '15' : '-15'}deg);">
    </div>
  `;
}
