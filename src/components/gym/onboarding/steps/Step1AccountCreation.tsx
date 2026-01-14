import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validatePassword } from '@/utils/passwordValidation';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step1Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

export function Step1AccountCreation({
  data,
  updateData,
  onNext,
  isLoading,
  currentStep,
  totalSteps,
}: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.ownerName.trim()) {
      newErrors.ownerName = 'Full name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0] || 'Password is not strong enough';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Create your account"
      subtitle="Let's get you set up in less than 5 minutes"
      headerLogo
      footerActions={{
        primary: {
          label: 'Create account',
          onClick: handleSubmit,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-5">
        {/* Owner Name */}
        <div className="space-y-2">
          <Label htmlFor="ownerName">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="ownerName"
              type="text"
              placeholder="John Smith"
              value={data.ownerName}
              onChange={(e) => updateData({ ownerName: e.target.value })}
              className="pl-10"
              autoComplete="name"
            />
          </div>
          {errors.ownerName && (
            <p className="text-sm text-destructive">{errors.ownerName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@yourgym.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="pl-10"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+44 7123 456789"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              className="pl-10"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              className="pl-10 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {data.password && (
            <PasswordStrengthIndicator password={data.password} />
          )}
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </OnboardingLayout>
  );
}
