// Common weak passwords to block
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123', 'welcome',
  'welcome1', 'admin', 'login', 'starwars', 'hello', 'charlie', 'donald',
  'password2', '123456789', '1234567890', 'qwerty123', 'admin123', 'root',
  'toor', 'pass', 'test', 'guest', 'master123', 'changeme', 'hunter2'
]);

export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4 (weak, fair, good, strong, very strong)
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.has(password.toLowerCase()),
  };

  if (!checks.minLength) {
    errors.push('Password must be at least 8 characters');
  }
  if (!checks.hasUppercase) {
    errors.push('Include at least one uppercase letter');
  }
  if (!checks.hasLowercase) {
    errors.push('Include at least one lowercase letter');
  }
  if (!checks.hasNumber) {
    errors.push('Include at least one number');
  }
  if (!checks.hasSpecialChar) {
    errors.push('Include at least one special character (!@#$%^&*...)');
  }
  if (!checks.notCommon) {
    errors.push('This password is too common');
  }

  // Calculate score (0-4)
  const passedChecks = Object.values(checks).filter(Boolean).length;
  let score = 0;
  
  if (passedChecks >= 6) score = 4;
  else if (passedChecks >= 5) score = 3;
  else if (passedChecks >= 4) score = 2;
  else if (passedChecks >= 3) score = 1;
  else score = 0;

  // Bonus for longer passwords
  if (password.length >= 12 && score < 4) score = Math.min(4, score + 1);
  if (password.length >= 16 && score < 4) score = 4;

  const isValid = checks.minLength && checks.hasUppercase && checks.hasLowercase && 
                  checks.hasNumber && checks.hasSpecialChar && checks.notCommon;

  return { isValid, score, errors, checks };
}

export function getStrengthLabel(score: number): string {
  switch (score) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    default: return 'Very Weak';
  }
}

export function getStrengthColor(score: number): string {
  switch (score) {
    case 0: return 'bg-red-500';
    case 1: return 'bg-orange-500';
    case 2: return 'bg-yellow-500';
    case 3: return 'bg-lime-500';
    case 4: return 'bg-green-500';
    default: return 'bg-red-500';
  }
}

// Generate SHA-1 hash prefix for HaveIBeenPwned API (k-anonymity)
export async function getPasswordHashPrefix(password: string): Promise<{ prefix: string; suffix: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  return {
    prefix: hashHex.substring(0, 5),
    suffix: hashHex.substring(5)
  };
}
