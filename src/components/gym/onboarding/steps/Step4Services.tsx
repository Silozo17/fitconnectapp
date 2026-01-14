import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { 
  Users, 
  User, 
  UsersRound, 
  DoorOpen, 
  Laptop, 
  Blend,
  Dumbbell 
} from 'lucide-react';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step4Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const SERVICES = [
  { id: 'classes', label: 'Classes', icon: Users, description: 'Group fitness classes' },
  { id: 'personal_training', label: '1-1 Personal Training', icon: User, description: 'Private sessions' },
  { id: 'group_training', label: 'Group Training', icon: UsersRound, description: 'Small group sessions' },
  { id: 'open_gym', label: 'Open Gym', icon: DoorOpen, description: 'Self-guided access' },
  { id: 'online_coaching', label: 'Online Coaching', icon: Laptop, description: 'Remote training' },
  { id: 'hybrid', label: 'Hybrid', icon: Blend, description: 'Online + in-person' },
];

export function Step4Services({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
}: Step4Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (serviceId: string) => {
    const current = data.services || [];
    const updated = current.includes(serviceId)
      ? current.filter(s => s !== serviceId)
      : [...current, serviceId];
    updateData({ services: updated });
  };

  const updateServiceSettings = (key: string, value: any) => {
    updateData({
      serviceSettings: {
        ...data.serviceSettings,
        [key]: value,
      },
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (data.services.length === 0) {
      newErrors.services = 'Please select at least one service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  const hasClasses = data.services.includes('classes');
  const hasPersonalTraining = data.services.includes('personal_training');

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Services & offerings"
      subtitle="What do you offer your members?"
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
        {/* Service Selection */}
        <div className="space-y-3">
          <Label>Select all services you offer *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const isSelected = data.services.includes(service.id);
              
              return (
                <label
                  key={service.id}
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleService(service.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium">{service.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {service.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.services && (
            <p className="text-sm text-destructive">{errors.services}</p>
          )}
        </div>

        {/* Conditional Fields for Classes */}
        {hasClasses && (
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Class settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classSize">Average class size</Label>
                <Input
                  id="classSize"
                  type="number"
                  placeholder="e.g., 15"
                  min={1}
                  max={100}
                  value={data.serviceSettings.averageClassSize || ''}
                  onChange={(e) => updateServiceSettings('averageClassSize', parseInt(e.target.value) || undefined)}
                  className="max-w-[200px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly repeating schedule?</Label>
                  <p className="text-xs text-muted-foreground">
                    Same classes repeat each week
                  </p>
                </div>
                <Switch
                  checked={data.serviceSettings.weeklyRepeat || false}
                  onCheckedChange={(checked) => updateServiceSettings('weeklyRepeat', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Fields for Personal Training */}
        {hasPersonalTraining && (
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Personal training settings</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trainerCount">Approximate number of trainers</Label>
              <Input
                id="trainerCount"
                type="number"
                placeholder="e.g., 5"
                min={1}
                max={500}
                value={data.serviceSettings.trainerCount || ''}
                onChange={(e) => updateServiceSettings('trainerCount', parseInt(e.target.value) || undefined)}
                className="max-w-[200px]"
              />
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          You can configure detailed service settings after completing setup
        </p>
      </div>
    </OnboardingLayout>
  );
}
