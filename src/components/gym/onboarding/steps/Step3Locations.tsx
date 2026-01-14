import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { VenueAutocomplete } from '@/components/shared/VenueAutocomplete';
import { Phone, Mail, Plus, Trash2, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GymOnboardingData, GymLocationData } from '@/hooks/gym/useGymOnboarding';

interface Step3Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
];

const emptyLocation: GymLocationData = {
  name: '',
  address: '',
  city: '',
  county: '',
  country: '',
  postcode: '',
  phone: '',
  email: '',
  accessType: 'members_only',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isPrimary: false,
};

export function Step3Locations({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
}: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateLocation = (index: number, updates: Partial<GymLocationData>) => {
    const newLocations = [...data.locations];
    newLocations[index] = { ...newLocations[index], ...updates };
    updateData({ locations: newLocations });
  };

  const addLocation = () => {
    updateData({ 
      locations: [...data.locations, { ...emptyLocation }],
      locationType: 'multiple',
    });
  };

  const removeLocation = (index: number) => {
    if (data.locations.length > 1) {
      const newLocations = data.locations.filter((_, i) => i !== index);
      updateData({ locations: newLocations });
    }
  };

  const handleLocationTypeChange = (value: 'single' | 'multiple') => {
    updateData({ locationType: value });
    if (value === 'single' && data.locations.length > 1) {
      updateData({ locations: [data.locations[0]] });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    data.locations.forEach((loc, index) => {
      if (!loc.name.trim()) {
        newErrors[`location_${index}_name`] = 'Location name is required';
      }
      if (!loc.address.trim()) {
        newErrors[`location_${index}_address`] = 'Address is required';
      }
    });

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
      title="Your locations"
      subtitle="Where can members find you?"
      showBackButton
      onBack={onBack}
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
        {/* Location Type Selection */}
        <div className="space-y-3">
          <Label>How many locations do you have?</Label>
          <RadioGroup
            value={data.locationType}
            onValueChange={(v) => handleLocationTypeChange(v as 'single' | 'multiple')}
            className="grid grid-cols-2 gap-3"
          >
            <label className={`
              flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${data.locationType === 'single' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}>
              <RadioGroupItem value="single" />
              <div>
                <p className="font-medium">One location</p>
                <p className="text-xs text-muted-foreground">Single site</p>
              </div>
            </label>
            <label className={`
              flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${data.locationType === 'multiple' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}>
              <RadioGroupItem value="multiple" />
              <div>
                <p className="font-medium">Multiple</p>
                <p className="text-xs text-muted-foreground">Multi-site</p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          {data.locations.map((location, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {index === 0 ? 'Primary Location' : `Location ${index + 1}`}
                  </CardTitle>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLocation(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Venue Search - Auto-populates all fields below */}
                <div className="space-y-2">
                  <Label>Search for your gym/venue</Label>
                  <VenueAutocomplete
                    value={location.address}
                    onVenueChange={(address, venueData) => {
                      updateLocation(index, {
                        address: venueData?.street_address || address,
                        name: location.name || venueData?.name || '',
                        city: venueData?.city || location.city || '',
                        county: venueData?.region || location.county || '',
                        country: venueData?.country || location.country || '',
                        postcode: venueData?.postal_code || location.postcode || '',
                        phone: venueData?.phone || location.phone || '',
                        lat: venueData?.lat,
                        lng: venueData?.lng,
                      });
                    }}
                    placeholder="Search for your gym, studio, fitness center..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Search to auto-fill address details below
                  </p>
                </div>

                {/* Location Name */}
                <div className="space-y-2">
                  <Label>Location name *</Label>
                  <Input
                    placeholder="e.g., Main Branch, Downtown Studio"
                    value={location.name}
                    onChange={(e) => updateLocation(index, { name: e.target.value })}
                  />
                  {errors[`location_${index}_name`] && (
                    <p className="text-sm text-destructive">{errors[`location_${index}_name`]}</p>
                  )}
                </div>

                {/* Street Address */}
                <div className="space-y-2">
                  <Label>Street address *</Label>
                  <Input
                    placeholder="e.g., 123 High Street"
                    value={location.address}
                    onChange={(e) => updateLocation(index, { address: e.target.value })}
                  />
                  {errors[`location_${index}_address`] && (
                    <p className="text-sm text-destructive">{errors[`location_${index}_address`]}</p>
                  )}
                </div>

                {/* City & County */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      placeholder="e.g., Manchester"
                      value={location.city || ''}
                      onChange={(e) => updateLocation(index, { city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>County</Label>
                    <Input
                      placeholder="e.g., Greater Manchester"
                      value={location.county || ''}
                      onChange={(e) => updateLocation(index, { county: e.target.value })}
                    />
                  </div>
                </div>

                {/* Postcode & Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Postcode</Label>
                    <Input
                      placeholder="e.g., M1 2AB"
                      value={location.postcode}
                      onChange={(e) => updateLocation(index, { postcode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="e.g., United Kingdom"
                      value={location.country || ''}
                      onChange={(e) => updateLocation(index, { country: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+44 123 456 7890"
                        value={location.phone}
                        onChange={(e) => updateLocation(index, { phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="location@gym.com"
                        value={location.email}
                        onChange={(e) => updateLocation(index, { email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Access Type & Timezone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Access type</Label>
                    <Select
                      value={location.accessType}
                      onValueChange={(v) => updateLocation(index, { accessType: v as 'members_only' | 'public' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="members_only">Members only</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={location.timezone}
                      onValueChange={(v) => updateLocation(index, { timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Location Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addLocation}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add another location
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            You can add more locations later from your dashboard
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
