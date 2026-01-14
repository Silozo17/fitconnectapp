import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Building2, Globe, FileText } from 'lucide-react';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step2Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const BUSINESS_TYPES = [
  { id: 'gym', label: 'Gym' },
  { id: 'fitness_studio', label: 'Fitness Studio' },
  { id: 'martial_arts', label: 'Martial Arts / Boxing' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'yoga_pilates', label: 'Yoga / Pilates' },
  { id: 'other', label: 'Other' },
];

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'IE', name: 'Ireland', currency: 'EUR' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
];

const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function Step2GymBasics({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
}: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleBusinessType = (typeId: string) => {
    const current = data.businessTypes || [];
    const updated = current.includes(typeId)
      ? current.filter(t => t !== typeId)
      : [...current, typeId];
    updateData({ businessTypes: updated });
  };

  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    if (country) {
      updateData({ 
        country: countryName,
        currency: country.currency,
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.gymName.trim()) {
      newErrors.gymName = 'Gym name is required';
    }

    if (data.businessTypes.length === 0) {
      newErrors.businessTypes = 'Please select at least one business type';
    }

    if (!data.country) {
      newErrors.country = 'Please select a country';
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
      title="Tell us about your gym"
      subtitle="Help us customize your experience"
      showBackButton
      onBack={onBack}
      onSkip={() => onNext()}
      skipLabel="Skip description"
      footerActions={{
        primary: {
          label: 'Continue',
          onClick: handleSubmit,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-6">
        {/* Gym Name */}
        <div className="space-y-2">
          <Label htmlFor="gymName">Gym name *</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="gymName"
              type="text"
              placeholder="e.g., Iron Fitness Studio"
              value={data.gymName}
              onChange={(e) => updateData({ gymName: e.target.value })}
              className="pl-10"
            />
          </div>
          {errors.gymName && (
            <p className="text-sm text-destructive">{errors.gymName}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="website"
              type="url"
              placeholder="https://www.yourgym.com"
              value={data.website}
              onChange={(e) => updateData({ website: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Business Types */}
        <div className="space-y-3">
          <Label>What type of business do you run? *</Label>
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((type) => (
              <label
                key={type.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${data.businessTypes.includes(type.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}
                `}
              >
                <Checkbox
                  checked={data.businessTypes.includes(type.id)}
                  onCheckedChange={() => toggleBusinessType(type.id)}
                />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
          {errors.businessTypes && (
            <p className="text-sm text-destructive">{errors.businessTypes}</p>
          )}
        </div>

        {/* Country & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country *</Label>
            <Select value={data.country} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={data.currency} onValueChange={(v) => updateData({ currency: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Short description (optional)
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              id="description"
              placeholder="Tell potential members what makes your gym special..."
              value={data.description}
              onChange={(e) => updateData({ description: e.target.value })}
              className="pl-10 min-h-[100px]"
              maxLength={500}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {data.description.length}/500
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
